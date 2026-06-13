import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { riverBasins } from '@/data/terrainPresets';
import { getCanvasCoords } from '@/utils/canvasHelper';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CANVAS_W = 520;
const CANVAS_H = 420;

const floodSeasonData: Record<string, { months: string; desc: string }> = {
  yangtze: { months: '6-9月', desc: '夏季季风带来集中降水，中下游易发洪涝；6月"梅雨"、7-8月"伏汛"' },
  yellow: { months: '7-10月', desc: '夏季暴雨集中，中游水土流失严重，下游"地上河"汛期决口风险大' },
  pearl: { months: '4-9月', desc: '汛期长（亚热带），台风带来极端暴雨，珠江三角洲易发城市内涝' },
  amazon: { months: '全年，12-5月为高峰', desc: '热带雨林全年多雨，安第斯山融雪补充，水位年变幅可达10-15米' },
  nile: { months: '7-10月', desc: '青尼罗河（埃塞俄比亚高原）雨季带来洪水，白尼罗河（湖区）流量较稳定' },
  mississippi: { months: '3-6月（春汛）+夏季暴雨', desc: '春季融雪+夏季暴雨形成双汛期，下游密西西比三角洲防洪压力大' },
};

const segmentDescriptions: Record<string, string[]> = {
  yangtze: [
    '上游（源头-宜昌）：峡谷多、落差大，水能资源丰富（三峡、葛洲坝），水流湍急',
    '中游（宜昌-湖口）：河道弯曲（荆江"九曲回肠"），多湖泊调节（洞庭湖、鄱阳湖），航运发达',
    '下游（湖口-入海口）：江面宽阔、水流平缓，泥沙沉积形成长江三角洲，经济发达',
  ],
  yellow: [
    '上游（源头-河口镇）：水清量小，多峡谷（龙羊峡、刘家峡），水能资源丰富',
    '中游（河口镇-桃花峪）：流经黄土高原，含沙量剧增（年输沙量16亿吨），水土流失严重',
    '下游（桃花峪-入海口）："地上河"（河床高出地面3-10米），泥沙淤积，历史决口改道频繁',
  ],
  pearl: [
    '上游（西江）：发源于云贵高原，多峡谷瀑布，水流落差大',
    '中游（三江汇合）：西江、北江、东江汇合，水量大增，河谷宽阔',
    '下游（三角洲）：河网密布、八门入海，形成富饶的珠江三角洲平原',
  ],
  amazon: [
    '上游（安第斯山区）：发源于秘鲁安第斯山，落差极大，水流湍急',
    '中游（亚马孙平原）：流经世界最大热带雨林，支流众多呈树枝状，流量巨大',
    '下游（入海口）：河口宽达330km（雨季），形成巨大喇叭口，潮汐可达800km内陆',
  ],
  nile: [
    '上游（白尼罗河）：发源于维多利亚湖，流经沼泽区，水量较稳定',
    '中游（青尼罗河汇入）：青尼罗河从埃塞俄比亚高原带来大量泥沙和洪水',
    '下游（阿斯旺-入海口）：流经撒哈拉沙漠，形成尼罗河谷地和三角洲绿洲',
  ],
  mississippi: [
    '上游（源头-圣路易斯）：发源于落基山脉，春季融雪为主要水源',
    '中游（圣路易斯-开罗）：汇入密苏里河和俄亥俄河，流量大增',
    '下游（开罗-入海口）：流经大平原，形成巨大三角洲（鸟足三角洲），夏季暴雨',
  ],
};

