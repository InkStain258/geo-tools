import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Slider } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import AnimationControls from '@/components/shared/AnimationControls';

const CANVAS_W = 600;
const CANVAS_H = 500;

const AtmosphericCirculation: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [seasonOffset, setSeasonOffset] = useState(0);

  const progressRef = useRef(0);
  const playingRef = useRef(true);
  const speedRef = useRef(1);

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Draw function - reads from refs, no state dependencies
  const drawCirculation = useCallback((ctx: CanvasRenderingContext2D, p: number, season: number) => {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bgGrad.addColorStop(0, '#e3f2fd');
    bgGrad.addColorStop(0.5, '#fff3e0');
    bgGrad.addColorStop(1, '#e3f2fd');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;
    const radius = 180;

    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#e8f5e9';
    ctx.fill();

    const shift = Math.sin((season / 12) * Math.PI * 2) * 15;

    const belts = [
      { lat: 0 + shift, label: '赤道低压带', color: '#ef5350' },
      { lat: 30 + shift, label: '副热带高压带(北)', color: '#42A5F5' },
      { lat: -30 + shift, label: '副热带高压带(南)', color: '#42A5F5' },
      { lat: 60 + shift, label: '副极地低压带(北)', color: '#ef5350' },
      { lat: -60 + shift, label: '副极地低压带(南)', color: '#ef5350' },
      { lat: 90, label: '极地高压带(北)', color: '#42A5F5' },
      { lat: -90, label: '极地高压带(南)', color: '#42A5F5' },
    ];

    belts.forEach((belt) => {
      const y = cy - (belt.lat / 90) * radius;
      ctx.strokeStyle = belt.color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx - radius, y);
      ctx.lineTo(cx + radius, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = belt.color;
      ctx.font = '9px sans-serif';
      ctx.fillText(belt.label, cx + radius + 5, y + 3);
    });

    const drawCell = (
      startY: number, endY: number, direction: number, color: string, label: string,
    ) => {
      const cellH = endY - startY;
      const midY = (startY + endY) / 2;
      const arcRadius = Math.abs(cellH) / 3;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fillStyle = color;

      const arrowOffset = p * direction * 0.5;

      // Upward leg
      ctx.beginPath();
      ctx.moveTo(cx - arcRadius, startY);
      ctx.lineTo(cx - arcRadius, endY);
      ctx.stroke();
      const ay1 = endY + arrowOffset * 2;
      ctx.beginPath();
      ctx.moveTo(cx - arcRadius, ay1);
      ctx.lineTo(cx - arcRadius - 5, ay1 - 8 * direction);
      ctx.lineTo(cx - arcRadius + 5, ay1 - 8 * direction);
      ctx.closePath();
      ctx.fill();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(cx - arcRadius, startY);
      ctx.lineTo(cx + arcRadius, startY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - arcRadius, endY);
      ctx.lineTo(cx + arcRadius, endY);
      ctx.stroke();

      // Downward leg
      ctx.beginPath();
      ctx.moveTo(cx + arcRadius, endY);
      ctx.lineTo(cx + arcRadius, startY);
      ctx.stroke();
      const ay2 = startY - arrowOffset * 2;
      ctx.beginPath();
      ctx.moveTo(cx + arcRadius, ay2);
      ctx.lineTo(cx + arcRadius - 5, ay2 + 8 * direction);
      ctx.lineTo(cx + arcRadius + 5, ay2 + 8 * direction);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#333';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(label, cx - 20, midY + 4);
    };

    const n30y = cy - ((30 + shift) / 90) * radius;
    const n60y = cy - ((60 + shift) / 90) * radius;
    const eqY = cy - (shift / 90) * radius;
    const topY = cy - radius;

    drawCell(eqY, n30y, 1, '#ef5350', '哈德莱环流');
    drawCell(n30y, n60y, -1, '#66BB6A', '费雷尔环流');
    drawCell(n60y, topY, 1, '#42A5F5', '极地环流');

    const s30y = cy + ((30 - shift) / 90) * radius;
    const s60y = cy + ((60 - shift) / 90) * radius;
    const botY = cy + radius;

    drawCell(s30y, eqY, -1, '#ef5350', '哈德莱环流');
    drawCell(s60y, s30y, 1, '#66BB6A', '费雷尔环流');
    drawCell(botY, s60y, -1, '#42A5F5', '极地环流');

    ctx.fillStyle = '#333';
    ctx.font = '10px sans-serif';
    ctx.fillText('东北信风', cx - 45, eqY + 15);
    ctx.fillText('盛行西风', cx - 40, n30y - 5);
    ctx.fillText('极地东风', cx - 40, n60y + 15);

    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    ctx.fillStyle = '#2E7D32';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`月份：${monthNames[season]}  气压带偏移：${shift > 0 ? '北移' : shift < 0 ? '南移' : '无偏移'}`, 20, 30);
  }, []);

  // Animation loop - stable effect
  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      let currentProgress = progressRef.current;
      const currentSeason = seasonOffset;

      if (playingRef.current) {
        currentProgress = (currentProgress + 0.3 * speedRef.current) % 360;
        progressRef.current = currentProgress;
      }

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawCirculation(ctx, currentProgress, currentSeason);
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [drawCirculation, seasonOffset]);

  // Sync ref progress to state for slider (throttled)
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

  return (
    <ToolPageLayout title="大气环流可视化" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
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
        <Box sx={{ mt: 2, px: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>季节变化（气压带风带移动）</Typography>
          <Slider
            value={seasonOffset}
            onChange={(_, v) => setSeasonOffset(v as number)}
            min={0}
            max={11}
            step={1}
            marks
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v + 1}月`}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ color: '#ef5350' }}>● 低压带/上升气流 → 多阴雨</Typography>
          <Typography variant="body2" sx={{ color: '#42A5F5' }}>● 高压带/下沉气流 → 晴朗干燥</Typography>
        </Box>

        {/* Educational Content Panel */}
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: '#2E7D32' }}>
            📚 大气环流知识详解（高考必备）
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1.5, color: '#1565C0' }}>
            一、三圈环流的形成机制
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            太阳辐射在地表的纬度差异 → 赤道受热多、极地受热少 → 产生气压梯度力 → 驱动大气运动。
            受地转偏向力影响，单一环流被打破，形成三个环流圈：<b>哈德莱环流</b>（低纬，热力环流）、
            <b>费雷尔环流</b>（中纬，动力环流）、<b>极地环流</b>（高纬，热力环流）。
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1.5, color: '#1565C0' }}>
            二、七个气压带和六个风带
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <b>气压带（由赤道向两极）：</b>赤道低压带（热力）→ 副热带高压带（动力，30°）→ 副极地低压带（动力，60°）→ 极地高压（热力）。
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <b>风带（北半球）：</b>东北信风带（0°-30°N）→ 盛行西风带（30°N-60°N）→ 极地东风带（60°N-90°N）。
            南半球风带方向相反。风带名称由<b>风的来向</b>命名。
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1.5, color: '#1565C0' }}>
            三、气压带风带的季节移动
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            随太阳直射点的南北移动，气压带和风带也做季节性移动：<b>北半球夏季北移，冬季南移，移动幅度约5°-10°</b>。
            这一规律决定了地中海气候（冬季受西风控制多雨，夏季受副高控制干燥）、
            热带草原气候（夏季受赤道低压控制多雨，冬季受信风控制干燥）、
            热带季风气候（夏季南半球东南信风越过赤道偏转为西南季风）的形成。
          </Typography>

          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff8e1', borderRadius: 1, borderLeft: '4px solid #FF8F00' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E65100', mb: 0.5 }}>
              💡 学习提示 (Gaokao Tips)
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                <li><b>记忆口诀：</b>"赤道低压是热因，副高下沉动生因；极地高压因寒冷，副低处于两锋间。"</li>
                <li><b>解题关键：</b>判断某地气候特征的成因时，首先确定其所处的气压带/风带位置，再结合季节移动规律。</li>
                <li><b>常见考点：</b>①用气压带风带解释气候类型分布；②用季风环流解释东亚/南亚季风；③结合洋流分析沿岸气候。</li>
                <li><b>区分要点：</b>热力成因（赤道低压、极地高压）vs 动力成因（副热带高压、副极地低压）；信风/东风来自高纬→低纬，西风来自低纬→高纬。</li>
              </ul>
            </Typography>
          </Box>

          {/* 三圈环流形成原因详解 */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8eaf6', borderRadius: 2, border: '1px solid #9fa8da' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#283593', mb: 1 }}>
              🔬 三圈环流形成原因详解
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>根本原因：</b>太阳辐射纬度差异 → 赤道地区受热多、温度高 → 空气膨胀上升 → 近地面形成赤道低压带；极地地区受热少、温度低 → 空气冷却下沉 → 近地面形成极地高压带。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>直接原因：</b>赤道与极地之间的<b>气压梯度力</b>驱动大气从高压流向低压，在单一均匀地球假设下应形成"单圈环流"（赤道上空→极地上空→极地近地面→赤道近地面）。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>关键因素——地转偏向力（科里奥利力）：</b>地球自转使运动的大气发生偏转（北半球右偏、南半球左偏），将单圈环流"撕裂"为三圈：
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
              · <b>哈德莱环流（低纬 0°-30°）：</b>热力驱动。赤道上升→高空向北（南半球向南）→受地转偏向力偏转为西风→30°堆积下沉→近地面向赤道回流→偏转为信风（东北信风/东南信风）。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
              · <b>费雷尔环流（中纬 30°-60°）：</b>动力驱动。由两侧环流"搓动"形成，30°下沉气流一部分向高纬流动→偏转为盛行西风→在60°与极地冷空气相遇被迫抬升。
            </Typography>
            <Typography variant="body2">
              · <b>极地环流（高纬 60°-90°）：</b>热力驱动。极地冷却下沉→近地面向低纬流动→偏转为极地东风→在60°与西风相遇形成极锋。
            </Typography>
          </Box>

          {/* 气压带成因分类 + 风带实际风向 */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fce4ec', borderRadius: 2, border: '1px solid #f48fb1' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#880e4f', mb: 1 }}>
              📋 气压带成因分类 & 风带实际风向（高考必背）
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#c62828', mb: 0.5 }}>
              一、七个气压带按成因分类
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
              <b>热力成因（thermal）：</b>
              · <b>赤道低压带（0°）：</b>赤道终年高温，空气受热膨胀上升，近地面形成低压（热低压）。
              · <b>极地高压带（90°N/S）：</b>极地终年严寒，空气冷却收缩下沉，近地面形成高压（冷高压）。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>动力成因（dynamic）：</b>
              · <b>副热带高压带（30°N/S）：</b>高空西风在30°堆积下沉，形成动力高压（暖性高压），如北太平洋副高、北大西洋副高（即"副高"）。
              · <b>副极地低压带（60°N/S）：</b>盛行西风与极地东风在此交汇，暖空气被迫抬升，形成动力低压。
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#c62828', mb: 0.5 }}>
              二、六个风带实际风向
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
              <b>低纬信风带（0°-30°）：</b>北半球为<b>东北信风</b>（NE Trade Winds），南半球为<b>东南信风</b>（SE Trade Winds）。风向稳定、风力不大（3-4级），是古代帆船贸易的主要动力，"信风"即"可信赖的风"。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
              <b>中纬盛行西风带（30°-60°）：</b>北半球为<b>西南风（SW）</b>，南半球为<b>西北风（NW）</b>。南半球因海洋面积大，西风强劲稳定（"咆哮西风带"），风力常达7-8级。
            </Typography>
            <Typography variant="body2">
              <b>高纬极地东风带（60°-90°）：</b>北半球为<b>东北风（NE）</b>，南半球为<b>东南风（SE）</b>。风力较弱，寒冷干燥。
            </Typography>
          </Box>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default AtmosphericCirculation;
