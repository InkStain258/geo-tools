import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Button, Slider, Chip } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { terrainPresets } from '@/data/terrainPresets';
import { getCanvasCoords } from '@/utils/canvasHelper';

const CANVAS_W = 400;
const CANVAS_H = 400;
const PROFILE_W = 400;
const PROFILE_H = 280;

const TerrainProfile: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const contourCanvasRef = useRef<HTMLCanvasElement>(null);
  const profileCanvasRef = useRef<HTMLCanvasElement>(null);
  const [presetId, setPresetId] = useState('mountain');
  const [pointA, setPointA] = useState<{ x: number; y: number } | null>(null);
  const [pointB, setPointB] = useState<{ x: number; y: number } | null>(null);
  const [verticalExag, setVerticalExag] = useState(1);
  const [elevationPoints, setElevationPoints] = useState<{ x: number; y: number; h: number }[]>([]);
  const [terrainTips, setTerrainTips] = useState<string[]>([]);

  const preset = terrainPresets.find((p) => p.id === presetId) || terrainPresets[0];

  /** 生成高度场 */
  const getHeight = useCallback((x: number, y: number): number => {
    const cx = preset.peakX;
    const cy = preset.peakY;
    const dx = (x - cx) / (CANVAS_W * 0.45);
    const dy = (y - cy) / (CANVAS_H * 0.45);
    const dist = Math.sqrt(dx * dx + dy * dy);
    let h = preset.peakHeight * Math.max(0, 1 - dist);

    // Add secondary peaks for realism
    if (presetId === 'saddle') {
      const h1 = 650 * Math.max(0, 1 - Math.sqrt(((x - 130) / 80) ** 2 + ((y - 200) / 100) ** 2));
      const h2 = 650 * Math.max(0, 1 - Math.sqrt(((x - 270) / 80) ** 2 + ((y - 200) / 100) ** 2));
      h = Math.max(h1, h2);
    } else if (presetId === 'valley') {
      const baseH = 700 * Math.max(0, 1 - Math.sqrt(((x - 200) / 180) ** 2 + ((y - 100) / 200) ** 2));
      const baseH2 = 600 * Math.max(0, 1 - Math.sqrt(((x - 200) / 180) ** 2 + ((y - 350) / 200) ** 2));
      const valleyCut = 400 * Math.max(0, 1 - Math.abs(x - 200) / 40);
      h = Math.max(baseH, baseH2) - valleyCut;
    }

    return Math.max(0, h);
  }, [preset, presetId]);

  // Generate terrain interpretation tips
  useEffect(() => {
    const tips: string[] = [];
    switch (presetId) {
      case 'mountain':
        tips.push('🔺 等高线密集处 → 陡坡 (steep slope)');
        tips.push('🔻 等高线稀疏处 → 缓坡 (gentle slope)');
        tips.push('⛰️ 等高线呈闭合圆形，数值内高外低 → 山峰');
        break;
      case 'valley':
        tips.push('🏞️ 等高线向高处凸出 → 山谷 (凸高为谷)');
        tips.push('🏔️ 等高线向低处凸出 → 山脊 (凸低为脊)');
        tips.push('💧 山谷常有河流发育，山脊常为分水岭');
        break;
      case 'ridge':
        tips.push('🏔️ 等高线向低处凸出 → 山脊 (凸低为脊)');
        tips.push('💧 山脊是分水岭，两侧水流相背');
        tips.push('📏 注意山脊线与等高线垂直相交');
        break;
      case 'basin':
        tips.push('🥣 等高线呈闭合圆形，数值外高内低 → 盆地');
        tips.push('📐 四周高中间低，如四川盆地');
        break;
      case 'saddle':
        tips.push('🐴 两山顶之间低洼处 → 鞍部 (saddle)');
        tips.push('🚶 鞍部是翻越山脊的最佳通道');
        break;
      case 'plateau':
        tips.push('🏜️ 顶部等高线稀疏、边缘密集 → 高原');
        tips.push('📏 顶部平坦广阔，边缘陡峭下降');
        break;
      case 'escarpment':
        tips.push('🧗 多条等高线重叠 → 陡崖 (cliff/escarpment)');
        tips.push('⚠️ 等高线重合处坡度近垂直');
        break;
    }
    tips.push('💡 口诀：凸高为谷，凸低为脊（等高线弯曲方向）');
    setTerrainTips(tips);
  }, [presetId]);

  /** Draw contour map */
  const drawContours = useCallback(() => {
    const canvas = contourCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw background gradient
    for (let y = 0; y < CANVAS_H; y += 2) {
      for (let x = 0; x < CANVAS_W; x += 2) {
        const h = getHeight(x, y);
        const ratio = h / 800;
        const r = Math.floor(34 + (245 - 34) * (1 - ratio));
        const g = Math.floor(139 + (124 - 139) * (1 - ratio));
        const b = Math.floor(34 + (0 - 34) * (1 - ratio));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Draw contour lines
    const intervals = [100, 200, 300, 400, 500, 600, 700];
    intervals.forEach((interval) => {
      ctx.strokeStyle = interval % 200 === 0 ? '#333' : '#666';
      ctx.lineWidth = interval % 200 === 0 ? 1.5 : 0.8;
      ctx.beginPath();

      for (let y = 0; y < CANVAS_H; y += 3) {
        for (let x = 0; x < CANVAS_W; x += 3) {
          const h = getHeight(x, y);
          const hRight = getHeight(x + 3, y);
          const hDown = getHeight(x, y + 3);

          if ((h < interval && hRight >= interval) || (h >= interval && hRight < interval) ||
              (h < interval && hDown >= interval) || (h >= interval && hDown < interval)) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + 1, y + 1);
          }
        }
      }
      ctx.stroke();
    });

    // Draw altitude labels
    ctx.fillStyle = '#333';
    ctx.font = '10px sans-serif';
    ctx.fillText(`${preset.peakHeight}m`, preset.peakX + 5, preset.peakY - 5);

    // Draw elevation point markers
    elevationPoints.forEach((ep) => {
      ctx.fillStyle = '#FF5722';
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.font = '9px sans-serif';
      ctx.fillText(`${Math.round(ep.h)}m`, ep.x + 6, ep.y - 4);
    });

    // Draw profile line
    if (pointA && pointB) {
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(pointA.x, pointA.y);
      ctx.lineTo(pointB.x, pointB.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point A
      ctx.fillStyle = '#F57C00';
      ctx.beginPath();
      ctx.arc(pointA.x, pointA.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('A', pointA.x - 4, pointA.y - 8);

      // Point B
      ctx.fillStyle = '#1565C0';
      ctx.beginPath();
      ctx.arc(pointB.x, pointB.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText('B', pointB.x - 4, pointB.y - 8);
    }
  }, [getHeight, pointA, pointB, preset, elevationPoints]);

  /** Draw profile */
  const drawProfile = useCallback(() => {
    const canvas = profileCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, PROFILE_W, PROFILE_H);

    // Background
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, PROFILE_W, PROFILE_H);

    // Axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, PROFILE_H - 30);
    ctx.lineTo(PROFILE_W - 10, PROFILE_H - 30);
    ctx.moveTo(40, PROFILE_H - 30);
    ctx.lineTo(40, 10);
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.font = '10px sans-serif';
    ctx.fillText('距离 →', PROFILE_W - 50, PROFILE_H - 10);
    ctx.fillText('海拔(m)', 2, 20);

    if (!pointA || !pointB) {
      ctx.fillStyle = '#999';
      ctx.font = '13px sans-serif';
      ctx.fillText('请在等高线图上点击两点确定剖面线', 55, PROFILE_H / 2 - 10);
      ctx.fillText('💡 可点击等高线标注自选点高程', 65, PROFILE_H / 2 + 12);
      return;
    }

    const dx = pointB.x - pointA.x;
    const dy = pointB.y - pointA.y;
    const totalDist = Math.sqrt(dx * dx + dy * dy);

    if (totalDist < 5) return;

    const chartW = PROFILE_W - 60;
    const chartH = PROFILE_H - 60;
    const points: { x: number; h: number; dist: number }[] = [];

    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const px = pointA.x + dx * t;
      const py = pointA.y + dy * t;
      const h = getHeight(px, py);
      points.push({ x: 50 + t * chartW, h, dist: t * totalDist });
    }

    const maxH = Math.max(...points.map((p) => p.h), 100);
    const vScale = verticalExag;

    // Draw profile fill
    ctx.beginPath();
    ctx.moveTo(50, PROFILE_H - 30);
    points.forEach((p) => {
      const y = PROFILE_H - 30 - (p.h / maxH) * chartH * vScale;
      // clamp
      const clampedY = Math.max(PROFILE_H - 30 - chartH * vScale, y);
      ctx.lineTo(p.x, clampedY);
    });
    ctx.lineTo(50 + chartW, PROFILE_H - 30);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 0, 0, PROFILE_H);
    gradient.addColorStop(0, 'rgba(46,125,50,0.7)');
    gradient.addColorStop(1, 'rgba(46,125,50,0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw profile line
    ctx.beginPath();
    points.forEach((p, i) => {
      const y = PROFILE_H - 30 - (p.h / maxH) * chartH * vScale;
      const clampedY = Math.max(PROFILE_H - 30 - chartH * vScale, y);
      if (i === 0) ctx.moveTo(p.x, clampedY);
      else ctx.lineTo(p.x, clampedY);
    });
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Vertical exaggeration label
    if (vScale !== 1) {
      ctx.fillStyle = '#F57C00';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`垂直夸大 ×${vScale.toFixed(1)}`, PROFILE_W - 130, 18);
    }

    // Y axis labels
    ctx.fillStyle = '#333';
    ctx.font = '9px sans-serif';
    for (let i = 0; i <= 4; i++) {
      const val = Math.round((maxH * i) / 4);
      const y = PROFILE_H - 30 - (val / maxH) * chartH * vScale;
      const clampedY = Math.max(PROFILE_H - 30 - chartH * vScale, y);
      ctx.fillText(`${val}`, 2, clampedY + 3);
      ctx.strokeStyle = '#ddd';
      ctx.beginPath();
      ctx.moveTo(50, clampedY);
      ctx.lineTo(PROFILE_W - 10, clampedY);
      ctx.stroke();
    }

    // Mark steep vs gentle slopes
    let maxSlope = 0;
    let maxSlopeIdx = 0;
    for (let i = 1; i < points.length; i++) {
      const slope = Math.abs(points[i].h - points[i - 1].h) / (points[i].dist - points[i - 1].dist);
      if (slope > maxSlope) {
        maxSlope = slope;
        maxSlopeIdx = i;
      }
    }
    if (maxSlope > 0.2 && points.length > 0) {
      const p = points[maxSlopeIdx];
      const py = PROFILE_H - 30 - (p.h / maxH) * chartH * vScale;
      ctx.fillStyle = '#F44336';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('陡坡', p.x + 2, py - 4);
    }
  }, [pointA, pointB, getHeight, verticalExag]);

  useEffect(() => { drawContours(); }, [drawContours]);
  useEffect(() => { drawProfile(); }, [drawProfile]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e.currentTarget, e);
    const h = getHeight(x, y);

    // If shift-like behavior: add elevation point
    // Simplified: if we have A and B already set, add elevation point
    if (pointA && pointB) {
      setElevationPoints(prev => [...prev.slice(-10), { x, y, h }]);
      return;
    }

    if (!pointA || (pointA && pointB)) {
      setPointA({ x, y });
      setPointB(null);
      setElevationPoints([]);
    } else {
      setPointB({ x, y });
    }
  };

  return (
    <ToolPageLayout title="地形剖面生成器" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}>
        {/* Left: Contour map */}
        <Box sx={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>地形预设</InputLabel>
            <Select value={presetId} label="地形预设" onChange={(e) => { setPresetId(e.target.value); setPointA(null); setPointB(null); setElevationPoints([]); }}>
              {terrainPresets.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name} - {p.description}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            🖱️ 点击两点确定 A-B 剖面线，再点击可标注高程点
          </Typography>
          <canvas
            ref={contourCanvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onClick={handleCanvasClick}
            style={{ border: '1px solid #ddd', borderRadius: 8, cursor: 'crosshair', maxWidth: '100%' }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" size="small" onClick={() => { setPointA(null); setPointB(null); setElevationPoints([]); }}>
              重置剖面线
            </Button>
            <Button variant="outlined" size="small" color="warning" onClick={() => setElevationPoints([])}>
              清除高程点
            </Button>
            {elevationPoints.length > 0 && (
              <Typography variant="body2" sx={{ color: '#757575', alignSelf: 'center' }}>
                已标注 {elevationPoints.length} 个高程点
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right: Profile + Tips */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>地形剖面图</Typography>
          <canvas
            ref={profileCanvasRef}
            width={PROFILE_W}
            height={PROFILE_H}
            style={{ border: '1px solid #ddd', borderRadius: 8, maxWidth: '100%', backgroundColor: '#f9f9f9' }}
          />
          
          {/* Vertical exaggeration */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
              📐 垂直夸大系数
            </Typography>
            <Slider
              value={verticalExag}
              onChange={(_, v) => setVerticalExag(v as number)}
              min={0.5}
              max={3}
              step={0.25}
              valueLabelDisplay="auto"
              marks={[{ value: 1, label: '×1' }, { value: 2, label: '×2' }, { value: 3, label: '×3' }]}
              size="small"
            />
            <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.75rem' }}>
              垂直夸大使地形起伏更明显，便于判读（实际地形×{verticalExag.toFixed(2)}）
            </Typography>
          </Box>

          {/* Terrain interpretation tips */}
          <Box sx={{ bgcolor: '#FFF8E1', p: 1.5, borderRadius: 2, border: '1px solid #FFE082' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              📖 等高线判读技巧
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {terrainTips.map((tip, i) => (
                <Chip key={i} label={tip} size="small" variant="outlined" sx={{ bgcolor: '#fff', fontSize: '0.7rem' }} />
              ))}
            </Box>
          </Box>

          <Box sx={{ bgcolor: '#E8F5E9', p: 1.5, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {preset.name}：{preset.description}
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575' }}>
              最大高差约 {preset.peakHeight}m · 剖面图展示水平距离与垂直高度的关系
            </Typography>
          </Box>

          {/* 高考考点 */}
          <Box sx={{ bgcolor: '#E3F2FD', p: 1.5, borderRadius: 2, border: '1px solid #90CAF9' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1565C0' }}>🎓 高考考点：等高线判读</Typography>
            {[
              '等高线密集→坡度陡（陡坡）；稀疏→坡度缓（缓坡）',
              '等高线向高值凸出→山谷（凸高为谷，可能有河流）',
              '等高线向低值凸出→山脊（凸低为脊，常为分水岭）',
              '两山顶之间相对低洼处→鞍部（翻山通道）',
              '多条等高线重合→陡崖（适合攀岩/瀑布，可计算相对高度）',
              '闭合等高线，内高外低→山峰；内低外高→盆地/洼地',
              '等高距 = (最大海拔 - 最小海拔) / (等高线条数 - 1)',
            ].map((tip, i) => (
              <Typography key={i} variant="body2" sx={{ fontSize: 11, mb: 0.3, '&::before': { content: '"▸ "' } }}>
                {tip}
              </Typography>
            ))}
          </Box>

          {/* 等高线地图判读步骤 */}
          <Box sx={{ bgcolor: '#FFF3E0', p: 1.5, mt: 1, borderRadius: 2, border: '1px solid #FFE082' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#E65100' }}>
              📖 等高线地图判读五步法（答题规范）
            </Typography>
            {[
              { step: 'Step 1', title: '看图名和图例', desc: '了解地图类型（地形图/分层设色图/地形剖面图），明确图例符号的含义（等高线、河流、居民点等）。' },
              { step: 'Step 2', title: '看等高距', desc: '确定相邻两条等高线的高程差。等高距越小，地形表示越精确。中国1:5万地形图等高距通常为10m或20m。' },
              { step: 'Step 3', title: '判读地形部位', desc: '识别山峰(▲)、山脊(凸低为脊)、山谷(凸高为谷)、鞍部(两峰间低洼)、陡崖(等高线重合)、盆地(闭合内低外高)等地形部位。' },
              { step: 'Step 4', title: '计算高差', desc: '相对高度 = 最高点海拔 - 最低点海拔。陡崖相对高度范围：(n-1)×d ≤ H < (n+1)×d（n为重叠等高线条数，d为等高距）。' },
              { step: 'Step 5', title: '确定方向', desc: '利用指向标或"上北下南左西右东"原则确定方向，分析地形对河流流向、聚落分布、交通线路的影响。' },
            ].map((item, i) => (
              <Box key={i} sx={{ mb: 0.8 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#BF360C', fontSize: '0.75rem' }}>
                  {item.step}：{item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', fontSize: '0.7rem', ml: 0.5 }}>
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* 坡度计算显示 */}
          <Box sx={{ bgcolor: '#E8F5E9', p: 1.5, mt: 1, borderRadius: 2, border: '1px solid #A5D6A7' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#2E7D32' }}>
              📐 坡度计算（地形剖面图分析）
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <b>坡度公式：</b>tan α = 高差 / 水平距离，或坡度(%) = (高差 ÷ 水平距离) × 100%。
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
              <b>坡度等级（高考常考）：</b>
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              · 平坡(0°-5°)：坡度＜9%，适合城市建设、农耕
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              · 缓坡(5°-15°)：坡度9%-27%，梯田耕作、低层建筑
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              · 陡坡(15°-25°)：坡度27%-47%，限制耕作、需水土保持
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.5 }}>
              · 急坡(＞25°)：坡度＞47%，退耕还林还草，禁止开垦（中国《水土保持法》规定25°以上坡耕地须退耕）
            </Typography>
            <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.65rem' }}>
              💡 在剖面图中，坡度由线段斜率决定。垂直夸大系数会影响视觉坡度，实际坡度=tan⁻¹(高差/水平距离)。高考常考利用等高线图计算两地间坡度。
            </Typography>
          </Box>

          {/* 五种基本地形特征速查 */}
          <Box sx={{ bgcolor: '#e0f2f1', p: 1.5, mt: 1, borderRadius: 2, border: '1px solid #80cbc4' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#00695c' }}>
              🗺️ 五种基本地形特征速查（高考必背）
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#b2dfdb' }}>
                    <th style={{ border: '1px solid #80cbc4', padding: '3px 5px', textAlign: 'center' }}>地形类型</th>
                    <th style={{ border: '1px solid #80cbc4', padding: '3px 5px', textAlign: 'center' }}>海拔高度</th>
                    <th style={{ border: '1px solid #80cbc4', padding: '3px 5px', textAlign: 'center' }}>等高线特征</th>
                    <th style={{ border: '1px solid #80cbc4', padding: '3px 5px', textAlign: 'center' }}>地面起伏</th>
                    <th style={{ border: '1px solid #80cbc4', padding: '3px 5px', textAlign: 'center' }}>中国典型代表</th>
                    <th style={{ border: '1px solid #80cbc4', padding: '3px 5px', textAlign: 'center' }}>适宜利用</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px', fontWeight: 700 }}>平原</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px', textAlign: 'center' }}>&lt;200m</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>稀疏，等高线平直</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>宽广平坦，起伏极小</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>东北平原、华北平原、长江中下游平原</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>农耕、城市、交通（人口密集区）</td>
                  </tr>
                  <tr style={{ backgroundColor: '#e0f2f1' }}>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px', fontWeight: 700 }}>丘陵</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px', textAlign: 'center' }}>&lt;500m</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>较密集，等高线弯曲</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>起伏和缓，坡度较小</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>东南丘陵（江南/浙闽/两广）、山东丘陵、辽东丘陵</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>梯田耕作、林果业、茶园</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px', fontWeight: 700 }}>山地</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px', textAlign: 'center' }}>&gt;500m</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>密集，等高线弯曲明显</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>起伏大，坡度陡，山峰耸立</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>秦岭、太行山、横断山脉、天山</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>林业、水电站、旅游、矿产</td>
                  </tr>
                  <tr style={{ backgroundColor: '#e0f2f1' }}>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px', fontWeight: 700 }}>高原</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px', textAlign: 'center' }}>&gt;500m（顶面平坦）</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>顶部稀疏（平坦），边缘密集（陡峭）</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>顶面宽广平坦，边缘陡峭下降</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>青藏高原、内蒙古高原、黄土高原、云贵高原</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>畜牧业（草原）、河谷农业</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px', fontWeight: 700 }}>盆地</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px', textAlign: 'center' }}>不定</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>闭合等高线，内低外高</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>四周高中间低，呈盆状</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>四川盆地、塔里木盆地、准噶尔盆地、柴达木盆地</td>
                    <td style={{ border: '1px solid #80cbc4', padding: '3px 5px' }}>底部平坦→农耕（成都平原）；沙漠盆地→矿产/绿洲</td>
                  </tr>
                </tbody>
              </table>
            </Box>
            <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.65rem', mt: 0.5 }}>
              💡 速记口诀：「平丘山高盆」——平原&lt;200m、丘陵&lt;500m、山地&gt;500m、高原&gt;500m顶面平、盆地四周高中间低。中国地形特征：<b>西高东低，呈三级阶梯</b>（青藏高原→中部山地高原→东部平原丘陵）。
            </Typography>
          </Box>

          {/* 等高线计算题解题技巧 */}
          <Box sx={{ bgcolor: '#FFF8E1', p: 1.5, mt: 1, borderRadius: 2, border: '1px solid #FFE082' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#E65100' }}>
              🧮 等高线计算题解题技巧（高考必考）
            </Typography>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#BF360C' }}>
                1. 陡崖相对高度公式
              </Typography>
              <Box sx={{ bgcolor: '#fff', p: 1, borderRadius: 1, mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', color: '#E65100' }}>
                  (n−1)×d ≤ H &lt; (n+1)×d
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', mb: 0.3 }}>
                其中：<b>n</b> = 陡崖处重叠的等高线条数，<b>d</b> = 等高距（相邻两条等高线的高差）
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', mb: 0.3 }}>
                · 最小相对高度 = (n−1)×d（≥，含等于）——当崖顶和崖底恰好落在等高线上时取等号
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', mb: 0.3 }}>
                · 最大相对高度 &lt; (n+1)×d（不含等于）——崖顶未达上一条等高线、崖底已过下一条等高线
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555' }}>
                · 示例：陡崖处重叠4条等高线，等高距100m → (4−1)×100=300m ≤ H &lt; (4+1)×100=500m
              </Typography>
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#BF360C' }}>
                2. 气温垂直递减率
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', mb: 0.3 }}>
                · <b>气温垂直递减率：0.6°C / 100m</b>（海拔每升高100米，气温下降约0.6°C）
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', mb: 0.3 }}>
                · 公式：T₂ = T₁ − (H₂ − H₁) × 0.6°C / 100m（H为海拔，单位m）
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', mb: 0.3 }}>
                · 示例：山脚（海拔200m）气温25°C → 山顶（海拔1700m）气温 = 25 − (1700−200)×0.6/100 = 25−9 = <b>16°C</b>
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555' }}>
                · 高考常考：给出等高线图和某点气温，求另一点气温（先算高差，再算温差）
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#BF360C' }}>
                3. 水库坝高/坝长估算
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', mb: 0.3 }}>
                · <b>坝高</b> = 设计蓄水位海拔 − 坝址处河床海拔（从等高线图中读取）
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', mb: 0.3 }}>
                · <b>坝长</b> = 坝址处等高线跨越河谷的水平距离（用比例尺换算）
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', mb: 0.3 }}>
                · 水库选址原则：① 口袋形洼地/盆地（库容大）；② 坝址选在峡谷最窄处（工程量小）；③ 上游集水面积大（水源充足）；④ 避开断层/喀斯特（防渗漏）
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555' }}>
                · 水库淹没范围 = 设计蓄水位等高线所围区域。移民安置和耕地损失是重要评价指标。
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default TerrainProfile;
