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

/** 高考真题示例与实际应用场景（每条公式一个） */
const gaokaoExamples: Record<string, { scene: string; question: string; analysis: string }> = {
  'timezone-diff': {
    scene: '实际应用场景',
    question: '当北京（东八区）上午10:00举行国际会议时，纽约（西五区）的参会者应在当地时间几点接入？',
    analysis: '时区差 = 8 − (−5) = 13小时。北京时间10:00 → 纽约时间 = 10:00 − 13h = 前一天21:00。国际商务和远程协作中，时差换算直接影响会议安排和截止时间设定。',
  },
  'local-time': {
    scene: '高考经典题型',
    question: '我国领土最西端（73°E）与最东端（135°E）的地方时相差多少？',
    analysis: '经度差 = 135° − 73° = 62°。地方时差 = 62° × 4分钟/° = 248分钟 = 4小时8分钟。这体现了我国东西跨经度广（约62°），最东端比最西端早4个多小时，是高考中国地理的常考知识点。',
  },
  'zone-time': {
    scene: '实际应用场景',
    question: '一架飞机于北京时间12:00从上海起飞，飞行11小时后抵达伦敦（零时区），到达时当地时间为几点？',
    analysis: '起飞时伦敦时间 = 12:00 − 8h = 4:00。飞行11小时后到达，伦敦时间 = 4:00 + 11h = 15:00。高考中常结合飞行时间进行时区换算，注意\"起飞→飞行→到达\"三步法。',
  },
  'sun-declination': {
    scene: '高考经典题型',
    question: '10月1日（国庆节）太阳直射点纬度约为多少？位于哪个半球？向什么方向移动？',
    analysis: '10月1日约是第274天。直射点纬度 ≈ 23.5° × sin[(274−81)×360/365] ≈ 23.5° × sin(190°) ≈ −4°（即4°S）。此时太阳直射南半球，且继续向南移动（向冬至日23.5°S运动）。秋分后直射点进入南半球是重要考点。',
  },
  'sun-altitude': {
    scene: '高考经典题型',
    question: '北回归线（23.5°N）在夏至日的正午太阳高度角是多少？',
    analysis: '夏至日直射23.5°N，北回归线上 H = 90° − |23.5° − 23.5°| = 90°。这是北回归线上唯一一天太阳直射（H=90°），立竿无影，是正午太阳高度角计算的典型例题。',
  },
  'daylength': {
    scene: '高考经典题型',
    question: '夏至日，北纬40°（北京附近）的昼长约为多少小时？',
    analysis: '夏至日直射23.5°N，φ=40°N。昼长 ≈ 2/15 × arccos(−tan40° × tan23.5°) ≈ 14.8小时。北半球纬度越高昼越长，40°N约15小时；60°N约18.5小时；北极圈（66.5°N）为24小时（极昼）。',
  },
  'distance': {
    scene: '高考经典题型',
    question: '我国最北端漠河（约53°N,122°E）至最南端曾母暗沙（约4°N,112°E）的直线距离约为多少千米？',
    analysis: 'Δφ = 49°，Δλ = 10°，平均纬度 cosφ ≈ cos28.5° ≈ 0.879。距离 ≈ 111 × √(49² + 10² × 0.879²) ≈ 111 × 49.1 ≈ 5450 km。我国南北跨约49个纬度，南北距离约5500km是必须记忆的地理数据。',
  },
  'slope': {
    scene: '实际应用场景',
    question: '某等高线地形图上，A点（200m）与B点（350m）间的水平距离为300m，该段坡度是否符合修筑公路的要求？',
    analysis: '坡度角 α = arctan(150/300) = arctan(0.5) ≈ 26.6°。公路最大纵坡一般不大于9%（约5°），26.6°远超公路标准，需要修建盘山公路或隧道。15°~25°宜林牧，>25°应退耕还林还草。',
  },
  'pop-density': {
    scene: '高考经典题型',
    question: '江苏省面积约10万km²，人口约8500万，人口密度约为多少？与全国平均水平相比如何？',
    analysis: '人口密度 = 8500 / 10 = 850 人/km²。全国平均约147人/km²，江苏约为全国的5.8倍。江苏是中国人口密度最高的省份之一（不含直辖市），体现了胡焕庸线以东人口高度集中的地理格局。',
  },
  'sun-altitude-season': {
    scene: '高考经典题型',
    question: '北京（40°N）在夏至日和冬至日的正午太阳高度角各是多少？',
    analysis: '夏至日：H = 90° − (40° − 23.5°) = 73.5°（太阳高度角最大）。冬至日：H = 90° − (40° + 23.5°) = 26.5°（太阳高度角最小）。年变化幅度 = 73.5° − 26.5° = 47°。正午太阳高度角的季节变化是判断昼夜长短和季节的重要依据。',
  },
  'sun-altitude-lat': {
    scene: '高考经典题型',
    question: '春分日，全球正午太阳高度角的分布规律是什么？',
    analysis: '春分日太阳直射赤道（δ=0°）。H = 90° − |φ − 0°| = 90° − |φ|。即赤道上H=90°，纬度越高H越小，两极为0°。正午太阳高度角从赤道向两极对称递减，这是二分日全球正午太阳高度角分布的最简规律。',
  },
  'map-scale': {
    scene: '高考经典题型',
    question: '在1:50000地形图上量得两地距离为4cm，实地距离是多少千米？实地5km在1:200000地图上的图上距离是多少？',
    analysis: '实地距离 = 4cm × 50000 = 200000cm = 2km。图上距离 = 500000cm / 200000 = 2.5cm。比例尺越大（分母越小），图上内容越详细，表示范围越小。高考常考比例尺大小比较和换算。',
  },
  'contour-interval': {
    scene: '高考经典题型',
    question: '某等高线地形图最高点1200m，最低点200m，共有21条等高线，等高距是多少？',
    analysis: '等高距 = (1200 − 200) / (21 − 1) = 1000/20 = 50m。等高线越密集表示坡度越大，密集处多为陡坡、陡崖；稀疏处为缓坡或平台。等高距是判读等高线地形图的首要参数。',
  },
  'urbanization-rate': {
    scene: '高考经典题型',
    question: '某国城镇人口4500万，农村人口1500万，城市化率为多少？处于什么发展阶段？',
    analysis: '城市化率 = 4500 / (4500+1500) × 100% = 75%。处于后期阶段（>70%），城市化速度放缓，可能出现逆城市化现象。高考常结合城市化阶段理论考查城市化水平的计算与判断。',
  },
  'industry-structure': {
    scene: '高考经典题型',
    question: '某地区GDP为5000亿元，第一产业500亿，第二产业2000亿，第三产业2500亿，产业结构如何？',
    analysis: '一产占比10%，二产占比40%，三产占比50%。三>二>一，符合\"后工业化\"阶段特征。判断经济发展水平：三产>60%可视为发达水平，二产比重先升后降反映工业化→去工业化过程。',
  },
  'pop-growth-rate': {
    scene: '高考经典题型',
    question: '某地区年出生率12‰，死亡率8‰，人口自然增长率是多少？属于哪种人口增长模式？',
    analysis: '自然增长率 = 12‰ − 8‰ = 4‰（正增长）。属于\"低—低—低\"（现代型）模式。增长率<10‰，符合发达国家/已完成人口转变的地区特征。若为负值则表明人口萎缩，面临老龄化挑战。',
  },
  'water-utilization': {
    scene: '高考经典题型',
    question: '华北地区某城市年水资源总量50亿m³，年用水量48亿m³，水资源利用率为多少？面临什么问题？',
    analysis: '水资源利用率 = 48/50 × 100% = 96%，远超过国际警戒线40%，属于极度紧张。华北地区是中国水资源最紧缺的区域之一，地下水超采形成\"漏斗区\"。高考常考南水北调的必要性论证。',
  },
  'carrying-capacity': {
    scene: '高考经典题型',
    question: '中国用占世界7%的耕地养活了约18%的人口，这说明了什么？环境承载力的关键影响因素有哪些？',
    analysis: '中国实际供养人口远超\"资源比例\"的推算值，关键在于科技进步（杂交水稻、化肥、灌溉技术）大幅提高了单位资源产出效率。这证明了科技发展水平是提升环境承载力的关键因素，而资源是基础性制约因素。高考常考\"科技因素在城市承载力提升中的作用\"。',
  },
};

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

              {/* Gaokao Example */}
              {gaokaoExamples[formula.id] && (
                <Box sx={{ mb: 1.5, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2, border: '1px solid #ffe082' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E65100', mb: 0.5 }}>
                    📝 {gaokaoExamples[formula.id].scene}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#333' }}>
                    {gaokaoExamples[formula.id].question}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
                    <b>解析：</b>{gaokaoExamples[formula.id].analysis}
                  </Typography>
                </Box>
              )}

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
