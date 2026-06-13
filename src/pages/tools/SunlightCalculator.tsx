import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Slider, TextField, Button } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { calcDeclination, calcDayLength, getDayOfYear } from '@/utils/geoCalculations';

const CANVAS_W = 600;
const CANVAS_H = 500;

const SunlightCalculator: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(22);
  const [queryLat, setQueryLat] = useState(40);
  const [dayLengthResult, setDayLengthResult] = useState<number | null>(null);

  const dayOfYear = getDayOfYear(month, day);
  const declination = calcDeclination(dayOfYear);

  const drawSunlight = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2 + 30;
    const radius = 180;

    // Space background
    ctx.fillStyle = '#1a237e';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H * 0.15);

    // Sun rays on right side
    const sunX = cx + radius + 60;
    const sunY = cy;
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sunX + 22 * Math.cos(angle), sunY + 22 * Math.sin(angle));
      ctx.lineTo(sunX + 30 * Math.cos(angle), sunY + 30 * Math.sin(angle));
      ctx.stroke();
    }

    // Earth body
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Day side (right half illuminated)
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, Math.PI / 2);
    ctx.closePath();
    ctx.fill();

    // Night side (left half darker)
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.fill();

    // Terminator line (晨昏线)
    const declRad = declination * (Math.PI / 180);
    const tiltOffset = Math.sin(declRad) * radius;

    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(tiltOffset) < 5 ? 5 : Math.abs(tiltOffset), radius, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Axis
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius - 20);
    ctx.lineTo(cx, cy + radius + 20);
    ctx.stroke();

    // N/S poles
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('N', cx - 4, cy - radius - 25);
    ctx.fillText('S', cx - 4, cy + radius + 35);

    // Sun's direct point (直射点)
    const directY = cy - (declination / 90) * radius;
    ctx.fillStyle = '#F57C00';
    ctx.beginPath();
    ctx.arc(cx + tiltOffset * 0.5, directY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.fillText(`直射${declination >= 0 ? 'N' : 'S'}${Math.abs(declination).toFixed(1)}°`, cx + tiltOffset * 0.5 + 12, directY + 4);

    // Latitude lines
    const latLines = [0, 23.5, -23.5, 66.5, -66.5];
    const latLabels = ['赤道', '北回归线', '南回归线', '北极圈', '南极圈'];
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 0.8;
    latLines.forEach((lat, i) => {
      const ly = cy - (lat / 90) * radius;
      ctx.beginPath();
      const halfW = Math.sqrt(Math.max(0, radius * radius - (ly - cy) * (ly - cy)));
      ctx.moveTo(cx - halfW, ly);
      ctx.lineTo(cx + halfW, ly);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '9px sans-serif';
      ctx.fillText(latLabels[i], cx + halfW + 3, ly + 3);
    });
    ctx.setLineDash([]);

    // Info text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`${month}月${day}日`, 15, 25);
    ctx.font = '12px sans-serif';
    ctx.fillText(`太阳直射点：${declination >= 0 ? '北纬' : '南纬'} ${Math.abs(declination).toFixed(1)}°`, 15, 45);

    const declAngle = declination;
    ctx.fillText(`直射点纬度 δ = ${declAngle.toFixed(1)}°`, 15, 65);
  }, [month, day, declination]);

  useEffect(() => { drawSunlight(); }, [drawSunlight]);

  const handleCalcDayLength = () => {
    const result = calcDayLength(queryLat, declination);
    setDayLengthResult(result);
  };

  return (
    <ToolPageLayout title="日照图计算器" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}>
        <Box sx={{ flex: 1 }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ border: '1px solid #ddd', borderRadius: 8, maxWidth: '100%' }}
          />
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>日期选择</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Slider value={month} onChange={(_, v) => setMonth(v as number)} min={1} max={12} step={1}
                marks valueLabelDisplay="auto" valueLabelFormat={(v) => `${v}月`} />
            </Box>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              太阳直射点：{declination >= 0 ? '北纬' : '南纬'} {Math.abs(declination).toFixed(1)}°
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>昼夜长短计算</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              type="number"
              label="纬度(°N为正)"
              value={queryLat}
              onChange={(e) => setQueryLat(parseFloat(e.target.value) || 0)}
              sx={{ width: 150 }}
            />
            <Button variant="contained" onClick={handleCalcDayLength} sx={{ bgcolor: '#2E7D32' }}>
              计算
            </Button>
          </Box>
          {dayLengthResult !== null && (
            <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                昼长：{Math.floor(dayLengthResult)}时{Math.round((dayLengthResult % 1) * 60)}分
              </Typography>
              <Typography variant="body1">
                夜长：{Math.floor(24 - dayLengthResult)}时{Math.round(((24 - dayLengthResult) % 1) * 60)}分
              </Typography>
              <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
                {dayLengthResult > 12 ? '昼长夜短' : dayLengthResult < 12 ? '昼短夜长' : '昼夜等长'}
                {queryLat * declination > 0 ? (queryLat > 66.5 && dayLengthResult === 24 ? ' · 极昼' : '') : ''}
                {queryLat * declination < 0 ? (Math.abs(queryLat) > 66.5 && dayLengthResult === 0 ? ' · 极夜' : '') : ''}
              </Typography>
            </Box>
          )}
          <Box sx={{ p: 1.5, bgcolor: '#fff3e0', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>公式</Typography>
            <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
              昼长 = 2/15 × arccos(-tanφ × tanδ)
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>
              φ = 纬度，δ = 直射点纬度 = {declination.toFixed(1)}°
            </Typography>
          </Box>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default SunlightCalculator;
