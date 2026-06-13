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

  // Calculate sunrise/sunset times
  const calcSunriseSunset = (lat: number, decl: number) => {
    const latRad = lat * (Math.PI / 180);
    const declRad = decl * (Math.PI / 180);
    const cosHA = -Math.tan(latRad) * Math.tan(declRad);
    
    // Clip to [-1, 1]
    const clipped = Math.max(-1, Math.min(1, cosHA));
    const ha = Math.acos(clipped); // half-day arc in radians
    const dayHours = (2 * ha * 12) / Math.PI; // convert to hours
    
    if (cosHA >= 1) return { sunrise: null, sunset: null, dayHours: 24, type: '极昼' };
    if (cosHA <= -1) return { sunrise: null, sunset: null, dayHours: 0, type: '极夜' };
    
    const sunriseHour = 12 - dayHours / 2;
    const sunsetHour = 12 + dayHours / 2;
    
    return {
      sunrise: `${Math.floor(sunriseHour)}:${String(Math.round((sunriseHour % 1) * 60)).padStart(2, '0')}`,
      sunset: `${Math.floor(sunsetHour)}:${String(Math.round((sunsetHour % 1) * 60)).padStart(2, '0')}`,
      dayHours,
      type: '正常',
    };
  };

  const ssInfo = calcSunriseSunset(queryLat, declination);

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

    // Latitude lines - key circles with clearer annotations
    const latLines = [
      { val: 0, label: '赤道 Equator', color: '#FF9800' },
      { val: 23.5, label: '北回归线 Tropic of Cancer', color: '#F44336' },
      { val: -23.5, label: '南回归线 Tropic of Capricorn', color: '#2196F3' },
      { val: 66.5, label: '北极圈 Arctic Circle', color: '#9C27B0' },
      { val: -66.5, label: '南极圈 Antarctic Circle', color: '#00BCD4' },
    ];
    
    latLines.forEach((line) => {
      const ly = cy - (line.val / 90) * radius;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = line.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const halfW = Math.sqrt(Math.max(0, radius * radius - (ly - cy) * (ly - cy)));
      ctx.moveTo(cx - halfW, ly);
      ctx.lineTo(cx + halfW, ly);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels on right side
      ctx.fillStyle = line.color;
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(line.label, cx + halfW + 4, ly + 3);
    });

    // Twilight zone (晨昏蒙影)
    const twilightOffset = 18; // civil twilight is ~6°, but let's use 18 pixels visual
    ctx.fillStyle = 'rgba(255, 193, 7, 0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(tiltOffset) + twilightOffset, radius + twilightOffset * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Second twilight ring
    ctx.fillStyle = 'rgba(255, 152, 0, 0.08)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(tiltOffset) + twilightOffset * 2, radius + twilightOffset * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

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
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>月份选择</Typography>
            <Slider value={month} onChange={(_, v) => setMonth(v as number)} min={1} max={12} step={1}
              marks valueLabelDisplay="auto" valueLabelFormat={(v) => `${v}月`} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>日期选择</Typography>
            <Slider value={day} onChange={(_, v) => setDay(v as number)} min={1} max={31} step={1}
              marks={[{ value: 1, label: '1' }, { value: 15, label: '15' }, { value: 31, label: '31' }]}
              valueLabelDisplay="auto" valueLabelFormat={(v) => `${v}日`} />
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
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>日落日升时间 (纬度{queryLat}°)</Typography>
            {ssInfo.type === '极昼' ? (
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#F57C00' }}>
                🌞 极昼 — 太阳24小时不落
              </Typography>
            ) : ssInfo.type === '极夜' ? (
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565C0' }}>
                🌑 极夜 — 太阳24小时不升
              </Typography>
            ) : (
              <>
                <Typography variant="body2">
                  🌅 日出：{ssInfo.sunrise} | 🌇 日落：{ssInfo.sunset}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  晨昏蒙影（twilight）：日出前/日落后各约30分钟
                </Typography>
              </>
            )}
            <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>
              晨昏线（terminator）将地球分为昼半球与夜半球
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 2 }}>
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
