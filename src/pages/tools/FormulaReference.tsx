import React, { useRef, useState, useMemo } from 'react';
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  TextField, Button, Card, CardContent, Chip, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { geoFormulas } from '@/data/geoFormulas';
import {
  calcDeclination, calcSunAltitude, calcDayLength,
  calcLocalTime, calcZoneTime, calcDistance, calcSlope, calcPopDensity,
} from '@/utils/geoCalculations';

const FormulaReference: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [paramValues, setParamValues] = useState<Record<string, Record<string, number>>>({});
  const [calcResults, setCalcResults] = useState<Record<string, string>>({});
  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('全部');

  const categories = useMemo(() => ['全部', ...new Set(geoFormulas.map((f) => f.category))], []);

  const filteredFormulas = useMemo(() => {
    if (activeCategory === '全部') return geoFormulas;
    return geoFormulas.filter(f => f.category === activeCategory);
  }, [activeCategory]);

  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanels(prev =>
      isExpanded ? [...prev, panel] : prev.filter(p => p !== panel)
    );
  };

  const handleCalc = (formulaId: string) => {
    const formula = geoFormulas.find((f) => f.id === formulaId);
    if (!formula || !formula.params) return;

    const vals = paramValues[formulaId] || {};
    const params = formula.params;

    switch (formulaId) {
      case 'timezone-diff': {
        const diff = ((vals.lng1 || 0) - (vals.lng2 || 0)) * 4;
        setCalcResults((prev) => ({ ...prev, [formulaId]: `时差 = ${Math.abs(diff)} 分钟 (${diff >= 0 ? '东侧早' : '西侧早'})` }));
        break;
      }
      case 'local-time': {
        const res = calcLocalTime(vals.lng1 || 0, vals.time1 || 0, 0, vals.lng2 || 0);
        setCalcResults((prev) => ({ ...prev, [formulaId]: `地方时 = ${res.hour}:${String(res.minute).padStart(2, '0')}` }));
        break;
      }
      case 'zone-time': {
        const res = calcZoneTime(vals.zone1 || 0, vals.time1 || 0, 0, vals.zone2 || 0);
        setCalcResults((prev) => ({ ...prev, [formulaId]: `区时 = ${res.hour}:${String(res.minute).padStart(2, '0')}` }));
        break;
      }
      case 'sun-declination': {
        const decl = calcDeclination(vals.day || 172);
        setCalcResults((prev) => ({ ...prev, [formulaId]: `直射点纬度 = ${decl >= 0 ? 'N' : 'S'} ${Math.abs(decl).toFixed(2)}°` }));
        break;
      }
      case 'sun-altitude': {
        const h = calcSunAltitude(vals.lat || 0, vals.decl || 0);
        setCalcResults((prev) => ({ ...prev, [formulaId]: `正午太阳高度角 H = ${h.toFixed(2)}°` }));
        break;
      }
      case 'daylength': {
        const dl = calcDayLength(vals.lat || 0, vals.decl || 0);
        setCalcResults((prev) => ({ ...prev, [formulaId]: `昼长 = ${dl.toFixed(2)} 小时 (${Math.floor(dl)}时${Math.round((dl % 1) * 60)}分)` }));
        break;
      }
      case 'distance': {
        const d = calcDistance(vals.lat1 || 0, vals.lng1 || 0, vals.lat2 || 0, vals.lng2 || 0);
        setCalcResults((prev) => ({ ...prev, [formulaId]: `距离 ≈ ${d.toFixed(1)} km` }));
        break;
      }
      case 'slope': {
        const s = calcSlope(vals.h || 0, vals.d || 1);
        setCalcResults((prev) => ({ ...prev, [formulaId]: `坡度 = ${s.toFixed(2)}°` }));
        break;
      }
      case 'pop-density': {
        const pd = calcPopDensity(vals.population || 0, vals.area || 1);
        setCalcResults((prev) => ({ ...prev, [formulaId]: `人口密度 = ${pd.toFixed(2)} 人/km²` }));
        break;
      }
      case 'temp-lapse-rate': {
        const lapse = -0.6 * ((vals.h || 0) / 100);
        const t2 = (vals.temp || 20) + lapse;
        setCalcResults((prev) => ({ ...prev, [formulaId]: `目标地气温 ≈ ${t2.toFixed(1)}°C (下降${Math.abs(lapse).toFixed(1)}°C)` }));
        break;
      }
      case 'rel-humidity': {
        const rh = ((vals.e || 15) / (vals.E || 25)) * 100;
        setCalcResults((prev) => ({ ...prev, [formulaId]: `相对湿度 = ${rh.toFixed(1)}% (${rh > 75 ? '潮湿' : rh < 30 ? '干燥' : '适中'})` }));
        break;
      }
      case 'natural-growth':
      case 'pop-growth-rate': {
        const gr = ((vals.birthRate || vals.birth || 10) - (vals.deathRate || vals.death || 7));
        setCalcResults((prev) => ({ ...prev, [formulaId]: `自然增长率 = ${gr.toFixed(1)}‰ (${gr > 0 ? '正增长' : '负增长'})` }));
        break;
      }
      case 'river-gradient': {
        const grad = ((vals.deltaH || 5000) / ((vals.length || 6300) * 1000)) * 100;
        setCalcResults((prev) => ({ ...prev, [formulaId]: `河流比降 ≈ ${grad.toFixed(3)}%` }));
        break;
      }
      case 'scale-ratio':
      case 'map-scale': {
        const realDist = ((vals.M || vals.mapDist || 1000000) * (vals.d || vals.mapDist || 5)) / 100000;
        setCalcResults((prev) => ({ ...prev, [formulaId]: `实地距离 ≈ ${realDist.toFixed(1)} km` }));
        break;
      }
      case 'contour-interval': {
        const interval = ((vals.hMax || vals.maxElev || 800) - (vals.hMin || vals.minElev || 100)) / ((vals.contourLines || 20) - 1);
        setCalcResults((prev) => ({ ...prev, [formulaId]: `等高距 ≈ ${interval.toFixed(0)} m` }));
        break;
      }
      case 'sun-altitude-season':
      case 'sun-altitude-lat': {
        const h2 = calcSunAltitude(vals.lat || 0, vals.decl || 0);
        setCalcResults((prev) => ({ ...prev, [formulaId]: `正午太阳高度角 H = ${h2.toFixed(2)}°` }));
        break;
      }
      case 'urbanization-rate': {
        const ur = ((vals.urbanPop || 92000) / (vals.totalPop || 141000)) * 100;
        const stage = ur < 30 ? '初期' : ur < 70 ? '中期' : '后期';
        setCalcResults((prev) => ({ ...prev, [formulaId]: `城市化率 = ${ur.toFixed(1)}% (${stage}阶段)` }));
        break;
      }
      case 'industry-structure': {
        const gdp = vals.gdp || 1260000;
        const p1 = ((vals.primaryVal || 90000) / gdp * 100).toFixed(1);
        const p2 = ((vals.secondaryVal || 480000) / gdp * 100).toFixed(1);
        const p3 = ((vals.tertiaryVal || 690000) / gdp * 100).toFixed(1);
        setCalcResults((prev) => ({ ...prev, [formulaId]: `一产${p1}% / 二产${p2}% / 三产${p3}%` }));
        break;
      }
      case 'water-utilization': {
        const wu = ((vals.annualUse || 6000) / (vals.totalWater || 28000)) * 100;
        const level = wu < 10 ? '低度紧张' : wu < 20 ? '中度紧张' : wu < 40 ? '中高度紧张' : '高度紧张';
        setCalcResults((prev) => ({ ...prev, [formulaId]: `水资源利用率 = ${wu.toFixed(1)}% (${level})` }));
        break;
      }
      default: {
        setCalcResults((prev) => ({ ...prev, [formulaId]: '计算功能尚未实现' }));
        break;
      }
    }
  };

  const updateParam = (formulaId: string, paramName: string, value: number) => {
    setParamValues((prev) => ({
      ...prev,
      [formulaId]: { ...(prev[formulaId] || {}), [paramName]: value },
    }));
  };

  const categoryIcons: Record<string, string> = {
    '全部': '📚',
    '时差计算': '🕐',
    '太阳高度角': '☀️',
    '昼夜长短': '🌓',
    '距离计算': '📏',
    '地形计算': '⛰️',
    '人文计算': '🏙️',
    '大气计算': '🌡️',
    '地图计算': '🗺️',
  };

  return (
    <ToolPageLayout title="地理计算公式速查" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ maxWidth: 900 }}>
        {/* Category Filter Chips */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>按分类筛选</Typography>
          <ToggleButtonGroup
            value={activeCategory}
            exclusive
            onChange={(_, v) => { if (v) setActiveCategory(v); }}
            size="small"
            color="success"
          >
            {categories.map((cat) => (
              <ToggleButton key={cat} value={cat} sx={{ px: 1.5, py: 0.5 }}>
                {categoryIcons[cat] || '📋'} {cat}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Typography variant="body2" sx={{ color: '#757575', mt: 0.5 }}>
            共 {filteredFormulas.length} 个公式 {activeCategory !== '全部' && `(${activeCategory})`}
          </Typography>
        </Box>

        {/* Formula List */}
        {filteredFormulas.map((formula) => (
          <Accordion
            key={formula.id}
            expanded={expandedPanels.includes(formula.id)}
            onChange={handleAccordionChange(formula.id)}
            sx={{
              mb: 0.5,
              border: '1px solid #e0e0e0',
              borderRadius: '8px !important',
              '&:before': { display: 'none' },
              '&.Mui-expanded': { margin: '0 0 4px 0 !important' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: '#f5f5f5',
                borderRadius: '8px',
                '&.Mui-expanded': { borderRadius: '8px 8px 0 0' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', width: '100%' }}>
                <Chip
                  label={formula.category}
                  size="small"
                  sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: '0.7rem' }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {formula.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    color: '#1565C0',
                    bgcolor: '#E3F2FD',
                    px: 1,
                    py: 0.3,
                    borderRadius: 1,
                    fontSize: '0.8rem',
                  }}
                >
                  {formula.formula}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1.5, color: '#555', lineHeight: 1.7 }}>
                {formula.description}
              </Typography>

              {formula.params && (
                <Box sx={{ bgcolor: '#fafafa', p: 1.5, borderRadius: 2, mb: 1, border: '1px solid #eee' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    🧮 交互计算
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    {formula.params.map((p) => (
                      <TextField
                        key={p.name}
                        size="small"
                        type="number"
                        label={`${p.label}`}
                        value={(paramValues[formula.id] || {})[p.name] ?? p.defaultValue}
                        onChange={(e) => updateParam(formula.id, p.name, parseFloat(e.target.value) || 0)}
                        sx={{ width: 150 }}
                        slotProps={{ htmlInput: { step: 0.1 } }}
                        helperText={`单位: ${p.unit}`}
                      />
                    ))}
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleCalc(formula.id)}
                    sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
                  >
                    计算
                  </Button>
                  {calcResults[formula.id] && (
                    <Card sx={{ mt: 1.5, bgcolor: '#e8f5e9', border: '1px solid #2E7D32' }}>
                      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                          ✅ {calcResults[formula.id]}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </ToolPageLayout>
  );
};

export default FormulaReference;
