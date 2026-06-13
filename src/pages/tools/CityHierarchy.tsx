import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Slider,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';

/* ───────── Canvas constants ───────── */
const CANVAS_W = 600;
const CANVAS_H = 420;
const CX = 300;
const CY = 210;

/* ───────── Colour palette ───────── */
const L1_COLOR = '#C62828';   // deep red
const L2_COLOR = '#1565C0';   // rich blue
const L3_COLOR = '#2E7D32';   // green
const L1_FILL = '#FFEBEE';
const L2_FILL = '#E3F2FD';
const LINE_COLOR = '#9E9E9E';
const BG_COLOR = '#FCFCFC';

/* ───────── K-factor definitions ───────── */
type KFactor = 3 | 4 | 7;

interface KDef {
  k: KFactor;
  label: string;
  desc: string;
  l2Count: number;
  l2AngleOffset: number;  // radians – starting angle for L2 ring
}

const K_DEFS: KDef[] = [
  {
    k: 3,
    label: '市场K=3',
    desc: '高级中心服务范围包含3个次级中心区 — 市场最优原则',
    l2Count: 3,
    l2AngleOffset: Math.PI / 2,          // start from top
  },
  {
    k: 4,
    label: '交通K=4',
    desc: '次级中心沿交通线分布，位于高级中心连线中点 — 交通最优原则',
    l2Count: 4,
    l2AngleOffset: Math.PI / 4,          // 45° offset for diamond layout
  },
  {
    k: 7,
    label: '行政K=7',
    desc: '次级中心完全被高级中心服务区包含 — 行政最优原则',
    l2Count: 6,
    l2AngleOffset: 0,
  },
];

/* ───────── Flat-top hexagon helpers ───────── */
const hexVertices = (cx: number, cy: number, r: number): [number, number][] => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
};

