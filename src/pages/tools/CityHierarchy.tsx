import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Slider, ToggleButtonGroup, ToggleButton } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { getCanvasCoords } from '@/utils/canvasHelper';

const CANVAS_W = 600;
const CANVAS_H = 500;

// K-principle definitions for central place theory
type KFactor = 3 | 4 | 7;
interface KPrinciple {
  k: KFactor;
  name: string;
  desc: string;
  ratio: number; // hex spacing ratio
}
const kPrinciples: KPrinciple[] = [
  { k: 3, name: '市场原则 (K=3)', desc: '高级中心服务全部，每个低级中心被3个高级中心瓜分', ratio: 1.0 },
  { k: 4, name: '交通原则 (K=4)', desc: '低级中心沿交通线分布，服从交通最优', ratio: 1.15 },
  { k: 7, name: '行政原则 (K=7)', desc: '低级中心完全被6个高级中心环绕，行政控制最强', ratio: 0.85 },
];

interface CityNode {
  x: number;
  y: number;
  level: number; // 1=高, 2=中, 3=低
  label: string;
  serviceRange: number; // service range in km
  population: string;
}

const CityHierarchy: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hexSize, setHexSize] = useState(60);
  const [kFactor, setKFactor] = useState<KFactor>(3);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const currentK = kPrinciples.find(k => k.k === kFactor)!;

  const [cities, setCities] = useState<CityNode[]>([
    { x: 300, y: 250, level: 1, label: '中心城市', serviceRange: 100, population: '>100万' },
    { x: 200, y: 150, level: 2, label: '中等城市A', serviceRange: 40, population: '20-50万' },
    { x: 400, y: 150, level: 2, label: '中等城市B', serviceRange: 40, population: '20-50万' },
    { x: 200, y: 350, level: 2, label: '中等城市C', serviceRange: 40, population: '20-50万' },
    { x: 400, y: 350, level: 2, label: '中等城市D', serviceRange: 40, population: '20-50万' },
    { x: 130, y: 90, level: 3, label: '小城镇1', serviceRange: 15, population: '1-5万' },
    { x: 270, y: 90, level: 3, label: '小城镇2', serviceRange: 15, population: '1-5万' },
    { x: 330, y: 90, level: 3, label: '小城镇3', serviceRange: 15, population: '1-5万' },
    { x: 470, y: 90, level: 3, label: '小城镇4', serviceRange: 15, population: '1-5万' },
    { x: 130, y: 410, level: 3, label: '小城镇5', serviceRange: 15, population: '1-5万' },
    { x: 270, y: 410, level: 3, label: '小城镇6', serviceRange: 15, population: '1-5万' },
    { x: 330, y: 410, level: 3, label: '小城镇7', serviceRange: 15, population: '1-5万' },
    { x: 470, y: 410, level: 3, label: '小城镇8', serviceRange: 15, population: '1-5万' },
  ]);

  const levelColors = ['#c62828', '#1565C0', '#2E7D32'];
  const levelRadii = [18, 12, 7];
  const levelNames = ['高级中心（大都市）', '中级中心（中等城市）', '低级中心（小城镇）'];
  const levelServiceLabels = ['服务半径~100km', '服务半径~40km', '服务半径~15km'];
  const levelPopLabels = ['人口>100万', '人口20-50万', '人口1-5万'];

  const drawHexGrid = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
    // Draw nested hex grid showing service territories
    const hexHeight = size * Math.sqrt(3);
    const hexWidth = size * 2;
    
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 0.5;
    
    // Draw honeycomb grid around center
    for (let ring = 0; ring <= 2; ring++) {
      for (let i = 0; i < Math.max(1, ring * 6); i++) {
        const angle = (Math.PI / 3) * (i / ring) - Math.PI / 6;
        const hx = cx + ring * hexWidth * 0.75 * Math.cos(angle);
        const hy = cy + ring * hexWidth * 0.75 * Math.sin(angle);
        
        ctx.beginPath();
        for (let s = 0; s < 6; s++) {
          const sa = (Math.PI / 3) * s - Math.PI / 6;
          const px = hx + (size * 0.7) * Math.cos(sa);
          const py = hy + (size * 0.7) * Math.sin(sa);
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  }, []);

  const drawHex = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, level: number) => {
    ctx.strokeStyle = levelColors[level - 1];
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = cx + size * Math.cos(angle);
      const py = cy + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `${levelColors[level - 1]}10`;
    ctx.fill();
  }, []);

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw background hex grid centered on main city
    drawHexGrid(ctx, 300, 250, hexSize);

    // Draw hexagons for each city with K-factor adjusted sizing
    const kRatio = currentK.ratio;
    cities.forEach((city) => {
      const adjustedSize = hexSize * kRatio * (city.level === 1 ? 1.2 : city.level === 2 ? 0.85 : 0.6);
      drawHex(ctx, city.x, city.y, adjustedSize, city.level);
    });

    // Draw service range circles
    cities.forEach((city) => {
      const sr = city.serviceRange * kRatio * (hexSize / 60);
      ctx.strokeStyle = `${levelColors[city.level - 1]}30`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.arc(city.x, city.y, sr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw connections between cities (K-factor dependent)
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;
    cities.forEach((c1, i) => {
      cities.forEach((c2, j) => {
        if (j <= i) return;
        if (c1.level !== c2.level && Math.abs(c1.level - c2.level) === 1) {
          const dist = Math.sqrt((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2);
          if (dist < hexSize * 3) {
            ctx.strokeStyle = c1.level === 1 ? '#c6282880' : '#1565C080';
            ctx.beginPath();
            ctx.moveTo(c1.x, c1.y);
            ctx.lineTo(c2.x, c2.y);
            ctx.stroke();
          }
        }
      });
    });

    // Draw city nodes
    cities.forEach((city) => {
      ctx.fillStyle = levelColors[city.level - 1];
      ctx.beginPath();
      ctx.arc(city.x, city.y, levelRadii[city.level - 1], 0, Math.PI * 2);
      ctx.fill();
      // White border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#333';
      ctx.font = city.level === 1 ? 'bold 10px sans-serif' : '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(city.label, city.x, city.y + levelRadii[city.level - 1] + 12);
      
      // Service range label below
      ctx.fillStyle = levelColors[city.level - 1];
      ctx.font = '7px sans-serif';
      ctx.fillText(`${city.serviceRange}km / ${city.population}`, city.x, city.y + levelRadii[city.level - 1] + 22);
    });
    ctx.textAlign = 'start';

    // Legend
    ctx.font = '11px sans-serif';
    levelNames.forEach((name, i) => {
      ctx.fillStyle = levelColors[i];
      ctx.beginPath();
      ctx.arc(20, 20 + i * 22, levelRadii[i], 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.fillText(name, 35, 24 + i * 22);
      ctx.font = '9px sans-serif';
      ctx.fillText(`${levelServiceLabels[i]} · ${levelPopLabels[i]}`, 35, 38 + i * 22);
      ctx.font = '11px sans-serif';
    });

    // K-factor info
    ctx.fillStyle = '#666';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`${currentK.name}`, 20, 92);
    ctx.font = '9px sans-serif';
    ctx.fillText(currentK.desc, 20, 105);
  }, [cities, hexSize, drawHex, drawHexGrid, currentK]);

  useEffect(() => { drawScene(); }, [drawScene, kFactor]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x: mx, y: my } = getCanvasCoords(e.currentTarget, e);
    const idx = cities.findIndex((c) => Math.sqrt((mx - c.x) ** 2 + (my - c.y) ** 2) < 20);
    if (idx >= 0) {
      setDragIdx(idx);
      setOffset({ x: mx - cities[idx].x, y: my - cities[idx].y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragIdx === null) return;
    const { x: mx, y: my } = getCanvasCoords(e.currentTarget, e);
    setCities((prev) => {
      const next = [...prev];
      next[dragIdx] = { ...next[dragIdx], x: mx - offset.x, y: my - offset.y };
      return next;
    });
  };

  const handleMouseUp = () => { setDragIdx(null); };

  return (
    <ToolPageLayout title="城市等级服务圈" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ border: '1px solid #ddd', borderRadius: 8, maxWidth: '100%', cursor: dragIdx !== null ? 'grabbing' : 'grab' }}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>📐 中心地理论原则 (K值)</Typography>
          <ToggleButtonGroup
            value={kFactor}
            exclusive
            onChange={(_, v) => { if (v) setKFactor(v); }}
            size="small"
            sx={{ mt: 0.5, mb: 1 }}
          >
            {kPrinciples.map((k) => (
              <ToggleButton key={k.k} value={k.k} sx={{ px: 1.5 }}>
                {k.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Typography variant="body2" sx={{ color: '#757575', mb: 2 }}>
            {currentK.desc}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>六边形服务范围大小</Typography>
          <Slider
            value={hexSize}
            onChange={(_, v) => setHexSize(v as number)}
            min={30}
            max={120}
            step={5}
            valueLabelDisplay="auto"
          />
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
          <Typography variant="body2" sx={{ color: '#c62828' }}>
            ● 高级中心：服务范围大、数量少（K={kFactor}时1个）
          </Typography>
          <Typography variant="body2" sx={{ color: '#1565C0' }}>
            ● 中级中心：k-1={kFactor - 1}个
          </Typography>
          <Typography variant="body2" sx={{ color: '#2E7D32' }}>
            ● 低级中心：{(kFactor - 1) * 2}个 · 服务范围小、数量多
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#999', mt: 1, fontSize: '0.75rem' }}>
          💡 克里斯泰勒中心地理论：六边形是最优服务范围形状，拖动节点可调整位置
        </Typography>

        {/* 克里斯泰勒理论详解 */}
        <Box sx={{ bgcolor: '#E8F5E9', p: 1.5, borderRadius: 2, mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>📖 克里斯泰勒中心地理论</Typography>
          <Typography variant="body2" sx={{ fontSize: 12, mb: 0.5 }}>
            <b>提出者：</b>德国地理学家沃尔特·克里斯泰勒（Walter Christaller），1933年发表《南德的中心地》。
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 12, mb: 0.5 }}>
            <b>核心思想：</b>城市等级越高，服务范围越大，数量越少，彼此距离越远。高级中心提供高级商品和服务，低级中心提供日常必需品。
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 12, mb: 0.5 }}>
            <b>K=3 市场原则：</b>高级中心服务范围包含3个次一级中心的服务区。中国实例：上海→长三角城市群（南京/杭州/苏州等）。
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 12, mb: 0.5 }}>
            <b>K=4 交通原则：</b>高级中心位于六边形边的中点上，利于交通线路布局。沿铁路/公路发展。
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 12 }}>
            <b>K=7 行政原则：</b>高级中心完全包含低级中心服务区，行政管理便利。中国实例：省会→地级市→县级市。
          </Typography>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default CityHierarchy;
