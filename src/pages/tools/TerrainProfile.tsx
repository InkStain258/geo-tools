import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { terrainPresets } from '@/data/terrainPresets';
import { getCanvasCoords } from '@/utils/canvasHelper';

const CANVAS_W = 400;
const CANVAS_H = 400;
const PROFILE_W = 400;
const PROFILE_H = 250;

const TerrainProfile: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const contourCanvasRef = useRef<HTMLCanvasElement>(null);
  const profileCanvasRef = useRef<HTMLCanvasElement>(null);
  const [presetId, setPresetId] = useState('mountain');
  const [pointA, setPointA] = useState<{ x: number; y: number } | null>(null);
  const [pointB, setPointB] = useState<{ x: number; y: number } | null>(null);

  const preset = terrainPresets.find((p) => p.id === presetId) || terrainPresets[0];

  /** 生成高度场 */
  const getHeight = useCallback((x: number, y: number): number => {
    const cx = preset.peakX;
    const cy = preset.peakY;
    const dx = (x - cx) / (CANVAS_W * 0.45);
    const dy = (y - cy) / (CANVAS_H * 0.45);
    const dist = Math.sqrt(dx * dx + dy * dy);
    let h = preset.peakHeight * Math.max(0, 1 - dist);

    // Add secondary peaks for realism
    if (presetId === 'saddle') {
      const h1 = 650 * Math.max(0, 1 - Math.sqrt(((x - 130) / 80) ** 2 + ((y - 200) / 100) ** 2));
      const h2 = 650 * Math.max(0, 1 - Math.sqrt(((x - 270) / 80) ** 2 + ((y - 200) / 100) ** 2));
      h = Math.max(h1, h2);
    } else if (presetId === 'valley') {
      const baseH = 700 * Math.max(0, 1 - Math.sqrt(((x - 200) / 180) ** 2 + ((y - 100) / 200) ** 2));
      const baseH2 = 600 * Math.max(0, 1 - Math.sqrt(((x - 200) / 180) ** 2 + ((y - 350) / 200) ** 2));
      const valleyCut = 400 * Math.max(0, 1 - Math.abs(x - 200) / 40);
      h = Math.max(baseH, baseH2) - valleyCut;
    }

    return Math.max(0, h);
  }, [preset, presetId]);

  /** Draw contour map */
  const drawContours = useCallback(() => {
    const canvas = contourCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw background gradient
    for (let y = 0; y < CANVAS_H; y += 2) {
      for (let x = 0; x < CANVAS_W; x += 2) {
        const h = getHeight(x, y);
        const ratio = h / 800;
        const r = Math.floor(34 + (245 - 34) * (1 - ratio));
        const g = Math.floor(139 + (124 - 139) * (1 - ratio));
        const b = Math.floor(34 + (0 - 34) * (1 - ratio));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Draw contour lines
    const intervals = [100, 200, 300, 400, 500, 600, 700];
    intervals.forEach((interval) => {
      ctx.strokeStyle = interval % 200 === 0 ? '#333' : '#666';
      ctx.lineWidth = interval % 200 === 0 ? 1.5 : 0.8;
      ctx.beginPath();

      for (let y = 0; y < CANVAS_H; y += 3) {
        for (let x = 0; x < CANVAS_W; x += 3) {
          const h = getHeight(x, y);
          const hRight = getHeight(x + 3, y);
          const hDown = getHeight(x, y + 3);

          if ((h < interval && hRight >= interval) || (h >= interval && hRight < interval) ||
              (h < interval && hDown >= interval) || (h >= interval && hDown < interval)) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + 1, y + 1);
          }
        }
      }
      ctx.stroke();
    });

    // Draw altitude labels
    ctx.fillStyle = '#333';
    ctx.font = '10px sans-serif';
    ctx.fillText(`${preset.peakHeight}m`, preset.peakX + 5, preset.peakY - 5);

    // Draw profile line
    if (pointA && pointB) {
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(pointA.x, pointA.y);
      ctx.lineTo(pointB.x, pointB.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point A
      ctx.fillStyle = '#F57C00';
      ctx.beginPath();
      ctx.arc(pointA.x, pointA.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('A', pointA.x - 4, pointA.y - 8);

      // Point B
      ctx.fillStyle = '#1565C0';
      ctx.beginPath();
      ctx.arc(pointB.x, pointB.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText('B', pointB.x - 4, pointB.y - 8);
    }
  }, [getHeight, pointA, pointB, preset]);

  /** Draw profile */
  const drawProfile = useCallback(() => {
    const canvas = profileCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, PROFILE_W, PROFILE_H);

    // Background
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, PROFILE_W, PROFILE_H);

    // Axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, PROFILE_H - 30);
    ctx.lineTo(PROFILE_W - 10, PROFILE_H - 30);
    ctx.moveTo(40, PROFILE_H - 30);
    ctx.lineTo(40, 10);
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.font = '10px sans-serif';
    ctx.fillText('距离', PROFILE_W - 40, PROFILE_H - 10);
    ctx.fillText('海拔(m)', 2, 20);

    if (!pointA || !pointB) {
      ctx.fillStyle = '#999';
      ctx.font = '14px sans-serif';
      ctx.fillText('请在等高线图上点击两点确定剖面线', 60, PROFILE_H / 2);
      return;
    }

    const dx = pointB.x - pointA.x;
    const dy = pointB.y - pointA.y;
    const totalDist = Math.sqrt(dx * dx + dy * dy);

    if (totalDist < 5) return;

    const chartW = PROFILE_W - 50;
    const chartH = PROFILE_H - 50;
    const points: { x: number; h: number }[] = [];

    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const px = pointA.x + dx * t;
      const py = pointA.y + dy * t;
      const h = getHeight(px, py);
      points.push({ x: 40 + t * chartW, h });
    }

    const maxH = Math.max(...points.map((p) => p.h), 100);

    // Draw profile fill
    ctx.beginPath();
    ctx.moveTo(40, PROFILE_H - 30);
    points.forEach((p) => {
      const y = PROFILE_H - 30 - (p.h / maxH) * chartH;
      ctx.lineTo(p.x, y);
    });
    ctx.lineTo(40 + chartW, PROFILE_H - 30);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 0, 0, PROFILE_H);
    gradient.addColorStop(0, 'rgba(46,125,50,0.6)');
    gradient.addColorStop(1, 'rgba(46,125,50,0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw profile line
    ctx.beginPath();
    points.forEach((p, i) => {
      const y = PROFILE_H - 30 - (p.h / maxH) * chartH;
      if (i === 0) ctx.moveTo(p.x, y);
      else ctx.lineTo(p.x, y);
    });
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Y axis labels
    ctx.fillStyle = '#333';
    ctx.font = '9px sans-serif';
    for (let i = 0; i <= 4; i++) {
      const val = Math.round((maxH * i) / 4);
      const y = PROFILE_H - 30 - (val / maxH) * chartH;
      ctx.fillText(`${val}`, 2, y + 3);
      ctx.strokeStyle = '#ddd';
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(PROFILE_W - 10, y);
      ctx.stroke();
    }
  }, [pointA, pointB, getHeight]);

  useEffect(() => { drawContours(); }, [drawContours]);
  useEffect(() => { drawProfile(); }, [drawProfile]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e.currentTarget, e);
    if (!pointA || (pointA && pointB)) {
      setPointA({ x, y });
      setPointB(null);
    } else {
      setPointB({ x, y });
    }
  };

  return (
    <ToolPageLayout title="地形剖面生成器" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}>
        {/* Left: Contour map */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>地形预设</InputLabel>
            <Select value={presetId} label="地形预设" onChange={(e) => { setPresetId(e.target.value); setPointA(null); setPointB(null); }}>
              {terrainPresets.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name} - {p.description}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            点击等高线图上两点确定 A-B 剖面线
          </Typography>
          <canvas
            ref={contourCanvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onClick={handleCanvasClick}
            style={{ border: '1px solid #ddd', borderRadius: 8, cursor: 'crosshair', maxWidth: '100%' }}
          />
          <Button variant="outlined" size="small" onClick={() => { setPointA(null); setPointB(null); }}>
            重置剖面线
          </Button>
        </Box>

        {/* Right: Profile */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>地形剖面图</Typography>
          <canvas
            ref={profileCanvasRef}
            width={PROFILE_W}
            height={PROFILE_H}
            style={{ border: '1px solid #ddd', borderRadius: 8, maxWidth: '100%', backgroundColor: '#f9f9f9' }}
          />
          <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
            {preset.name}：{preset.description}
          </Typography>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default TerrainProfile;
