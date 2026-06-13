import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import AnimationControls from '@/components/shared/AnimationControls';
import type { FrontType } from '@/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CANVAS_W = 600;
const CANVAS_H = 300;

const frontLabels: Record<FrontType, string> = {
  cold: '冷锋',
  warm: '暖锋',
  stationary: '准静止锋',
};

// Stable rain drop positions (avoid Math.random in draw)
function generateRainDrops(count: number): { rx: number; ry: number }[] {
  const drops: { rx: number; ry: number }[] = [];
  for (let i = 0; i < count; i++) {
    drops.push({
      rx: Math.random(),
      ry: Math.random(),
    });
  }
  return drops;
}

const rainDrops = generateRainDrops(12);

const FrontWeather: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [frontType, setFrontType] = useState<FrontType>('cold');
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);

  const progressRef = useRef(0);
  const playingRef = useRef(true);
  const speedRef = useRef(1);
  const frontTypeRef = useRef<FrontType>('cold');

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { frontTypeRef.current = frontType; }, [frontType]);

  function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y - size * 0.15, size * 0.35, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y, size * 0.3, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y + size * 0.1, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw function - reads from params, no state/ref dependencies
  const drawFront = useCallback((ctx: CanvasRenderingContext2D, ft: FrontType, p: number) => {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H * 0.6);
    skyGrad.addColorStop(0, '#90caf9');
    skyGrad.addColorStop(1, '#e3f2fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H * 0.6);

    // Ground
    ctx.fillStyle = '#a5d6a7';
    ctx.fillRect(0, CANVAS_H * 0.6, CANVAS_W, CANVAS_H * 0.4);

    const frontX = 100 + (p / 100) * 400;

    if (ft === 'cold') {
      // Cold air mass
      ctx.fillStyle = 'rgba(66,165,245,0.3)';
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H * 0.3);
      ctx.lineTo(frontX, CANVAS_H * 0.3);
      ctx.lineTo(frontX, CANVAS_H * 0.6);
      ctx.lineTo(0, CANVAS_H * 0.6);
      ctx.closePath();
      ctx.fill();

      // Warm air mass
      ctx.fillStyle = 'rgba(239,83,80,0.3)';
      ctx.beginPath();
      ctx.moveTo(frontX, CANVAS_H * 0.15);
      ctx.lineTo(CANVAS_W, CANVAS_H * 0.15);
      ctx.lineTo(CANVAS_W, CANVAS_H * 0.6);
      ctx.lineTo(frontX, CANVAS_H * 0.6);
      ctx.closePath();
      ctx.fill();

      // Cold front line
      ctx.strokeStyle = '#1565C0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(frontX, CANVAS_H * 0.25);
      ctx.lineTo(frontX, CANVAS_H * 0.6);
      ctx.stroke();

      // Triangle markers
      for (let y = CANVAS_H * 0.28; y < CANVAS_H * 0.58; y += 25) {
        ctx.fillStyle = '#1565C0';
        ctx.beginPath();
        ctx.moveTo(frontX, y);
        ctx.lineTo(frontX + 12, y + 8);
        ctx.lineTo(frontX, y + 16);
        ctx.closePath();
        ctx.fill();
      }

      // Clouds
      drawCloud(ctx, frontX - 20, CANVAS_H * 0.12, 40, '#78909c');
      drawCloud(ctx, frontX - 50, CANVAS_H * 0.08, 35, '#90a4ae');
      drawCloud(ctx, frontX + 10, CANVAS_H * 0.1, 30, '#78909c');

      // Rain with stable positions
      ctx.strokeStyle = '#42A5F5';
      ctx.lineWidth = 1;
      rainDrops.forEach((drop) => {
        const rx = frontX - 30 + drop.rx * 50;
        const ry = CANVAS_H * 0.2 + drop.ry * CANVAS_H * 0.35;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 2, ry + 8);
        ctx.stroke();
      });

      ctx.fillStyle = '#1565C0';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('冷气团', frontX - 80, CANVAS_H * 0.45);
      ctx.fillStyle = '#c62828';
      ctx.fillText('暖气团', frontX + 40, CANVAS_H * 0.45);

    } else if (ft === 'warm') {
      // Cold air mass
      ctx.fillStyle = 'rgba(66,165,245,0.3)';
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H * 0.45);
      ctx.lineTo(CANVAS_W, CANVAS_H * 0.45);
      ctx.lineTo(CANVAS_W, CANVAS_H * 0.6);
      ctx.lineTo(0, CANVAS_H * 0.6);
      ctx.closePath();
      ctx.fill();

      // Warm air mass
      ctx.fillStyle = 'rgba(239,83,80,0.3)';
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H * 0.15);
      ctx.lineTo(frontX, CANVAS_H * 0.15);
      ctx.lineTo(frontX, CANVAS_H * 0.45);
      ctx.lineTo(0, CANVAS_H * 0.45);
      ctx.closePath();
      ctx.fill();

      // Warm front line
      ctx.strokeStyle = '#c62828';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(frontX, CANVAS_H * 0.25);
      ctx.lineTo(frontX, CANVAS_H * 0.6);
      ctx.stroke();

      // Warm front semicircle markers (pointing right = clockwise from PI to 2*PI)
      for (let y = CANVAS_H * 0.28; y < CANVAS_H * 0.58; y += 25) {
        ctx.fillStyle = '#c62828';
        ctx.beginPath();
        ctx.arc(frontX, y + 8, 6, Math.PI, 0, false);
        ctx.fill();
      }

      // Layered clouds
      drawCloud(ctx, frontX - 80, CANVAS_H * 0.06, 50, '#b0bec5');
      drawCloud(ctx, frontX - 40, CANVAS_H * 0.1, 45, '#90a4ae');
      drawCloud(ctx, frontX, CANVAS_H * 0.14, 35, '#78909c');

      ctx.fillStyle = '#1565C0';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('冷气团', frontX + 30, CANVAS_H * 0.55);
      ctx.fillStyle = '#c62828';
      ctx.fillText('暖气团', frontX - 80, CANVAS_H * 0.35);

    } else {
      // Stationary front
      ctx.fillStyle = 'rgba(66,165,245,0.2)';
      ctx.fillRect(0, CANVAS_H * 0.4, CANVAS_W / 2, CANVAS_H * 0.2);

      ctx.fillStyle = 'rgba(239,83,80,0.2)';
      ctx.fillRect(CANVAS_W / 2, CANVAS_H * 0.4, CANVAS_W / 2, CANVAS_H * 0.2);

      const sx = CANVAS_W / 2;
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, CANVAS_H * 0.25);
      ctx.lineTo(sx, CANVAS_H * 0.6);
      ctx.stroke();

      for (let y = CANVAS_H * 0.28; y < CANVAS_H * 0.55; y += 30) {
        ctx.fillStyle = '#1565C0';
        ctx.beginPath();
        ctx.moveTo(sx, y);
        ctx.lineTo(sx + 10, y + 8);
        ctx.lineTo(sx, y + 16);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#c62828';
        ctx.beginPath();
        ctx.arc(sx, y + 23, 5, Math.PI, 0, false);
        ctx.fill();
      }

      drawCloud(ctx, sx - 30, CANVAS_H * 0.05, 50, '#90a4ae');
      drawCloud(ctx, sx + 20, CANVAS_H * 0.08, 45, '#90a4ae');

      ctx.fillStyle = '#1565C0';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('冷气团', sx - 120, CANVAS_H * 0.5);
      ctx.fillStyle = '#c62828';
      ctx.fillText('暖气团', sx + 40, CANVAS_H * 0.5);
    }

    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${frontLabels[ft]}过境模拟`, 10, 20);
  }, []); // Stable - no state deps

  // Animation loop - stable
  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      let currentProgress = progressRef.current;

      if (playingRef.current) {
        currentProgress = (currentProgress + 0.15 * speedRef.current) % 100;
        progressRef.current = currentProgress;
      }

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawFront(ctx, frontTypeRef.current, currentProgress);
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFront]); // Stable effect

  // Sync progress to state for slider
  useEffect(() => {
    if (!playing) {
      setProgress(progressRef.current);
      return;
    }
    const sync = setInterval(() => {
      setProgress(progressRef.current);
    }, 100);
    return () => clearInterval(sync);
  }, [playing]);

  // Temperature curve data
  const tempCurveData = {
    labels: ['过境前', '过境时', '过境后'],
    datasets: [{
      label: '气温变化 (°C)',
      data: frontType === 'cold' ? [25, 20, 12] : frontType === 'warm' ? [10, 18, 25] : [15, 16, 15],
      borderColor: '#F57C00',
      backgroundColor: 'rgba(245,124,0,0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 5,
    }],
  };

  return (
    <ToolPageLayout title="锋面天气模拟" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ToggleButtonGroup
            value={frontType}
            exclusive
            onChange={(_, v) => { if (v) { setFrontType(v); progressRef.current = 0; } }}
            size="small"
            sx={{ mb: 1 }}
          >
            <ToggleButton value="cold">冷锋</ToggleButton>
            <ToggleButton value="warm">暖锋</ToggleButton>
            <ToggleButton value="stationary">准静止锋</ToggleButton>
          </ToggleButtonGroup>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ border: '1px solid #ddd', borderRadius: 8, maxWidth: '100%' }}
          />
          <AnimationControls
            playing={playing}
            speed={speed}
            progress={progress}
            onPlayPause={() => setPlaying(!playing)}
            onSpeedChange={setSpeed}
            onProgressChange={setProgress}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>温度变化曲线</Typography>
          <div style={{ height: 200 }}>
            <Line data={tempCurveData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{frontLabels[frontType]}特征</Typography>
            {frontType === 'cold' && (
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>天气变化过程：</b>过境前受暖气团控制，气温高、气压低、天气晴朗；过境时常出现<b>大风、降温、雨雪</b>天气；
                  过境后受冷气团控制，气温骤降、气压升高、天气转晴。
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>云型特征：</b>主要为积雨云（Cb）和层积云，云层浓厚，垂直发展旺盛，常伴有雷电。
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>降水特点：</b>降水集中在锋后（冷气团一侧），强度大、历时短、范围窄（宽约数十至上百公里）。多为<b>阵性降水</b>，夏季可形成暴雨。
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>气压变化：</b>过境时气压急剧升高（冷气团密度大），过境后持续升高后趋于稳定。
                </Typography>
                <Typography variant="body2">
                  <b>移动速度：</b>较快（30-50 km/h），受冷气团推进力驱动。我国冬半年最常见。
                </Typography>
              </Box>
            )}
            {frontType === 'warm' && (
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>天气变化过程：</b>过境前受冷气团控制，气温低、气压高、天气晴朗；过境时出现<b>连续性降水</b>，云层逐渐加厚；
                  过境后受暖气团控制，气温升高、气压降低、天气转晴。
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>云型特征：</b>云系排列有序——卷云（Ci）→ 卷层云（Cs）→ 高层云（As）→ 雨层云（Ns），自远而近依次出现。
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>降水特点：</b>降水发生在锋前（冷气团一侧），强度小、历时长、范围宽（宽约数百公里）。为<b>连续性降水</b>，多中小雨。
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>气压变化：</b>过境前气压逐渐下降，过境后气压持续偏低。
                </Typography>
                <Typography variant="body2">
                  <b>移动速度：</b>较慢（20-30 km/h），暖气团主动爬升。我国春季多见。
                </Typography>
              </Box>
            )}
            {frontType === 'stationary' && (
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>天气变化过程：</b>冷暖气团势均力敌，锋面在某一地区长时间徘徊或来回摆动，
                  造成该地区<b>持续阴雨</b>天气。如我国江淮地区的<b>梅雨</b>（6月中旬至7月上旬）就是准静止锋的典型表现。
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>云型特征：</b>以层状云和雨层云为主，云层厚而均匀，天空阴沉持续数日甚至数周。
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>降水特点：</b>持续时间极长，累计降水量大，但单位时间降水强度中等。常引发<b>洪涝灾害</b>。
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <b>气压变化：</b>气压变化不明显，长期维持在相对稳定的状态。
                </Typography>
                <Typography variant="body2">
                  <b>其他实例：</b>昆明准静止锋（冬半年，云贵高原）、华南准静止锋、天山准静止锋。
                </Typography>
              </Box>
            )}
          </Box>

          {/* Gaokao Tips Panel */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2, borderLeft: '4px solid #FF8F00' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E65100', mb: 0.5 }}>
              💡 学习提示 (Gaokao Tips)
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                <li><b>判断锋面类型的口诀：</b>"冷锋过境风雨骤，暖锋过境雨连绵；准静止锋阴雨久，梅雨时节江淮间。"</li>
                <li><b>冷锋 vs 暖锋的判断：</b>看锋面符号（三角为冷锋，半圆为暖锋）；看降水位置（锋后为冷锋，锋前为暖锋）；看云序（积雨云为主为冷锋，层序清晰为暖锋）。</li>
                <li><b>气压变化规律：</b>冷锋过境气压急升（冷气团重），暖锋过境气压下降（暖气团轻）。这是判断锋面类型的重要依据。</li>
                <li><b>高考常见考法：</b>给出一段天气变化数据（气温、气压、风向、降水），要求判断属于哪种锋面过境，并绘图说明。</li>
              </ul>
            </Typography>
          </Box>

          {/* 锋面过境前后对比表 */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8eaf6', borderRadius: 2, border: '1px solid #9fa8da' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#283593', mb: 1 }}>
              📊 锋面过境前后对比表（高考必背）
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#c5cae9' }}>
                    <th style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>要素</th>
                    <th style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>冷锋过境前</th>
                    <th style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>冷锋过境后</th>
                    <th style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>暖锋过境前</th>
                    <th style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>暖锋过境后</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}><b>气温</b></td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>高（暖气团控制）</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>骤降（冷气团控制）</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>低（冷气团控制）</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>升高（暖气团控制）</td>
                  </tr>
                  <tr style={{ backgroundColor: '#e8eaf6' }}>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}><b>气压</b></td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>低</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>急升</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>高</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>下降</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}><b>风向</b></td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>偏南风</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>转偏北风</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>偏北风</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>转偏南风</td>
                  </tr>
                  <tr style={{ backgroundColor: '#e8eaf6' }}>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}><b>降水</b></td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>无/少</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>锋后阵性降水</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>无/少</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '4px 6px', textAlign: 'center' }}>锋前连续性降水</td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </Box>

          {/* 中国典型锋面案例 */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fce4ec', borderRadius: 2, border: '1px solid #f48fb1' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#880e4f', mb: 1 }}>
              🇨🇳 中国典型锋面案例（高考高频考点）
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>1. 江淮梅雨 — 准静止锋：</b>每年6月中旬至7月上旬，冷暖气团在江淮地区势均力敌，形成江淮准静止锋，造成持续阴雨天气，降水量占全年40%以上。若夏季风势力强（或弱），则出现"空梅"（或"涝梅"）。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>2. 北方沙尘暴 — 冷锋：</b>冬春季节，蒙古-西伯利亚冷高压南下，冷锋过境带来大风降温，若途经沙漠/沙地（如内蒙古、甘肃），则形成沙尘暴。冷锋移动快、风力大，是沙尘暴的主要天气系统。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>3. 华南准静止锋：</b>冬半年（11月-次年4月），南岭以南的冷暖气团在华南对峙，形成华南准静止锋（又称南岭准静止锋），导致华南地区阴雨连绵、低温寡照。
            </Typography>
            <Typography variant="body2">
              <b>4. 昆明准静止锋：</b>冬半年云贵高原上，北方冷空气受地形阻挡与西南暖湿气流相遇，锋面在昆明-贵阳之间停滞，昆明一侧晴朗温暖（"春城"），贵阳一侧阴雨湿冷（"天无三日晴"）。
            </Typography>
          </Box>

          {/* 锋面坡度公式 */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e0f2f1', borderRadius: 2, border: '1px solid #80cbc4' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00695c', mb: 0.5 }}>
              📐 锋面坡度公式（地理拓展）
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem', mb: 0.5 }}>
              tan α = (f/g) · (ΔT·Tm)  （Margules锋面坡度公式）
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>实际近似坡度：</b>冷锋 ≈ <b>1:50</b>（坡度较陡，锋面与地面夹角约1°），暖锋 ≈ <b>1:300</b>（坡度平缓，锋面与地面夹角约0.2°）。冷锋坡度约为暖锋的<b>6倍</b>。
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.75rem' }}>
              原因：冷气团密度大，推进时底部摩擦大导致锋面陡峭；暖气团主动爬升于冷气团之上，坡度平缓。冷锋坡度陡 → 天气剧烈短暂；暖锋坡度缓 → 天气温和持久。
            </Typography>
          </Box>

          {/* 锋面天气符号图例说明 */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f3e5f5', borderRadius: 2, border: '1px solid #ce93d8' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6A1B9A', mb: 1 }}>
              🎨 锋面天气符号图例说明（高考必识）
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' }, p: 1, bgcolor: '#e1bee7', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#4A148C' }}>🔺 冷锋符号（蓝色三角形）</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                  · 三角形指向<b>暖气团一侧</b>（即锋面移动方向）<br/>
                  · <b>蓝色</b>表示冷气团（冷色调），三角形为实心填充<br/>
                  · 在地面天气图上，冷锋线标蓝色三角符号<br/>
                  · 口诀：「冷锋三角尖向前，蓝色代表冷气团」
                </Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' }, p: 1, bgcolor: '#ffcdd2', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#b71c1c' }}>🔴 暖锋符号（红色半圆）</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                  · 半圆凸向<b>冷气团一侧</b>（即锋面移动方向）<br/>
                  · <b>红色</b>表示暖气团（暖色调），半圆为空心<br/>
                  · 在地面天气图上，暖锋线标红色半圆符号<br/>
                  · 口诀：「暖锋半圆红向前，红色代表暖气团」
                </Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' }, p: 1, bgcolor: '#cfd8dc', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#37474f' }}>⚫ 准静止锋符号（红蓝交替）</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                  · 冷锋侧的<b>蓝色三角</b>与暖锋侧的<b>红色半圆</b>交替排列<br/>
                  · 两者指向相反方向（表示冷暖势力相当，锋面不动）<br/>
                  · 颜色含义同冷锋/暖锋：蓝=冷气团，红=暖气团
                </Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' }, p: 1, bgcolor: '#fff9c4', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#f57f17' }}>📖 锢囚锋符号（紫色）</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                  · 冷锋追上暖锋后形成锢囚锋，符号为<b>紫色</b>三角+半圆同侧排列<br/>
                  · 高考偶有涉及：冷式锢囚锋（冷锋爬升） vs 暖式锢囚锋（暖锋爬升）
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 世界主要锋面带分布 */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8eaf6', borderRadius: 2, border: '1px solid #9fa8da' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#283593', mb: 1 }}>
              🌍 世界主要锋面带分布（高考拓展）
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>1. 极锋（Polar Front）—— 最重要：</b>位于<b>南北纬60°附近</b>的副极地低压带，是极地冷气团（极地东风）与中纬度暖气团（盛行西风）的交汇地带。北半球极锋是<b>温带气旋</b>的摇篮（如阿留申低压、冰岛低压），也是地球上天气变化最剧烈的区域之一。南半球极锋环绕南极洲，形成"咆哮西风带"。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>2. 副热带锋（Subtropical Front）：</b>位于<b>南北纬30°附近</b>的副热带高压带边缘，是热带气团与中纬度气团的过渡带。锋面较弱，但在特定条件下（如高空槽影响）可激发出强烈天气。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>3. 赤道辐合带（ITCZ）：</b>位于赤道附近的低压带（非严格锋面），是南北半球信风交汇地带，终年高温多雨，是全球热带气旋（台风/飓风）的重要发源地。
            </Typography>
            <Typography variant="body2">
              <b>4. 热带锋：</b>位于热带与副热带过渡区，如<b>南岭准静止锋</b>（冬季）、<b>华南准静止锋</b>即属此类。中国南方冬半年的持续阴雨多与此锋面系统有关。
            </Typography>
          </Box>

          {/* 中国锋面活动季节规律 */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff3e0', borderRadius: 2, border: '1px solid #ffb74d' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e65100', mb: 1 }}>
              🇨🇳 中国锋面活动季节规律（高考时间轴必记）
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>冬季（12月-2月）：</b>冷锋活动<b>最频繁、最强烈</b>。蒙古-西伯利亚冷高压强大，冷锋频繁南下，带来<b>寒潮、大风、降温、沙尘暴</b>。昆明准静止锋形成（云贵高原），华南准静止锋活跃。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>春季（3月-5月）：</b>冷暖气团交替频繁，<b>冷锋仍活跃</b>但强度减弱。北方多沙尘天气，南方<b>华南准静止锋</b>造成低温阴雨。暖锋开始出现（但中国仍以冷锋为主）。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>夏季（6月-8月）：</b>冷锋势力大减，<b>准静止锋为主</b>。6月中旬-7月上旬「江淮准静止锋」造成<b>梅雨</b>（高考五星考点）；7-8月副高北跳控制长江中下游（伏旱），锋面移至华北、东北。热带气旋（台风）锋面活跃于华南。
            </Typography>
            <Typography variant="body2">
              <b>秋季（9月-11月）：</b>冷空气势力恢复，<b>冷锋增多</b>。9月副高南退，「华西秋雨」（准静止锋影响）；10月后冷锋南下次数增多，北方进入霜冻期。
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.7rem', mt: 0.5 }}>
              💡 全年规律：中国以<b>冷锋</b>为主（占80%以上），暖锋次之；准静止锋主要集中在<b>冬半年（南岭/昆明）</b>和<b>初夏（江淮梅雨）</b>。锋面活动与<b>副高（西太平洋副热带高压）</b>的季节进退密切相关。
            </Typography>
          </Box>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default FrontWeather;
