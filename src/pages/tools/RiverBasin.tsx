import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { riverBasins } from '@/data/terrainPresets';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CANVAS_W = 500;
const CANVAS_H = 400;

const RiverBasin: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [basinId, setBasinId] = useState('yangtze');
  const [hoverArea, setHoverArea] = useState<number | null>(null);

  const basin = riverBasins.find((b) => b.id === basinId) || riverBasins[0];

  const drawBasin = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Background
    ctx.fillStyle = '#e8f5e9';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw simplified river basin
    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;

    // Basin boundary
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 2;
    ctx.fillStyle = hoverArea !== null ? '#c8e6c9' : '#a5d6a7';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 180, 140, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Main river
    ctx.strokeStyle = '#1565C0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 10, 60);
    ctx.quadraticCurveTo(cx - 30, 150, cx, 200);
    ctx.quadraticCurveTo(cx + 20, 280, cx + 10, 360);
    ctx.stroke();

    // Tributaries
    const tributaries = [
      [[100, 100], [180, 150], [cx - 10, 180]],
      [[350, 80], [290, 140], [cx, 190]],
      [[80, 280], [160, 250], [cx - 20, 220]],
      [[380, 300], [300, 260], [cx + 10, 230]],
      [[cx - 80, 50], [cx - 40, 100], [cx - 20, 150]],
    ];

    tributaries.forEach((pts) => {
      ctx.strokeStyle = '#64B5F6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
      ctx.stroke();
    });

    // River source
    ctx.fillStyle = '#F57C00';
    ctx.beginPath();
    ctx.arc(cx - 10, 60, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.font = '11px sans-serif';
    ctx.fillText('源头', cx + 2, 55);

    // River mouth
    ctx.fillStyle = '#1565C0';
    ctx.beginPath();
    ctx.arc(cx + 10, 360, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('入海口', cx + 20, 365);

    // Basin name
    ctx.fillStyle = '#1B5E20';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(basin.name, cx - 30, cy - 60);

    // Area info
    ctx.font = '11px sans-serif';
    ctx.fillText(`流域面积：${(basin.area / 10000).toFixed(0)}万km²`, cx - 50, cy - 40);
    ctx.fillText(`河长：${basin.length}km`, cx - 30, cy - 20);

    // Flow direction arrows
    ctx.strokeStyle = '#F57C00';
    ctx.lineWidth = 2;
    const arrowY = 240;
    ctx.beginPath();
    ctx.moveTo(cx, arrowY);
    ctx.lineTo(cx, arrowY + 30);
    ctx.lineTo(cx - 5, arrowY + 22);
    ctx.moveTo(cx, arrowY + 30);
    ctx.lineTo(cx + 5, arrowY + 22);
    ctx.stroke();

    // Sub-areas for hover
    const zones = [
      { label: '上游', x: cx - 10, y: 120, color: '#81C784' },
      { label: '中游', x: cx, y: 230, color: '#66BB6A' },
      { label: '下游', x: cx + 10, y: 320, color: '#4CAF50' },
    ];

    zones.forEach((zone, idx) => {
      ctx.fillStyle = hoverArea === idx ? '#2E7D32' : zone.color;
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(zone.label, zone.x - 12, zone.y + 4);
    });
  }, [basin, hoverArea]);

  useEffect(() => { drawBasin(); }, [drawBasin]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = CANVAS_W / 2;
    const zones = [
      { x: cx - 10, y: 120 },
      { x: cx, y: 230 },
      { x: cx + 10, y: 320 },
    ];
    const hit = zones.findIndex((z) => Math.sqrt((x - z.x) ** 2 + (y - z.y) ** 2) < 25);
    setHoverArea(hit >= 0 ? hit : null);
  };

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const chartData = {
    labels: months,
    datasets: [{
      label: '月均流量 (m³/s)',
      data: basin.seasonalFlow,
      backgroundColor: basin.seasonalFlow.map((v) =>
        v > basin.seasonalFlow.reduce((a, b) => a + b, 0) / 12
          ? 'rgba(21,101,192,0.7)' : 'rgba(21,101,192,0.3)'
      ),
      borderColor: '#1565C0',
      borderWidth: 1,
    }],
  };

  return (
    <ToolPageLayout title="河流流域交互图" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}>
        <Box sx={{ flex: 1 }}>
          <FormControl size="small" sx={{ minWidth: 160, mb: 1 }}>
            <InputLabel>选择流域</InputLabel>
            <Select value={basinId} label="选择流域" onChange={(e) => setBasinId(e.target.value)}>
              {riverBasins.map((b) => (
                <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onClick={handleCanvasClick}
            style={{ border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', maxWidth: '100%' }}
          />
          <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
            {basin.description} · 点击上/中/下游查看详情
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {basin.name} · 季节流量变化
          </Typography>
          <div style={{ height: 300 }}>
            <Bar data={chartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { title: { display: true, text: '流量 (m³/s)' } } },
            }} />
          </div>
          {hoverArea !== null && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8f5e9', borderRadius: 2 }}>
              <Typography variant="body2">
                {hoverArea === 0 ? '上游：水流湍急，多峡谷，水能资源丰富' :
                 hoverArea === 1 ? '中游：河道变宽，多曲流，流量增大' :
                 '下游：河道宽阔，水流平缓，形成三角洲'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default RiverBasin;
