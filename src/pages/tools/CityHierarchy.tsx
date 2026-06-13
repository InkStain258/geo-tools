import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Slider } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';

const CANVAS_W = 600;
const CANVAS_H = 500;

interface CityNode {
  x: number;
  y: number;
  level: number; // 1=高, 2=中, 3=低
  label: string;
}

const CityHierarchy: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hexSize, setHexSize] = useState(60);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [cities, setCities] = useState<CityNode[]>([
    { x: 300, y: 250, level: 1, label: '中心城市' },
    { x: 200, y: 150, level: 2, label: '中等城市A' },
    { x: 400, y: 150, level: 2, label: '中等城市B' },
    { x: 200, y: 350, level: 2, label: '中等城市C' },
    { x: 400, y: 350, level: 2, label: '中等城市D' },
    { x: 130, y: 90, level: 3, label: '小城镇1' },
    { x: 270, y: 90, level: 3, label: '小城镇2' },
    { x: 330, y: 90, level: 3, label: '小城镇3' },
    { x: 470, y: 90, level: 3, label: '小城镇4' },
    { x: 130, y: 410, level: 3, label: '小城镇5' },
    { x: 270, y: 410, level: 3, label: '小城镇6' },
    { x: 330, y: 410, level: 3, label: '小城镇7' },
    { x: 470, y: 410, level: 3, label: '小城镇8' },
  ]);

  const levelColors = ['#c62828', '#1565C0', '#2E7D32'];
  const levelRadii = [18, 12, 7];
  const levelNames = ['高级城市', '中级城市', '低级城市'];

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

    // Draw hexagons for each city
    cities.forEach((city) => {
      drawHex(ctx, city.x, city.y, hexSize, city.level);
    });

    // Draw connections between cities
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 0.5;
    cities.forEach((c1, i) => {
      cities.forEach((c2, j) => {
        if (j <= i) return;
        const dist = Math.sqrt((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2);
        if (dist < hexSize * 2.5) {
          ctx.beginPath();
          ctx.moveTo(c1.x, c1.y);
          ctx.lineTo(c2.x, c2.y);
          ctx.stroke();
        }
      });
    });

    // Draw city nodes
    cities.forEach((city) => {
      ctx.fillStyle = levelColors[city.level - 1];
      ctx.beginPath();
      ctx.arc(city.x, city.y, levelRadii[city.level - 1], 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = city.level === 1 ? 'bold 9px sans-serif' : '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(city.label, city.x, city.y + levelRadii[city.level - 1] + 12);
    });
    ctx.textAlign = 'start';

    // Legend
    ctx.font = '11px sans-serif';
    levelNames.forEach((name, i) => {
      ctx.fillStyle = levelColors[i];
      ctx.beginPath();
      ctx.arc(20, 20 + i * 20, levelRadii[i], 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.fillText(name, 35, 24 + i * 20);
    });

    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.fillText('拖动城市节点调整位置', 20, 85);
  }, [cities, hexSize, drawHex]);

  useEffect(() => { drawScene(); }, [drawScene]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const idx = cities.findIndex((c) => Math.sqrt((mx - c.x) ** 2 + (my - c.y) ** 2) < 20);
    if (idx >= 0) {
      setDragIdx(idx);
      setOffset({ x: mx - cities[idx].x, y: my - cities[idx].y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragIdx === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
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
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Typography variant="body2" sx={{ color: '#c62828' }}>● 高级城市：服务范围大、数量少</Typography>
          <Typography variant="body2" sx={{ color: '#1565C0' }}>● 中级城市</Typography>
          <Typography variant="body2" sx={{ color: '#2E7D32' }}>● 低级城市：服务范围小、数量多</Typography>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default CityHierarchy;