const drawHex = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  fill: string,
  stroke: string,
  lineWidth: number,
) => {
  const verts = hexVertices(cx, cy, r);
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(verts[0][0], verts[0][1]);
  for (let i = 1; i < 6; i++) ctx.lineTo(verts[i][0], verts[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

/* ───────── Component ───────── */
const CityHierarchy: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(60);       // 30–100, controls L1 hex radius
  const [kFactor, setKFactor] = useState<KFactor>(3);

  const kd = K_DEFS.find((d) => d.k === kFactor)!;

  /* ─── Canvas drawing ─── */
  const draw = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    cvs.width = CANVAS_W * dpr;
    cvs.height = CANVAS_H * dpr;
    cvs.style.width = `${CANVAS_W}px`;
    cvs.style.height = `${CANVAS_H}px`;
    ctx.scale(dpr, dpr);

    /* ── clear ── */
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    /* ── subtle dot grid ── */
    ctx.fillStyle = '#E8E8E8';
    for (let x = 20; x < CANVAS_W; x += 20) {
      for (let y = 20; y < CANVAS_H; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const r1 = zoom;                        // L1 hex radius
    const r2 = r1 * 0.6;                    // L2 hex radius
    const l2Dist = r1 * 1.5;                // L2 center distance from L1

    /* ── compute L2 positions ── */
    const l2Positions: [number, number][] = [];
    for (let i = 0; i < kd.l2Count; i++) {
      const a = kd.l2AngleOffset + (2 * Math.PI * i) / kd.l2Count;
      l2Positions.push([CX + l2Dist * Math.cos(a), CY + l2Dist * Math.sin(a)]);
    }

    /* ── compute L3 positions (dots between L2 hexagons) ── */
    const l3Positions: [number, number][] = [];

    if (kFactor === 3) {
      // 3 dots at the midpoints between L2 positions, slightly outward
      for (let i = 0; i < 3; i++) {
        const a = kd.l2AngleOffset + (2 * Math.PI * i) / 3 + Math.PI / 3;
        l3Positions.push([CX + l2Dist * 1.18 * Math.cos(a), CY + l2Dist * 1.18 * Math.sin(a)]);
      }
      // 3 more dots closer in
      for (let i = 0; i < 3; i++) {
        const a = kd.l2AngleOffset + (2 * Math.PI * i) / 3 + Math.PI / 3;
        l3Positions.push([CX + l2Dist * 0.55 * Math.cos(a), CY + l2Dist * 0.55 * Math.sin(a)]);
      }
    } else if (kFactor === 4) {
      // 4 dots between L2 hexagons
      for (let i = 0; i < 4; i++) {
        const a = kd.l2AngleOffset + (2 * Math.PI * i) / 4 + Math.PI / 4;
        l3Positions.push([CX + l2Dist * 1.22 * Math.cos(a), CY + l2Dist * 1.22 * Math.sin(a)]);
      }
      // 4 dots further out
      for (let i = 0; i < 4; i++) {
        const a = kd.l2AngleOffset + (2 * Math.PI * i) / 4 + Math.PI / 4;
        l3Positions.push([CX + l2Dist * 1.55 * Math.cos(a), CY + l2Dist * 1.55 * Math.sin(a)]);
      }
    } else {
      // K=7: 6 dots between 6 L2 hexagons, plus outer ring
      for (let i = 0; i < 6; i++) {
        const a = (2 * Math.PI * i) / 6 + Math.PI / 6;
        l3Positions.push([CX + l2Dist * 0.5 * Math.cos(a), CY + l2Dist * 0.5 * Math.sin(a)]);
      }
      for (let i = 0; i < 12; i++) {
        const a = (2 * Math.PI * i) / 12 + Math.PI / 12;
        l3Positions.push([CX + l2Dist * 1.3 * Math.cos(a), CY + l2Dist * 1.3 * Math.sin(a)]);
      }
    }

    /* ── draw connection lines (L1 → L2) ── */
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    l2Positions.forEach(([lx, ly]) => {
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(lx, ly);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    /* ── draw L2 hexagons ── */
    l2Positions.forEach(([lx, ly]) => {
      drawHex(ctx, lx, ly, r2, L2_FILL, L2_COLOR, 2);
    });

    /* ── draw L1 hexagon (on top) ── */
    drawHex(ctx, CX, CY, r1, L1_FILL, L1_COLOR, 3);

    /* ── draw L3 dots (circles, NO hex borders) ── */
    l3Positions.forEach(([lx, ly]) => {
      ctx.fillStyle = L3_COLOR;
      ctx.beginPath();
      ctx.arc(lx, ly, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    /* ── draw city labels ── */
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // L1 label
    ctx.fillStyle = L1_COLOR;
    ctx.font = 'bold 12px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText('中心城市', CX, CY + r1 + 8);
    ctx.fillStyle = '#666';
    ctx.font = '9px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText('(L1 · >100万人)', CX, CY + r1 + 23);

    // L2 labels
    ctx.fillStyle = L2_COLOR;
    ctx.font = 'bold 10px "Microsoft YaHei", "PingFang SC", sans-serif';
    l2Positions.forEach(([lx, ly]) => {
      ctx.fillText('中等城市', lx, ly + r2 + 6);
      ctx.fillStyle = '#888';
      ctx.font = '8px "Microsoft YaHei", "PingFang SC", sans-serif';
      ctx.fillText('(L2 · 20-50万)', lx, ly + r2 + 19);
      ctx.fillStyle = L2_COLOR;
      ctx.font = 'bold 10px "Microsoft YaHei", "PingFang SC", sans-serif';
    });

    // L3 labels (only a few to avoid clutter)
    ctx.fillStyle = L3_COLOR;
    ctx.font = '8px "Microsoft YaHei", "PingFang SC", sans-serif';
    const sampledL3 = l3Positions.filter((_, i) => i % Math.ceil(l3Positions.length / 4) === 0);
    sampledL3.forEach(([lx, ly]) => {
      ctx.fillText('乡镇', lx, ly + 8);
    });

    /* ── title ── */
    ctx.textAlign = 'left';
    ctx.fillStyle = '#333';
    ctx.font = 'bold 13px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText(`${kd.label} · 中心地等级体系`, 14, 24);

    /* ── legend (top-right) ── */
    const lx = CANVAS_W - 175;
    const ly = 10;
    const lw = 162;
    const lh = 78;

    ctx.fillStyle = 'rgba(255,255,255,0.93)';
    ctx.beginPath();
    const lr = 8;
    ctx.moveTo(lx + lr, ly);
    ctx.lineTo(lx + lw - lr, ly);
    ctx.quadraticCurveTo(lx + lw, ly, lx + lw, ly + lr);
    ctx.lineTo(lx + lw, ly + lh - lr);
    ctx.quadraticCurveTo(lx + lw, ly + lh, lx + lw - lr, ly + lh);
    ctx.lineTo(lx + lr, ly + lh);
    ctx.quadraticCurveTo(lx, ly + lh, lx, ly + lh - lr);
    ctx.lineTo(lx, ly + lr);
    ctx.quadraticCurveTo(lx, ly, lx + lr, ly);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.textAlign = 'left';
    const legendItems = [
      { color: L1_COLOR, label: 'L1 高级中心', sub: '>100万人', shape: 'hex' as const },
      { color: L2_COLOR, label: 'L2 中级中心', sub: '20-50万人', shape: 'hex' as const },
      { color: L3_COLOR, label: 'L3 低级中心', sub: '1-5万人', shape: 'dot' as const },
    ];

    legendItems.forEach((item, i) => {
      const y = ly + 16 + i * 21;
      if (item.shape === 'hex') {
        drawHex(ctx, lx + 16, y + 2, 7, `${item.color}22`, item.color, 1.2);
      } else {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(lx + 16, y + 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.fillStyle = '#333';
      ctx.font = 'bold 10px "Microsoft YaHei", "PingFang SC", sans-serif';
      ctx.fillText(item.label, lx + 28, y - 1);
      ctx.fillStyle = '#888';
      ctx.font = '8px "Microsoft YaHei", "PingFang SC", sans-serif';
      ctx.fillText(item.sub, lx + 28, y + 11);
    });
  }, [zoom, kFactor, kd]);

  useEffect(() => {
    draw();
  }, [draw]);

  /* ─── K-factor chip click ─── */
  const handleKChipClick = (k: KFactor) => {
    setKFactor(k);
  };

  return (
    <ToolPageLayout title="城市等级服务圈" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* ════════════════ Canvas ════════════════ */}
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{
            border: '1px solid #E0E0E0',
            borderRadius: 12,
            maxWidth: '100%',
            display: 'block',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        />

        {/* ════════════════ Controls below canvas ════════════════ */}
        <Box sx={{ mt: 2.5 }}>

          {/* ── K-toggle chips ── */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#444' }}>
            中心地理论原则
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap' }}>
            {K_DEFS.map((k) => {
              const active = kFactor === k.k;
              return (
                <Chip
                  key={k.k}
                  label={k.label}
                  onClick={() => handleKChipClick(k.k)}
                  variant={active ? 'filled' : 'outlined'}
                  color={active ? 'primary' : 'default'}
                  sx={{
                    fontWeight: active ? 700 : 400,
                    fontSize: 13,
                    px: 1,
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    ...(active
                      ? { bgcolor: '#1565C0', color: '#fff', '&:hover': { bgcolor: '#0D47A1' } }
                      : { borderColor: '#BDBDBD', color: '#616161', '&:hover': { borderColor: '#1565C0', color: '#1565C0' } }),
                  }}
                />
              );
            })}
          </Box>
          <Typography variant="body2" sx={{ mt: 0.8, color: '#757575', fontSize: 13, lineHeight: 1.6 }}>
            {kd.desc}
          </Typography>

          {/* ── Zoom slider ── */}
          <Box sx={{ mt: 1.5, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#444' }}>
              缩放
            </Typography>
            <Slider
              value={zoom}
              onChange={(_, v) => setZoom(v as number)}
              min={30}
              max={100}
              step={5}
              size="small"
              valueLabelDisplay="auto"
              sx={{ maxWidth: 260, color: '#1565C0' }}
            />
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* ════════════════ Theory panels: 2 columns ════════════════ */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            {/* Left: Chris Taylor theory */}
            <Card
              sx={{
                flex: '1 1 280px',
                bgcolor: '#FFF8E1',
                borderRadius: 3,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                border: '1px solid #FFE082',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#E65100', mb: 1 }}>
                  📐 克里斯泰勒中心地理论
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.75, color: '#424242' }}>
                  <b>提出者：</b>德国地理学家 <b>沃尔特·克里斯泰勒</b>（Walter Christaller）
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.75, color: '#424242' }}>
                  <b>时间：</b>1933年，《南德的中心地》
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.75, color: '#424242' }}>
                  <b>核心思想：</b>城市等级越高，服务范围越大、数量越少、彼此距离越远。
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.75, color: '#424242', mt: 0.5 }}>
                  <b>为何选择六边形？</b><br />
                  ① 无缝覆盖平面（无重叠、无空隙）<br />
                  ② 中心到边缘等距（公平性）<br />
                  ③ 同等周长下面积最大（效率最优）<br />
                  ④ 比三角形/正方形更接近圆形服务区
                </Typography>
              </CardContent>
            </Card>

            {/* Right: Chinese city hierarchy */}
            <Card
              sx={{
                flex: '1 1 280px',
                bgcolor: '#E3F2FD',
                borderRadius: 3,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                border: '1px solid #90CAF9',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0D47A1', mb: 1 }}>
                  🏙 中国城市等级体系
                </Typography>
                {[
                  { tier: '一线城市', count: '4个', desc: '北京、上海、广州、深圳 — 全国性服务中心', color: '#C62828' },
                  { tier: '新一线城市', count: '15个', desc: '成都、武汉、杭州、南京等 — 跨省区域中心', color: '#E65100' },
                  { tier: '二线城市', count: '30个', desc: '省会及经济强市 — 省级服务中心', color: '#1565C0' },
                  { tier: '三/四线城市', count: '~200个', desc: '地级市 — 市域服务中心', color: '#2E7D32' },
                  { tier: '县城/乡镇', count: '~2800个', desc: '县级中心 — 基层服务节点', color: '#6A1B9A' },
                ].map((item) => (
                  <Box key={item.tier} sx={{ display: 'flex', alignItems: 'baseline', mb: 0.6, gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: item.color,
                        flexShrink: 0,
                        mt: 0.5,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.6, color: '#424242' }}>
                      <b>{item.tier}</b> <Typography component="span" sx={{ fontSize: 11.5, color: '#757575' }}>
                        ({item.count})
                      </Typography>
                      ：{item.desc}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>

          {/* ════════════════ Bottom: 高考考点 ════════════════ */}
          <Card
            sx={{
              mt: 2,
              bgcolor: '#E8F5E9',
              borderRadius: 3,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              border: '1px solid #A5D6A7',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1B5E20', mb: 1 }}>
                🎓 高考考点
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.7, color: '#424242', flex: '1 1 240px' }}>
                  • 城市等级与服务范围呈<b>正相关</b>，与数量呈<b>反相关</b>（金字塔结构）<br />
                  • <b>K值越大</b> → 低级中心越多 → 服务网络越密集
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.7, color: '#424242', flex: '1 1 240px' }}>
                  • <b>门槛人口：</b>维持某项服务所需的最低消费者数量<br />
                  • 服务半径与交通便捷度<b>负相关</b>（地铁/高铁扩大服务半径）
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default CityHierarchy;