const RiverBasin: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [basinId, setBasinId] = useState('yangtze');
  const [hoverArea, setHoverArea] = useState<number | null>(null);

  const basin = riverBasins.find((b) => b.id === basinId) || riverBasins[0];
  const floodInfo = floodSeasonData[basinId];
  const segmentDescs = segmentDescriptions[basinId];

  const drawBasin = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Background
    ctx.fillStyle = '#f0f7e8';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2 + 20;

    // Watershed divide line (dashed ellipse around basin)
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, 200, 160, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    // Label
    ctx.fillStyle = '#795548';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('分水岭 (Watershed Divide)', cx - 80, cy - 145);
    
    // Draw mountain icons at watershed points
    const mountainPoints = [
      [cx - 180, cy - 60], [cx - 130, cy - 120], [cx - 30, cy - 145],
      [cx + 80, cy - 130], [cx + 170, cy - 60], [cx + 195, cy + 20],
      [cx + 170, cy + 100], [cx + 60, cy + 145], [cx - 60, cy + 140],
      [cx - 170, cy + 90],
    ];
    mountainPoints.forEach(([mx, my]) => {
      ctx.fillStyle = '#8D6E63';
      ctx.beginPath();
      ctx.moveTo(mx, my - 8);
      ctx.lineTo(mx + 6, my + 2);
      ctx.lineTo(mx - 6, my + 2);
      ctx.closePath();
      ctx.fill();
    });

    // Basin boundary (solid)
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = hoverArea !== null ? '#c8e6c9' : 'rgba(165, 214, 167, 0.5)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 190, 150, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Main river - more organic curve
    ctx.strokeStyle = '#1565C0';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 130);
    ctx.bezierCurveTo(cx - 25, cy - 80, cx - 15, cy - 30, cx - 8, cy);
    ctx.bezierCurveTo(cx, cy + 30, cx + 5, cy + 70, cx + 8, cy + 130);
    ctx.stroke();

    // More detailed tributaries
    const tributaries: [number, number][][] = [
      // Left-side tributaries (upper)
      [[cx - 150, cy - 70], [cx - 100, cy - 80], [cx - 50, cy - 85], [cx - 15, cy - 55]],
      [[cx - 120, cy - 20], [cx - 75, cy - 35], [cx - 35, cy - 30], [cx - 8, cy - 10]],
      [[cx - 140, cy + 60], [cx - 80, cy + 40], [cx - 30, cy + 30], [cx - 5, cy + 25]],
      // Right-side tributaries
      [[cx + 150, cy - 50], [cx + 90, cy - 65], [cx + 45, cy - 55], [cx + 8, cy - 45]],
      [[cx + 130, cy + 20], [cx + 80, cy + 5], [cx + 35, cy], [cx + 8, cy + 10]],
      [[cx + 140, cy + 70], [cx + 85, cy + 55], [cx + 40, cy + 45], [cx + 8, cy + 50]],
      // Very small branches
      [[cx - 60, cy - 110], [cx - 35, cy - 100], [cx - 15, cy - 80]],
      [[cx + 50, cy - 90], [cx + 25, cy - 85], [cx + 8, cy - 60]],
      [[cx - 90, cy + 90], [cx - 50, cy + 80], [cx - 15, cy + 70]],
      [[cx + 80, cy + 95], [cx + 45, cy + 85], [cx + 10, cy + 75]],
    ];

    tributaries.forEach((pts) => {
      ctx.strokeStyle = '#64B5F6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.stroke();
    });

    // Arrows on tributaries near confluence
    const drawArrow = (fromX: number, fromY: number, toX: number, toY: number) => {
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const axLen = 8;
      ctx.fillStyle = '#64B5F6';
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - axLen * Math.cos(angle - 0.4),
        toY - axLen * Math.sin(angle - 0.4)
      );
      ctx.lineTo(
        toX - axLen * Math.cos(angle + 0.4),
        toY - axLen * Math.sin(angle + 0.4)
      );
      ctx.closePath();
      ctx.fill();
    };

    // Flow direction arrows on main river
    const flowArrows = [
      [cx - 10, cy - 50, cx - 10, cy - 20],
      [cx - 5, cy + 30, cx - 5, cy + 60],
      [cx + 5, cy + 90, cx + 5, cy + 120],
    ];
    flowArrows.forEach(([fx1, fy1, fx2, fy2]) => {
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx1, fy1);
      ctx.lineTo(fx2, fy2);
      ctx.stroke();
      // Arrow head
      const angle = Math.atan2(fy2 - fy1, fx2 - fx1);
      const al = 7;
      ctx.fillStyle = '#F57C00';
      ctx.beginPath();
      ctx.moveTo(fx2, fy2);
      ctx.lineTo(fx2 - al * Math.cos(angle - 0.5), fy2 - al * Math.sin(angle - 0.5));
      ctx.lineTo(fx2 - al * Math.cos(angle + 0.5), fy2 - al * Math.sin(angle + 0.5));
      ctx.closePath();
      ctx.fill();
    });

    // River source marker
    ctx.fillStyle = '#F57C00';
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 130, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('源', cx - 14, cy - 133);
    ctx.fillStyle = '#333';
    ctx.fillText('源头', cx + 2, cy - 128);

    // River mouth marker
    ctx.fillStyle = '#1565C0';
    ctx.beginPath();
    ctx.arc(cx + 8, cy + 130, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('入海口', cx + 20, cy + 135);

    // Basin name
    ctx.fillStyle = '#1B5E20';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(basin.name, cx - 40, cy - 170);

    // Key stats
    ctx.fillStyle = '#333';
    ctx.font = '10px sans-serif';
    ctx.fillText(`流域面积: ${(basin.area / 10000).toFixed(0)}万km²`, cx - 60, cy - 152);
    ctx.fillText(`河长: ${basin.length}km`, cx - 30, cy - 136);

    // Sub-area zones
    const zones = [
      { label: '上游', x: cx - 10, y: cy - 80, color: '#81C784', desc: 'Upper' },
      { label: '中游', x: cx - 5, y: cy, color: '#66BB6A', desc: 'Middle' },
      { label: '下游', x: cx + 5, y: cy + 80, color: '#4CAF50', desc: 'Lower' },
    ];

    zones.forEach((zone, idx) => {
      const isHovered = hoverArea === idx;
      ctx.fillStyle = isHovered ? '#2E7D32' : zone.color;
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, 28, 0, Math.PI * 2);
      ctx.fill();
      if (isHovered) {
        ctx.strokeStyle = '#F57C00';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(zone.label, zone.x - 12, zone.y + 4);
    });

    // Flood season info
    if (floodInfo) {
      ctx.fillStyle = '#F57C00';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`汛期: ${floodInfo.months}`, 10, CANVAS_H - 10);
    }

    // Scale
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, CANVAS_H - 30);
    ctx.lineTo(70, CANVAS_H - 30);
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.font = '9px sans-serif';
    ctx.fillText('~500km', 14, CANVAS_H - 35);
  }, [basin, hoverArea, floodInfo]);

  useEffect(() => { drawBasin(); }, [drawBasin]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e.currentTarget, e);
    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2 + 20;
    const zones = [
      { x: cx - 10, y: cy - 80 },
      { x: cx - 5, y: cy },
      { x: cx + 5, y: cy + 80 },
    ];
    const hit = zones.findIndex((z) => Math.sqrt((x - z.x) ** 2 + (y - z.y) ** 2) < 28);
    setHoverArea(hit >= 0 ? hit : null);
  };

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const avgFlow = basin.seasonalFlow.reduce((a, b) => a + b, 0) / 12;

  const chartData = {
    labels: months,
    datasets: [{
      label: '月均流量 (m³/s)',
      data: basin.seasonalFlow,
      backgroundColor: basin.seasonalFlow.map((v) =>
        v > avgFlow
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
            <Select value={basinId} label="选择流域" onChange={(e) => { setBasinId(e.target.value); setHoverArea(null); }}>
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
            {basin.description.substring(0, 60)}... · 点击上/中/下游查看详情
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {basin.name} · 季节流量变化
          </Typography>
          <div style={{ height: 260 }}>
            <Bar data={chartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx: any) => `${ctx.parsed?.y?.toLocaleString() ?? '0'} m³/s`,
                  },
                },
              },
              scales: {
                y: {
                  title: { display: true, text: '流量 (m³/s)' },
                  ticks: { callback: (v) => Number(v).toLocaleString() },
                },
              },
            }} />
          </div>

          {/* Flood season info */}
          <Box sx={{ mt: 1, p: 1.5, bgcolor: '#FFF3E0', borderRadius: 2, border: '1px solid #FFE082' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#F57C00' }}>
              🌊 汛期信息
            </Typography>
            <Typography variant="body2">
              汛期时间：{floodInfo?.months || '数据暂无'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.3, color: '#555' }}>
              {floodInfo?.desc || ''}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.3 }}>
              年均流量：{Math.round(basin.seasonalFlow.reduce((a, b) => a + b, 0) / 12).toLocaleString()} m³/s
            </Typography>
          </Box>

          {/* Clicked segment detail */}
          {hoverArea !== null && segmentDescs && (
            <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#E8F5E9', borderRadius: 2, border: '2px solid #2E7D32' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                {hoverArea === 0 ? '上游段' : hoverArea === 1 ? '中游段' : '下游段'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                {segmentDescs[hoverArea]}
              </Typography>
            </Box>
          )}

          {/* Watershed divide explanation */}
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#EFEBE9', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              📐 分水岭
            </Typography>
            <Typography variant="body2" sx={{ color: '#555' }}>
              分水岭是相邻流域之间的界线，通常沿山脊线分布。图中虚线表示流域边界，
              所有降水在边界内汇入该河流。分水岭两侧的水流向不同的河流系统。
            </Typography>
          </Box>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default RiverBasin;
