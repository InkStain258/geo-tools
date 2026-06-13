import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Slider, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { getCanvasCoords } from '@/utils/canvasHelper';

const W = 600, H = 450;
const CX = 300, CY = 225;

type KFactor = 3 | 4 | 7;
interface KDef { k: KFactor; label: string; desc: string; lvl2Count: number; lvl3Count: number; }

const kDefs: KDef[] = [
  { k: 3, label: '市场K=3', desc: '高级中心服务范围包含3个次级中心区（市场最优）', lvl2Count: 3, lvl3Count: 6 },
  { k: 4, label: '交通K=4', desc: '次级中心沿交通线分布，位于高级中心连线中点（交通最优）', lvl2Count: 4, lvl3Count: 8 },
  { k: 7, label: '行政K=7', desc: '次级中心完全被高级中心服务区包含（行政最优）', lvl2Count: 6, lvl3Count: 18 },
];

const L1_COLOR = '#C62828', L2_COLOR = '#1565C0', L3_COLOR = '#2E7D32';

const CityHierarchy: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hexR, setHexR] = useState(55);
  const [kFactor, setKFactor] = useState<KFactor>(3);

  const kd = kDefs.find(d => d.k === kFactor)!;

  /** 六边形顶点 (flat-top, 中心cx/cy, 外接圆半径r) */
  const hexVerts = useCallback((cx: number, cy: number, r: number): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts;
  }, []);

  /** 获取次级节点位置（围绕中心的正多边形） */
  const getRingPositions = useCallback((count: number, radius: number, startAngle: number): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      const a = startAngle + (2 * Math.PI * i) / count;
      pts.push([CX + radius * Math.cos(a), CY + radius * Math.sin(a)]);
    }
    return pts;
  }, []);

  const draw = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);
    // Subtle grid background
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#F0F0F0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const r1 = hexR;       // L1 hex radius
    const r2 = r1 * 0.65;  // L2
    const r3 = r1 * 0.42;  // L3

    // L1 六边形 + 填充
    const h1 = hexVerts(CX, CY, r1);
    ctx.fillStyle = `${L1_COLOR}0D`;
    ctx.strokeStyle = L1_COLOR;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(h1[0][0], h1[0][1]);
    h1.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // L2 六边形环
    const midRingR = r1 * (kFactor === 7 ? 0.55 : 0.6);
    const startA = kFactor === 4 ? Math.PI / kFactor : 0;
    const l2Positions = getRingPositions(kd.lvl2Count, midRingR, startA);

    // L3 六边形 - 分布在L2外围和L1之间
    const l3Positions: [number, number][] = [];
    if (kFactor === 3) {
      // K=3: 6 towns placed between L2 nodes
      for (let i = 0; i < 6; i++) {
        const a = (2 * Math.PI * i) / 6 + Math.PI / 6;
        l3Positions.push([CX + midRingR * 1.05 * Math.cos(a), CY + midRingR * 1.05 * Math.sin(a)]);
      }
    } else if (kFactor === 4) {
      for (let i = 0; i < 8; i++) {
        const a = (2 * Math.PI * i) / 8 + Math.PI / 8;
        const dist = i % 2 === 0 ? midRingR * 0.65 : midRingR * 1.15;
        l3Positions.push([CX + dist * Math.cos(a), CY + dist * Math.sin(a)]);
      }
    } else {
      // K=7: inner ring + outer ring
      for (let i = 0; i < 6; i++) {
        const a = (2 * Math.PI * i) / 6;
        l3Positions.push([CX + midRingR * 0.4 * Math.cos(a), CY + midRingR * 0.4 * Math.sin(a)]);
      }
      for (let i = 0; i < 12; i++) {
        const a = (2 * Math.PI * i) / 12 + Math.PI / 12;
        l3Positions.push([CX + midRingR * 1.15 * Math.cos(a), CY + midRingR * 1.15 * Math.sin(a)]);
      }
    }

    // Draw L2 hexagons
    l2Positions.forEach(([lx, ly]) => {
      const hv = hexVerts(lx, ly, r2);
      ctx.fillStyle = `${L2_COLOR}0D`;
      ctx.strokeStyle = L2_COLOR;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hv[0][0], hv[0][1]);
      hv.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
      ctx.closePath(); ctx.fill(); ctx.stroke();
    });

    // Draw L3 hexagons
    l3Positions.forEach(([lx, ly]) => {
      const hv = hexVerts(lx, ly, r3);
      ctx.fillStyle = `${L3_COLOR}0D`;
      ctx.strokeStyle = L3_COLOR;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hv[0][0], hv[0][1]);
      hv.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
      ctx.closePath(); ctx.fill(); ctx.stroke();
    });

    // Connection lines: L1→L2
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 4]);
    l2Positions.forEach(([lx, ly]) => {
      ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(lx, ly); ctx.stroke();
    });
    ctx.setLineDash([]);

    // City nodes
    const drawNode = (x: number, y: number, level: number, label: string, pop: string) => {
      const rad = level === 1 ? 14 : level === 2 ? 10 : 6;
      const color = [L1_COLOR, L2_COLOR, L3_COLOR][level - 1];
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#222';
      ctx.font = `bold ${level === 1 ? 11 : level === 2 ? 9 : 8}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + rad + 13);
      ctx.fillStyle = color;
      ctx.font = '7px sans-serif';
      ctx.fillText(pop, x, y + rad + 22);
    };

    drawNode(CX, CY, 1, '中心城市 (L1)', '>100万人');
    l2Positions.forEach(([x, y], i) => drawNode(x, y, 2, `中等城市${i + 1}`, '20-50万'));
    l3Positions.forEach(([x, y], i) => drawNode(x, y, 3, `镇${i + 1}`, '1-5万'));

    ctx.textAlign = 'start';

    // Legend (top-right compact)
    const lx = W - 170, ly = 10;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillRect(lx, ly, 160, 80);
    ctx.strokeStyle = '#DDD'; ctx.lineWidth = 0.5; ctx.strokeRect(lx, ly, 160, 80);

    [
      { c: L1_COLOR, t: 'L1 高级中心', s: '>100万 / ~100km' },
      { c: L2_COLOR, t: 'L2 中级中心', s: '20-50万 / ~40km' },
      { c: L3_COLOR, t: 'L3 低级中心', s: '1-5万 / ~15km' },
    ].forEach((l, i) => {
      ctx.fillStyle = l.c;
      ctx.beginPath(); ctx.arc(lx + 18, ly + 16 + i * 20, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#333';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(l.t, lx + 30, ly + 20 + i * 20);
      ctx.font = '8px sans-serif';
      ctx.fillText(l.s, lx + 30, ly + 32 + i * 20);
    });

    // K label
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`${kd.label}`, 12, 25);
  }, [hexR, kFactor, kd, hexVerts, getRingPositions]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <ToolPageLayout title="城市等级服务圈" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <canvas ref={canvasRef} width={W} height={H}
          style={{ border: '1px solid #ddd', borderRadius: 8, maxWidth: '100%' }}
        />
        {/* Controls */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>中心地理论原则</Typography>
            <ToggleButtonGroup value={kFactor} exclusive size="small"
              onChange={(_, v) => { if (v) setKFactor(v); }} sx={{ mt: 0.5 }}>
              {kDefs.map(k => <ToggleButton key={k.k} value={k.k} sx={{ px: 1.5, fontSize: 12 }}>{k.label}</ToggleButton>)}
            </ToggleButtonGroup>
            <Typography variant="body2" sx={{ color: '#757575', mt: 0.5, fontSize: 12 }}>
              {kd.desc}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 150 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>缩放</Typography>
            <Slider value={hexR} onChange={(_, v) => setHexR(v as number)}
              min={30} max={100} step={5} size="small" valueLabelDisplay="auto" />
          </Box>
        </Box>

        {/* Hierarchy table */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1.5 }}>
          {[
            { c: L1_COLOR, lbl: 'L1 高级中心', n: 1, ex: '上海、北京、东京、纽约' },
            { c: L2_COLOR, lbl: 'L2 中级中心', n: kd.lvl2Count, ex: '省会城市、区域中心' },
            { c: L3_COLOR, lbl: 'L3 低级中心', n: kd.lvl3Count, ex: '县城、乡镇' },
          ].map(l => (
            <Box key={l.lbl} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Chip label={l.lbl} size="small"
                sx={{ bgcolor: `${l.c}18`, color: l.c, fontWeight: 700, border: `1px solid ${l.c}40`, fontSize: 11 }} />
              <Typography variant="caption" sx={{ color: '#666' }}>
                数量: {l.n} · 例: {l.ex}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Theory panels */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
          <Box sx={{ flex: '1 1 280px', bgcolor: '#FFF8E1', p: 1.5, borderRadius: 2, border: '1px solid #FFE082' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#F57F17' }}>📐 克里斯泰勒中心地理论</Typography>
            <Typography variant="body2" sx={{ fontSize: 11, mt: 0.5 }}>
              德国地理学家<b>克里斯泰勒</b>（1933）提出：城市等级越高，服务范围越大、数量越少、彼此距离越远。
              六边形是最优市场区形状（无缝、等距、面积最大）。
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 280px', bgcolor: '#E3F2FD', p: 1.5, borderRadius: 2, border: '1px solid #90CAF9' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0' }}>🏙 中国城市等级体系</Typography>
            <Typography variant="body2" sx={{ fontSize: 11, mt: 0.5 }}>
              <b>一线城市（国家中心）：</b>北京、上海、广州、深圳 — 全国性服务功能<br />
              <b>新一线/二线（区域中心）：</b>成都、武汉、南京等15个 — 跨省服务<br />
              <b>三四线（地方中心）：</b>地级市 — 市域服务 · <b>县城/乡镇：</b>基层中心
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 280px', bgcolor: '#E8F5E9', p: 1.5, borderRadius: 2, border: '1px solid #A5D6A7' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2E7D32' }}>🎓 高考考点</Typography>
            <Typography variant="body2" sx={{ fontSize: 11, mt: 0.5 }}>
              • 城市等级与服务范围呈<b>正相关</b>，与数量呈<b>反相关</b>（金字塔结构）<br />
              • K值越大→低级中心越多→服务网络越密<br />
              • 门槛人口：维持某项服务所需的最低消费者数量<br />
              • 服务半径与交通便捷度负相关（地铁扩大半径）
            </Typography>
          </Box>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default CityHierarchy;
