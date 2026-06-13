import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { calcSunAltitude, calcDeclination, getDayOfYear } from '@/utils/geoCalculations';

const CANVAS_W = 500;
const CANVAS_H = 350;

const SunAltitude: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [latitude, setLatitude] = useState(40);
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(22);
  const [altitude, setAltitude] = useState<number | null>(null);

  const dayOfYear = getDayOfYear(month, day);
  const declination = calcDeclination(dayOfYear);

  const drawDiagram = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const groundY = CANVAS_H - 60;
    const centerX = CANVAS_W / 2;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#e3f2fd');
    skyGrad.addColorStop(1, '#bbdefb');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_W, groundY);

    // Ground
    ctx.fillStyle = '#a5d6a7';
    ctx.fillRect(0, groundY, CANVAS_W, CANVAS_H - groundY);

    // Ground line
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(CANVAS_W, groundY);
    ctx.stroke();

    // Observer
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(centerX, groundY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '11px sans-serif';
    ctx.fillText('观测者', centerX - 15, groundY + 20);

    if (altitude !== null) {
      const altRad = altitude * (Math.PI / 180);

      // Sun ray
      const rayLen = 200;
      const sunX = centerX + rayLen * Math.cos(altRad);
      const sunY = groundY - rayLen * Math.sin(altRad);

      // Sun ray line
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(centerX, groundY);
      ctx.lineTo(sunX, sunY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sun
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Angle arc
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, groundY, 50, -altRad, 0);
      ctx.stroke();

      // Angle label
      const labelAngle = -altRad / 2;
      ctx.fillStyle = '#F57C00';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`H = ${altitude.toFixed(1)}°`, centerX + 55 * Math.cos(labelAngle), groundY + 55 * Math.sin(labelAngle));

      // Horizontal reference
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(centerX, groundY);
      ctx.lineTo(centerX + 120, groundY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vertical reference
      ctx.beginPath();
      ctx.moveTo(centerX, groundY);
      ctx.lineTo(centerX, groundY - 120);
      ctx.stroke();

      // Zenith label
      ctx.fillStyle = '#666';
      ctx.font = '10px sans-serif';
      ctx.fillText('天顶', centerX - 12, groundY - 125);
    } else {
      ctx.fillStyle = '#999';
      ctx.font = '14px sans-serif';
      ctx.fillText('输入参数后点击计算', centerX - 60, CANVAS_H / 2);
    }

    // Title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('正午太阳高度角示意图', 10, 20);
  }, [altitude]);

  useEffect(() => { drawDiagram(); }, [drawDiagram]);

  const handleCalc = () => {
    const h = calcSunAltitude(latitude, declination);
    setAltitude(h);
  };

  return (
    <ToolPageLayout title="正午太阳高度角计算器" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}>
        <Box sx={{ flex: 1 }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ border: '1px solid #ddd', borderRadius: 8, maxWidth: '100%' }}
          />
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>输入参数</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              size="small" type="number"
              label="纬度(°N为正)"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
              sx={{ width: 140 }}
            />
            <TextField
              size="small" type="number"
              label="月份"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value) || 1)}
              sx={{ width: 100 }}
              slotProps={{ htmlInput: { min: 1, max: 12 } }}
            />
            <TextField
              size="small" type="number"
              label="日期"
              value={day}
              onChange={(e) => setDay(parseInt(e.target.value) || 1)}
              sx={{ width: 100 }}
              slotProps={{ htmlInput: { min: 1, max: 31 } }}
            />
          </Box>
          <Button variant="contained" onClick={handleCalc} sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}>
            计算高度角
          </Button>

          {altitude !== null && (
            <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#2E7D32' }}>
                H = {altitude.toFixed(1)}°
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                直射点纬度 δ = {declination >= 0 ? 'N' : 'S'} {Math.abs(declination).toFixed(1)}°
              </Typography>
            </Box>
          )}

          <Box sx={{ p: 1.5, bgcolor: '#fff3e0', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>公式</Typography>
            <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
              H = 90° - |φ - δ|
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>
              φ = 纬度({latitude}°)，δ = 直射点纬度({declination.toFixed(1)}°)
            </Typography>
          </Box>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default SunAltitude;
