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
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default FrontWeather;
