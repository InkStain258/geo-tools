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
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>公式推导</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
              H = 90° - |φ - δ|
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575', mt: 0.5, fontSize: 12 }}>
              推导：正午太阳高度角 H = 90° - (当地纬度φ与直射点纬度δ的纬度差)。纬度差取绝对值|φ-δ|。
              当φ=δ（直射当地）时H=90°（太阳在头顶）；当|φ-δ|=90°时H=0°（太阳在地平线上）。
            </Typography>
          </Box>

          {/* Comparison table */}
          {altitude !== null && (
            <Box sx={{ p: 1.5, bgcolor: '#f3e5f5', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>同一天各纬度正午太阳高度角对比</Typography>
              {[0, 23.5, 30, 40, 50, 66.5, 90].map((lat) => {
                const h = 90 - Math.abs(lat - declination);
                return (
                  <Box key={lat} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                    <Typography variant="caption" sx={{ minWidth: 70, fontWeight: 600 }}>
                      {lat === 0 ? '赤道 0°' : lat < 90 ? `N${lat}°` : '北极 90°N'}
                    </Typography>
                    <Box sx={{ flex: 1, height: 6, bgcolor: '#eee', borderRadius: 3, overflow: 'hidden' }}>
                      <Box sx={{ width: `${Math.max(0, Math.min(100, h / 90 * 100))}%`, height: '100%', bgcolor: lat === latitude ? '#F57C00' : '#9C27B0', borderRadius: 3 }} />
                    </Box>
                    <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'right', fontWeight: lat === latitude ? 700 : 400 }}>
                      {h <= 0 ? '0° (极夜)' : `${h.toFixed(1)}°`}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* 四季太阳高度变化表（北京 40°N） */}
          <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: 2, mt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2E7D32', mb: 1 }}>
              📅 北京(40°N)四季正午太阳高度角变化
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#c8e6c9' }}>
                    <th style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>节气</th>
                    <th style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>日期</th>
                    <th style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>直射点纬度</th>
                    <th style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>H公式</th>
                    <th style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>太阳高度角</th>
                    <th style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>昼长(约)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>春分</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>3月21日</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>0°(赤道)</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>90°-|40°-0°|</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}><b>50°</b></td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>12h</td></tr>
                  <tr style={{ backgroundColor: '#e8f5e9' }}><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>夏至</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>6月22日</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>23.5°N</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>90°-|40°-23.5°|</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}><b>73.5°</b></td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>~15h</td></tr>
                  <tr><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>秋分</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>9月23日</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>0°(赤道)</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>90°-|40°-0°|</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}><b>50°</b></td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>12h</td></tr>
                  <tr style={{ backgroundColor: '#e8f5e9' }}><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>冬至</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>12月22日</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>23.5°S</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>90°-|40°-(-23.5°)|</td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}><b>26.5°</b></td><td style={{ border: '1px solid #a5d6a7', padding: '3px 5px', textAlign: 'center' }}>~9h</td></tr>
                </tbody>
              </table>
            </Box>
            <Typography variant="body2" sx={{ color: '#757575', mt: 0.5, fontSize: '0.7rem' }}>
              💡 规律：北京夏至正午太阳高度最高（73.5°），冬至最低（26.5°），年变化幅度=47°（=2×23.5°黄赤交角）。
            </Typography>
          </Box>

          {/* 建筑物间距计算 */}
          <Box sx={{ p: 1.5, bgcolor: '#fff3e0', borderRadius: 2, mt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E65100', mb: 1 }}>
              🏗️ 太阳高度角与建筑物间距计算（高考应用题）
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>核心公式：</b>楼间距 L = 楼高 h / tan(H<sub>冬至</sub>)，其中 H<sub>冬至</sub> 为冬至日正午太阳高度角。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>计算依据：</b>以冬至日（一年中正午太阳高度最低）正午前楼影子不遮挡后楼一层为准。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
              <b>举例——北京(40°N)，楼高20m：</b> H<sub>冬至</sub>=26.5°，间距L = 20 / tan(26.5°) ≈ <b>40m</b>（约楼高的2倍）。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
              <b>特例——H=45°时：</b>间距 = 楼高 / tan(45°) = 楼高 / 1 = <b>楼高</b>。即当冬至正午太阳高度恰好为45°时，楼间距恰好等于楼高。
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.7rem' }}>
              💡 纬度越高→冬至H越小→所需楼间距越大。哈尔滨(45.8°N)比广州(23.1°N)的楼间距要求大得多。这也是北方住宅楼间距普遍大于南方的原因。
            </Typography>
          </Box>

          {/* 太阳能热水器安装角度 */}
          <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 2, mt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0', mb: 0.5 }}>
              ☀️ 太阳能热水器安装角度计算
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', mb: 0.5 }}>
              集热板倾角 θ = |φ - δ| （φ=当地纬度，δ=直射点纬度）
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>原理：</b>为使集热板与太阳光线垂直，集热板与地面的夹角应等于正午太阳高度角的余角。而H=90°-|φ-δ|，所以θ=90°-H=|φ-δ|。即<b>安装角度 = 纬度 - 直射点纬度</b>。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
              <b>北京(40°N)实例：</b>夏至θ=|40°-23.5°|=16.5°（板面较平）；冬至θ=|40°-(-23.5°)|=63.5°（板面陡立）；春秋分θ=40°。实际安装取中间值或可调节支架。
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.7rem' }}>
              💡 高考常见考法：给出一地纬度，要求计算某日太阳能热水器集热板的最佳倾角。关键理解：倾角=纬度差=|φ-δ|。
            </Typography>
          </Box>

          {/* 正午太阳高度角在生活中的应用 */}
          <Box sx={{ p: 1.5, bgcolor: '#fce4ec', borderRadius: 2, mt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#880e4f', mb: 1 }}>
              🏗️ 正午太阳高度角在生活中的四大应用（高考应用题核心）
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5, lineHeight: 1.6 }}>
              <b>1. 楼间距（采光权）—— 最经典应用：</b>为保证后楼底层在<b>冬至日正午</b>（一年中太阳最低）能获得不少于1小时的日照，楼间距 L 需满足：<b>L ≥ h / tan H冬至</b>（h为前楼高度，H冬至为冬至日正午太阳高度角）。纬度越高 → H冬至越小 → tan H冬至越小 → 所需楼间距越大。我国《城市居住区规划设计标准》规定：大城市住宅日照标准为大寒日≥2小时（或冬至日≥1小时）。北方楼间距普遍大于南方就是这个原因。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5, lineHeight: 1.6 }}>
              <b>2. 遮阳板设计：</b>遮阳板要兼顾<b>夏季遮阳</b>（太阳高，需要遮阳板水平伸出足够长）和<b>冬季采光</b>（太阳低，希望阳光能照入室内）。遮阳板的水平挑出长度应依据当地<b>夏至和冬至正午太阳高度角</b>确定。南方（H大）→遮阳板可较短；北方（H小）→如果遮阳板太长会遮挡冬季阳光→通常北方采用可调节式或垂直遮阳。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5, lineHeight: 1.6 }}>
              <b>3. 太阳能安装：</b>太阳能电池板或热水器集热板的<b>最佳倾角</b>取决于纬度与直射点纬度之差：θ=|φ-δ|。为实现全年综合最佳效果，固定式安装通常取<b>当地纬度</b>（φ）作为倾角。全年可调节支架可在夏季放平（θ小）、冬季陡立（θ大）。高考常以太阳能路灯/信号灯/热水器为背景命题。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
              <b>4. 采光权法律与城市规划：</b>《民法典》第293条规定：建造建筑物不得妨碍相邻建筑物的<b>通风、采光和日照</b>。城市规划中，建筑间距须满足日照标准。开发商若遮挡他人采光→需赔偿。高中地理中常将此与「城市热岛效应」「通风廊道」等知识点串联考查。计算题实例：已知北楼高30m、冬至日H=30°，问两楼最小间距？→ L=30/tan30°=30/0.577≈52m。
            </Typography>
            <Box sx={{ mt: 1, p: 1, bgcolor: '#fff', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#c62828', fontSize: '0.75rem' }}>
                📐 四大应用统一公式推导：
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.7rem', fontFamily: '"JetBrains Mono", monospace' }}>
                · 楼间距 L = h · cot H = h / tan H<br/>
                · 遮阳板挑出长度 D = d · cot H（d为窗户上沿到遮阳板垂直距离）<br/>
                · 太阳能倾角 θ = 90°−H = |φ−δ|<br/>
                · 采光判断：若前楼影长 &lt; 楼间距 → 不遮挡（满足采光权）
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default SunAltitude;
