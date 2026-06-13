import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { calcSunAltitude, calcDeclination, getDayOfYear } from '@/utils/geoCalculations';

const CANVAS_W = 520;
const CANVAS_H = 380;

const SunAltitude: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [latitude, setLatitude] = useState(40);
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(22);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [shadowRatio, setShadowRatio] = useState<number | null>(null);

  const dayOfYear = getDayOfYear(month, day);
  const declination = calcDeclination(dayOfYear);

  // Shadow length ratio: shadow_length / pole_height = cot(altitude)
  const calcShadow = (alt: number): number => {
    if (alt <= 0) return Infinity;
    const altRad = alt * (Math.PI / 180);
    return 1 / Math.tan(altRad); // cot(alt)
  };

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

      // Draw pole (vertical reference)
      const poleHeight = 80;
      ctx.fillStyle = '#555';
      ctx.fillRect(centerX - 3, groundY - poleHeight, 6, poleHeight);
      ctx.fillStyle = '#333';
      ctx.font = '9px sans-serif';
      ctx.fillText('标杆', centerX - 10, groundY - poleHeight - 4);

      // Sun ray line
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(centerX, groundY - poleHeight); // from top of pole
      ctx.lineTo(sunX, sunY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Shadow on ground (from base of pole extending opposite to sun)
      if (shadowRatio !== null && shadowRatio !== Infinity) {
        const shadowLen = Math.min(poleHeight * shadowRatio, 250);
        const shadowEndX = centerX - shadowLen; // shadow goes opposite direction on ground
        
        // Shadow polygon
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.moveTo(centerX, groundY);
        ctx.lineTo(shadowEndX, groundY);
        ctx.lineTo(shadowEndX, groundY + 2);
        ctx.lineTo(centerX, groundY + 2);
        ctx.closePath();
        ctx.fill();
        
        // Shadow edge
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(centerX, groundY);
        ctx.lineTo(shadowEndX, groundY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Shadow length label
        ctx.fillStyle = '#666';
        ctx.font = '9px sans-serif';
        ctx.fillText(`影长≈${(shadowRatio * 100).toFixed(0)}cm (1m标杆)`, centerX - shadowLen / 2 - 30, groundY + 16);
      }

      // Sun
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sun rays
      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const ra = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(sunX + 20 * Math.cos(ra), sunY + 20 * Math.sin(ra));
        ctx.lineTo(sunX + 27 * Math.cos(ra), sunY + 27 * Math.sin(ra));
        ctx.stroke();
      }

      // Angle arc from horizontal to sun ray
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, groundY - poleHeight, 40, -altRad, 0);
      ctx.stroke();

      // Angle label
      const labelAngle = -altRad / 2;
      ctx.fillStyle = '#F57C00';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`H = ${altitude.toFixed(1)}°`, centerX + 45 * Math.cos(labelAngle), groundY - poleHeight + 45 * Math.sin(labelAngle));

      // Horizontal reference line through top of pole
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(centerX - 60, groundY - poleHeight);
      ctx.lineTo(centerX + 120, groundY - poleHeight);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#999';
      ctx.font = '9px sans-serif';
      ctx.fillText('水平面', centerX + 125, groundY - poleHeight + 4);

      // Ground line extension
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(centerX + 120, groundY);
      ctx.lineTo(centerX + 180, groundY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Zenith label
      ctx.fillStyle = '#666';
      ctx.font = '10px sans-serif';
      ctx.fillText('天顶 (Zenith)', centerX - 26, groundY - poleHeight - 50);

      // Geometric labels
      ctx.fillStyle = '#2E7D32';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('H = 90° - |φ - δ|', 10, 30);
      ctx.fillText(`φ(${latitude >= 0 ? 'N' : 'S'}${Math.abs(latitude)}°) — δ(${declination >= 0 ? 'N' : 'S'}${Math.abs(declination).toFixed(1)}°)`, 10, 48);
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
    setShadowRatio(calcShadow(h));
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
              {shadowRatio !== null && (
                <>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    📏 影长比值：1m标杆 → 影子 ≈ {(shadowRatio * 100).toFixed(0)}cm
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.75rem' }}>
                    公式：影长 = 物高 / tan(H)，正午影子最短
                  </Typography>
                </>
              )}
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
