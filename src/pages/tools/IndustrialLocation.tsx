import React, { useRef, useState } from 'react';
import {
  Box, Typography, Select, MenuItem, FormControl, InputLabel, List, ListItem,
  ListItemText, Divider, Accordion, AccordionSummary, AccordionDetails,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import RadarChart from '@/components/shared/RadarChart';
import { industryTypes } from '@/data/geoFormulas';

// ─── 四大工业基地数据 ───────────────────────────────────────────────
const fourBases = [
  {
    name: '辽中南工业基地',
    tag: '资源丰富型 · 重工业摇篮',
    color: '#AD1457',
    bg: '#fce4ec',
    cities: '沈阳、大连、鞍山、抚顺、本溪',
    advantages: '①煤、铁、石油等矿产资源丰富；②海陆交通便利（大连港、京哈铁路）；③工业基础雄厚（"新中国工业摇篮"）；④劳动力丰富',
    constraints: '①资源枯竭（煤炭资源趋减）；②产业结构单一（重工业为主）；③水资源短缺；④环境污染严重',
    direction: '①调整产业结构，发展高新技术和现代服务业；②治理环境污染；③发展循环经济；④振兴东北老工业基地战略',
  },
  {
    name: '京津唐工业基地',
    tag: '资源丰富型 · 科技+政治中心',
    color: '#7B1FA2',
    bg: '#f3e5f5',
    cities: '北京、天津、唐山、秦皇岛',
    advantages: '①煤、铁、石油、海盐等资源丰富（华北油田、开滦煤矿、长芦盐场）；②京津唐城市群市场广阔；③科技教育发达（北京高校和科研院所密集）；④交通枢纽（天津港、北京首都机场）',
    constraints: '①水资源严重短缺（华北"漏斗区"）；②能源供应紧张；③首都功能疏解（非首都功能外迁）；④大气污染治理压力大',
    direction: '①发展高新技术产业（中关村、雄安新区）；②京津冀协同发展战略；③南水北调缓解水资源压力；④疏解非首都功能',
  },
  {
    name: '沪宁杭工业基地',
    tag: '资源贫乏型 · 中国最大综合工业基地',
    color: '#283593',
    bg: '#e8eaf6',
    cities: '上海、南京、杭州、苏州、无锡、宁波',
    advantages: '①地理位置优越（长江入海口，"T"字形交汇点）；②水陆交通便利（上海港世界第一大港、长江黄金水道）；③科技力量雄厚（高校密集）；④市场腹地广阔（长三角城市群）；⑤产业基础好，经济发达',
    constraints: '①能源和矿产资源贫乏（几乎全部依赖外调）；②土地资源紧张（用地成本高）；③部分产业同质化竞争',
    direction: '①发展高端制造业和现代服务业；②建设国际航运中心和金融中心；③长三角一体化战略；④产业升级（"腾笼换鸟"）',
  },
  {
    name: '珠三角工业基地',
    tag: '资源贫乏型 · 外向型经济引擎',
    color: '#00695C',
    bg: '#e0f2f1',
    cities: '广州、深圳、香港、东莞、佛山、珠海',
    advantages: '①毗邻港澳，靠近东南亚，区位优势独特；②华侨众多，外资来源丰富；③改革开放政策先行区（经济特区）；④劳动力充足；⑤交通便捷（粤港澳大湾区一体化）',
    constraints: '①能源和矿产资源短缺；②产业层次偏低（传统加工贸易为主）；③土地开发强度高；④劳动力成本上升',
    direction: '①向高端制造业和现代服务业转型；②粤港澳大湾区建设（世界级湾区）；③科技创新（深圳建设国际科创中心）；④"腾笼换鸟"产业升级',
  },
];

// ─── 世界案例数据 ───────────────────────────────────────────────────
const worldCases = [
  {
    title: '🏭 德国鲁尔区',
    subtitle: '传统工业区振兴典范 · 高考五星考点',
    color: '#AD1457',
    bg: '#fce4ec',
    border: '#f8bbd0',
    sections: [
      {
        label: '📍 区位优势',
        content: '①煤炭资源丰富（鲁尔煤田，欧洲最大煤田之一）；②水陆交通便利（莱茵河、鲁尔河水运+密集铁路网）；③靠近法国洛林铁矿（后期进口铁矿石）；④西欧巨大消费市场；⑤充沛的水源（鲁尔河、莱茵河）。',
      },
      {
        label: '🏗️ 产业特征',
        content: '以煤炭、钢铁、机械、化工为核心的重工业体系，曾占德国工业产值40%。属于典型的"煤铁复合型"工业区。',
      },
      {
        label: '📉 衰落原因（20世纪60年代后）',
        content: '①煤炭地位下降（石油、天然气替代）；②铁矿枯竭（依赖进口→向沿海转移）；③产业结构单一（"煤铁复合型"）；④环境恶化；⑤新技术冲击。',
      },
      {
        label: '🔄 振兴措施（必背）',
        content: '①调整产业结构——发展高新技术和第三产业（电子信息、生物医药）；②治理环境污染（埃姆舍河生态修复）；③完善交通网络；④旧工业用地再利用（工业博物馆、文化创意园）。',
      },
      {
        label: '💡 高考启示',
        content: '鲁尔区是传统工业区衰落与转型的标准案例，可与辽中南工业基地（东北振兴）进行对比分析。核心逻辑：原料导向→市场/技术导向的转型路径。',
      },
    ],
  },
  {
    title: '💻 美国硅谷',
    subtitle: '高新技术工业区代表 · 高考高频考点',
    color: '#283593',
    bg: '#e8eaf6',
    border: '#c5cae9',
    sections: [
      {
        label: '📍 区位优势（独有"创新生态"）',
        content: '①斯坦福大学——顶尖人才和技术来源（产学研结合）；②风险资本（Sand Hill Road）——创业公司的燃料；③宜人气候（地中海气候）和优美环境吸引人才；④集聚效应——世界高科技企业总部云集（Apple、Google、Meta、NVIDIA）；⑤创新文化（容忍失败、开放协作）；⑥临近旧金山国际机场（全球连接）。',
      },
      {
        label: '🏗️ 产业特征',
        content: '以微电子（芯片）→计算机→互联网→AI产业链为核心，辐射全球。集群效应极强，形成了完整的创新生态系统。',
      },
      {
        label: '🆚 与传统工业区的本质区别',
        content: '①不依赖自然资源（无煤无铁）——依靠"智力资源"；②从业人员以科学家和工程师为主（高学历、高工资）；③产品"轻、薄、短、小"——航空运输替代水运/铁路；④环境质量要求高（洁净的空气和水是芯片制造的前提）。',
      },
      {
        label: '💡 高考对比要点',
        content: '硅谷 vs 鲁尔区 = 知识导向型 vs 原料导向型；硅谷 vs 中关村/深圳 = 不同国家的创新路径比较。重点理解"新工业区"的区位逻辑与传统的根本差异。',
      },
    ],
  },
  {
    title: '👗 意大利新工业区',
    subtitle: '中小企业集聚典范 · "第三意大利"',
    color: '#00695C',
    bg: '#e0f2f1',
    border: '#b2dfdb',
    sections: [
      {
        label: '📍 区位特征',
        content: '①以中小企业为主（与传统大规模工厂不同）；②以轻工业为主（纺织、服装、陶瓷、家具、制鞋）；③高度专业化分工——一村一品/一镇一业（如普拉托毛纺织、萨索罗瓷砖）；④分散布局在小城镇和农村——"工业小区"模式；⑤形成生产—销售—服务网络。与温州模式非常相似。',
      },
      {
        label: '🆚 与传统工业区的区别',
        content: '①"小"而"专"——不是大企业寡头垄断，而是中小企业集群协作；②灵活性强——可根据市场快速调整产品；③省去大型设备投资（轻工业固定资产少）；④根植于本地社会文化网络。',
      },
      {
        label: '💡 高考命题模式',
        content: '常以意大利新工业区为案例，要求分析中小企业集聚的优势（信息共享、协作配套、品牌效应、降低运费），或与中国浙江温州/义乌模式进行中外对比。关键词：专业化、集群化、社会化服务。',
      },
    ],
  },
  {
    title: '🚢 日本太平洋沿岸工业带',
    subtitle: '临港型工业代表 · 高考拓展',
    color: '#E65100',
    bg: '#fff3e0',
    border: '#ffcc80',
    sections: [
      {
        label: '📍 形成背景（"两头在外"）',
        content: '日本矿产资源极度贫乏（煤、铁、石油几乎全部依赖进口），但拥有优良港湾和发达的造船业。因此工业布局选择临港型——工厂建在沿海港口附近，原料进口→加工→产品出口一步到位。',
      },
      {
        label: '🏗️ 区位优势',
        content: '①深水良港密集（东京湾、大阪湾、伊势湾）；②廉价海运（超级油轮/矿砂船）降低运输成本；③高素质劳动力和先进技术；④外向型经济（产品出口全球）。海运成本大幅下降是临港型工业出现的根本原因。',
      },
      {
        label: '🗺️ 五大工业区（自东向西）',
        content: '京滨（东京-横滨，机械、电子）→中京（名古屋，汽车、航空）→阪神（大阪-神户，钢铁、造船）→濑户内（化工、钢铁）→北九州（钢铁、机械）。形成世界最密集的临海工业带。',
      },
      {
        label: '💡 高考启示',
        content: '临港型工业布局反映了"移铁就港"的趋势（铁矿石海运成本降低后，钢铁工业从煤铁复合型→临港型）。这是工业区位演变的重要案例，体现了交通技术进步对工业布局的深刻影响。',
      },
    ],
  },
];

// ─── 传统工业 vs 新工业对比表数据 ─────────────────────────────────
const traditionalVsNew = {
  header: ['特征维度', '传统工业', '新工业'],
  rows: [
    ['典型代表', '鲁尔区、辽中南、五大湖', '硅谷、意大利新工业区、中关村'],
    ['主导区位因素', '原料、能源、交通', '知识、技术、创新环境'],
    ['企业规模', '大型企业为主', '中小企业为主（或大型高科技企业）'],
    ['产业类型', '重工业（钢铁、机械、化工）', '高新技术产业 / 轻工业'],
    ['布局特点', '集中（集聚效应）', '分散或柔性集聚（寻找最优区位）'],
    ['环境要求', '较低', '较高（洁净环境）'],
    ['劳动力类型', '普通劳动力为主', '高素质人才 / 低成本劳动力'],
    ['产品特点', '重、厚、长、大', '轻、薄、短、小'],
    ['运输方式', '水运、铁路为主', '航空、高速公路为主'],
  ],
};

const IndustrialLocation: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState('labor-oriented');

  // 四大工业基地展开状态
  const [expandedBases, setExpandedBases] = useState<string[]>([]);
  // 工业分散与新工业区展开
  const [expandedDispersion, setExpandedDispersion] = useState<string[]>([]);
  // 传统vs新工业对比表展开
  const [showComparison, setShowComparison] = useState(false);

  const industry = industryTypes.find((i) => i.id === selectedId) || industryTypes[0];

  const handleBaseToggle = (name: string) => (_: React.SyntheticEvent, expanded: boolean) => {
    setExpandedBases(prev => expanded ? [...prev, name] : prev.filter(n => n !== name));
  };

  const handleDispersionToggle = (key: string) => (_: React.SyntheticEvent, expanded: boolean) => {
    setExpandedDispersion(prev => expanded ? [...prev, key] : prev.filter(k => k !== key));
  };

  return (
    <ToolPageLayout title="工业区位分析" exportRef={exportRef}>
      {/* ═══════ 顶部：雷达图 + 因素详解 ═══════ */}
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}>
        {/* ── 左面板：雷达图（保持不变） ── */}
        <Box sx={{ flex: 1 }}>
          <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
            <InputLabel>工业类型</InputLabel>
            <Select value={selectedId} label="工业类型" onChange={(e) => setSelectedId(e.target.value)}>
              {industryTypes.map((i) => (
                <MenuItem key={i.id} value={i.id}>{i.name}（{i.orientation}）</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            {industry.name} · 区位因素权重雷达图
          </Typography>
          <RadarChart
            labels={industry.factors.map((f) => f.name)}
            values={industry.factors.map((f) => f.weight)}
            title={industry.name}
            color="#7B1FA2"
            height={350}
          />
        </Box>

        {/* ── 右面板：因素详解（保持不变） ── */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            区位因素详解
          </Typography>
          <List>
            {industry.factors
              .sort((a, b) => b.weight - a.weight)
              .map((factor, i) => (
                <ListItem key={i} sx={{ py: 0.5, alignItems: 'flex-start' }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {factor.name}
                        </Typography>
                        <Box sx={{
                          flex: 1, height: 8, bgcolor: '#eee', borderRadius: 4, overflow: 'hidden',
                        }}>
                          <Box sx={{
                            width: `${factor.weight * 100}%`,
                            height: '100%',
                            bgcolor: '#7B1FA2',
                            borderRadius: 4,
                            transition: 'width 0.3s',
                          }} />
                        </Box>
                        <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'right' }}>
                          {(factor.weight * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    }
                    secondary={factor.description}
                    slotProps={{ secondary: { variant: 'body2', color: '#757575' } }}
                  />
                </ListItem>
              ))}
          </List>

          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f3e5f5', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7B1FA2' }}>
              📌 {industry.orientation}
            </Typography>
            {industry.detailDesc && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {industry.detailDesc}
              </Typography>
            )}
            <Typography variant="body2">
              该工业类型的首要区位因素是<b>{industry.factors.sort((a, b) => b.weight - a.weight)[0].name}</b>，
              应优先布局在{industry.factors.sort((a, b) => b.weight - a.weight)[0].description.toLowerCase()}的地区。
            </Typography>
          </Box>

          {/* Examples */}
          {industry.examples && industry.examples.length > 0 && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8eaf6', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#283593', mb: 0.5 }}>
                🏭 典型工业举例
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {industry.examples.map((ex, i) => (
                  <Typography key={i} variant="body2" sx={{
                    bgcolor: '#c5cae9', px: 1, py: 0.3, borderRadius: 1,
                    fontSize: '0.8rem',
                  }}>
                    {ex}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {/* Gaokao Tips */}
          {industry.gaokaoTips && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2, borderLeft: '4px solid #FF8F00' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E65100', mb: 0.5 }}>
                💡 学习提示 (Gaokao Tips)
              </Typography>
              <Typography variant="body2">
                {industry.gaokaoTips}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ═══════ 工业区位选择历史演变 ═══════ */}
      <Box sx={{ mt: 3, width: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#7B1FA2' }}>
          📈 工业区位选择的历史演变
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
          随着生产力发展和科技进步，工业区位选择的主导因素经历了从<b>原料导向→市场导向→知识导向</b>的演变过程。理解这一演变规律是高考工业区位分析的核心素养。
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, p: 2, bgcolor: '#fce4ec', borderRadius: 2, border: '1px solid #f8bbd0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#AD1457' }}>🏭 第一阶段：原料导向型</Typography>
            <Typography variant="caption" sx={{ color: '#AD1457', display: 'block', mb: 1 }}>第一次工业革命 ~ 19世纪末</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#555' }}>
              蒸汽机时代，原料和燃料运输成本极高。<b>工厂紧邻原料产地或能源基地</b>。
              典型：英国伯明翰钢铁工业（近煤铁）、德国鲁尔区（近煤）。
              特征：工业布局呈现"<b>移铁就煤</b>"或"<b>移煤就铁</b>"的格局。
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, p: 2, bgcolor: '#e8eaf6', borderRadius: 2, border: '1px solid #c5cae9' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#283593' }}>🚂 第二阶段：市场导向型</Typography>
            <Typography variant="caption" sx={{ color: '#283593', display: 'block', mb: 1 }}>第二次工业革命 ~ 20世纪中后期</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#555' }}>
              电力时代，运输技术进步（铁路网、海运）。<b>工厂向消费市场集中</b>。
              典型：美国五大湖工业区（水运便利+巨大市场）、日本太平洋沿岸工业带（临港型）。
              特征：原料和产品的运输成本降低，<b>市场规模和交通枢纽地位</b>成为主导因素。
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, p: 2, bgcolor: '#e0f2f1', borderRadius: 2, border: '1px solid #b2dfdb' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00695C' }}>💻 第三阶段：知识/技术导向型</Typography>
            <Typography variant="caption" sx={{ color: '#00695C', display: 'block', mb: 1 }}>第三次工业革命（信息技术革命）至今</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#555' }}>
              信息时代，知识和技术成为核心生产要素。<b>企业向科技中心和人才聚集区靠拢</b>。
              典型：美国硅谷（斯坦福大学+风险资本）、中国中关村（清华北大+科研院所）、深圳南山科技园。
              特征：<b>高素质人才、创新环境、信息通达度</b>成为决定性区位因素。原料和市场的影响力相对下降。
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2, borderLeft: '4px solid #FF8F00' }}>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#E65100' }}>
            <b>💡 高考要点：</b>工业区位选择变化反映了生产力发展水平。①原料导向→市场导向：交通运输技术进步降低了原料的运输成本；②市场导向→知识导向：科技进步使知识成为第一生产力。答题时务必结合具体时代背景分析区位因素的变化。
          </Typography>
        </Box>
      </Box>

      {/* ═══════ 中国四大工业基地对比（重构为可展开卡片） ═══════ */}
      <Box sx={{ mt: 3, width: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#7B1FA2' }}>
          🏗️ 中国四大工业基地对比
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
          中国四大工业基地是高考高频考点，掌握各基地的<b>区位优势、制约因素和发展方向</b>至关重要。点击展开查看详情。
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {fourBases.map((base) => (
            <Accordion
              key={base.name}
              expanded={expandedBases.includes(base.name)}
              onChange={handleBaseToggle(base.name)}
              sx={{
                border: `1px solid ${base.color}30`,
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: base.color }} />}
                sx={{
                  bgcolor: base.bg,
                  borderRadius: '8px',
                  '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.5 },
                }}
              >
                <Typography sx={{ fontWeight: 700, color: base.color, fontSize: '0.95rem' }}>
                  {base.name}
                </Typography>
                <Box
                  sx={{
                    px: 1, py: 0.2, borderRadius: 1,
                    bgcolor: `${base.color}18`, color: base.color,
                    fontSize: '0.75rem', fontWeight: 600,
                  }}
                >
                  {base.tag}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 2, pb: 2.5, px: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* 核心城市 */}
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#333', mb: 0.5 }}>
                      🏙️ 核心城市
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7 }}>
                      {base.cities}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* 四列网格：优势 / 制约 / 方向 */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' } }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#2E7D32', mb: 0.5 }}>
                        ✅ 优势条件
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7 }}>
                        {base.advantages}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' } }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#c62828', mb: 0.5 }}>
                        ⚠️ 制约因素
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: '#c62828', lineHeight: 1.7 }}>
                        {base.constraints}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' } }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1565C0', mb: 0.5 }}>
                        🎯 发展方向
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: '#1565C0', lineHeight: 1.7 }}>
                        {base.direction}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e0f2f1', borderRadius: 2, borderLeft: '4px solid #00695C' }}>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#00695C' }}>
            <b>📌 四大基地共同规律：</b>①都分布在<b>东部沿海</b>地区（交通便利、市场广阔）；②沪宁杭和珠三角属于<b>"资源贫乏型"</b>（靠交通和市场弥补），辽中南和京津唐属于<b>"资源丰富型"</b>（靠资源起家）；③都面临产业结构优化升级的共同课题。
          </Typography>
        </Box>
      </Box>

      {/* ═══════ 世界典型工业区案例对比（重构为Accordion卡片） ═══════ */}
      <Box sx={{ mt: 3, width: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#7B1FA2' }}>
          🌍 世界典型工业区案例对比（高考综合题高频考点）
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
          掌握世界典型工业区的<b>区位条件、产业特征和发展演变</b>，是高考工业地理综合题的重要素材。以下是四个最具代表性的案例。
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {worldCases.map((wc) => (
            <Box
              key={wc.title}
              sx={{
                flex: { xs: '1 1 100%', md: '1 1 48%' },
                bgcolor: wc.bg,
                borderRadius: 2,
                border: `1px solid ${wc.border}`,
                overflow: 'hidden',
              }}
            >
              {/* 卡片标题 */}
              <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: wc.color, fontSize: '0.9rem' }}>
                  {wc.title}
                </Typography>
                <Typography variant="caption" sx={{ color: wc.color, opacity: 0.8, fontSize: '0.75rem' }}>
                  {wc.subtitle}
                </Typography>
              </Box>

              {/* 可展开的各节 */}
              <Box sx={{ px: 1.5, pb: 1.5 }}>
                {wc.sections.map((sec, idx) => (
                  <Accordion
                    key={sec.label}
                    defaultExpanded={false}
                    sx={{
                      mb: idx < wc.sections.length - 1 ? 0.5 : 0,
                      bgcolor: 'rgba(255,255,255,0.6)',
                      boxShadow: 'none',
                      border: `1px solid ${wc.border}`,
                      borderRadius: '6px !important',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ fontSize: '1.1rem', color: wc.color }} />}
                      sx={{
                        minHeight: '36px !important',
                        '& .MuiAccordionSummary-content': { margin: '6px 0 !important' },
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: wc.color }}>
                        {sec.label}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, pb: 1.5 }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.8 }}>
                        {sec.content}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2, borderLeft: '4px solid #FF8F00' }}>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#E65100' }}>
            <b>💡 四大案例对比规律：</b>鲁尔区（原料导向型→转型）→ 硅谷（技术导向型）→ 意大利新工业区（中小企业集群）→ 日本临港型（交通导向型）。这四种模式代表了工业布局主导因素的演变链：<b>原料→交通→市场→技术</b>。高考综合题常要求"结合具体案例，分析区位因素的变化对工业布局的影响"。
          </Typography>
        </Box>
      </Box>

      {/* ═══════ 工业分散与工业地域（新增） ═══════ */}
      <Box sx={{ mt: 3, width: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#7B1FA2' }}>
          🔀 工业分散与工业地域
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
          工业分散是高考工业地理的进阶考点，理解<b>为什么分散、分散到哪里</b>是分析现代工业布局的核心思维。
        </Typography>

        {/* 分散原因 */}
        <Accordion
          expanded={expandedDispersion.includes('reasons')}
          onChange={handleDispersionToggle('reasons')}
          sx={{
            mb: 1, border: '1px solid #e0e0e0', borderRadius: '8px !important',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}
            sx={{ bgcolor: '#fce4ec', borderRadius: '8px' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#AD1457' }}>
              📤 工业分散的原因
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2, pb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#333' }}>
                  ① 产品特性变化
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7 }}>
                  原料和产品的运输量小、重量轻（如电子元器件），运费占总成本比例极低，企业不必集中在原料地或市场附近，可以在更大范围寻找最优区位。
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#333' }}>
                  ② 交通与信息技术进步
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7 }}>
                  现代高速公路网、航空货运、互联网通信使远距离协调生产成为可能。企业可将研发中心放在硅谷、组装工厂放在东南亚，形成<b>全球生产网络</b>。
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#333' }}>
                  ③ 寻找最优区位
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7 }}>
                  企业根据不同环节的需求分置：研发→靠近大学/科技中心，制造→靠近廉价劳动力/优惠政策地区，组装→靠近市场。典型如苹果公司：设计在硅谷，零部件全球采购，组装在中国富士康。
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#333' }}>
                  ④ 环境因素
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7 }}>
                  某些重污染工业需远离人口密集区；而精密电子工业（如芯片制造）本身要求洁净环境，促使企业选址向环境质量高的地区分散。
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 新工业区类型 */}
        <Accordion
          expanded={expandedDispersion.includes('types')}
          onChange={handleDispersionToggle('types')}
          sx={{
            mb: 1, border: '1px solid #e0e0e0', borderRadius: '8px !important',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}
            sx={{ bgcolor: '#e8eaf6', borderRadius: '8px' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#283593' }}>
              🏭 新工业区的主要类型
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2, pb: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1565C0', mb: 0.5 }}>
                  💻 高新技术工业区
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7 }}>
                  以知识和技术为核心。典型：美国硅谷、中国中关村、印度班加罗尔。特点：靠近大学/科研机构、依赖航空运输、环境质量高、从业人员高学历化。
                </Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#2E7D32', mb: 0.5 }}>
                  🏘️ 中小企业集聚区
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7 }}>
                  专业化分工+灵活生产。典型：意大利"第三意大利"、浙江温州模式。特点：一镇一业、中小企业集群协作、根植于本地社会网络、轻工业为主。
                </Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#E65100', mb: 0.5 }}>
                  ✈️ 临空型工业区
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7 }}>
                  依赖航空运输的"轻薄短小"产品。典型：机场周边的电子、医药、精密仪器产业。特点：紧邻国际机场、产品体积小价值高、时效性要求极强。
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 工业地域 */}
        <Accordion
          expanded={expandedDispersion.includes('region')}
          onChange={handleDispersionToggle('region')}
          sx={{
            mb: 1, border: '1px solid #e0e0e0', borderRadius: '8px !important',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}
            sx={{ bgcolor: '#e0f2f1', borderRadius: '8px' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#00695C' }}>
              🌐 工业地域的形成
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2, pb: 2 }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.8, mb: 1.5 }}>
              <b>工业分散</b>和<b>工业集聚</b>是工业区位选择的一体两面：
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' }, p: 1.5, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#7B1FA2', mb: 0.5 }}>
                  📦 工业集聚（传统模式）
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7 }}>
                  相关企业集中布局以共享基础设施、降低运输成本、加强信息交流。形成<b>工业地域</b>（如鲁尔区、五大湖区）。集聚过度会导致地价上涨、环境污染、交通拥堵等问题，从而推动分散。
                </Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' }, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#E65100', mb: 0.5 }}>
                  📡 工业分散（现代趋势）
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.7 }}>
                  企业各环节分散到不同地区，形成跨区域的<b>生产网络</b>。分散不是"无序分布"，而是形成新的、更大尺度的<b>工业地域联系</b>（如全球供应链）。高考常考"工业地域联系"的概念及其与全球化的关系。
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2, borderLeft: '4px solid #FF8F00' }}>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#E65100' }}>
            <b>💡 高考要点：</b>①工业分散≠任意分散——是<b>有组织的地理分散</b>，仍保持紧密的工业联系（如跨国公司全球布局）；②判断是否适合分散：看<b>产品是否"轻薄短小"</b>（运费占比低）、<b>生产环节是否可拆分</b>（模块化生产）；③分散后企业之间仍保持<b>信息、资金、技术流动</b>，形成"分散的工业地域"。
          </Typography>
        </Box>
      </Box>

      {/* ═══════ 传统工业 vs 新工业对比表（新增） ═══════ */}
      <Box sx={{ mt: 3, width: '100%' }}>
        <Box
          onClick={() => setShowComparison(!showComparison)}
          sx={{
            p: 2, bgcolor: '#f3e5f5', borderRadius: 2, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 1,
            border: '1px solid #ce93d8', userSelect: 'none',
          }}
        >
          <ExpandMoreIcon
            sx={{
              color: '#7B1FA2', fontSize: '1.3rem', transition: 'transform 0.3s',
              transform: showComparison ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#7B1FA2' }}>
            📊 传统工业 vs 新工业 对比表
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#9c27b0', ml: 1 }}>
            {showComparison ? '（点击收起）' : '（点击展开）'}
          </Typography>
        </Box>

        {showComparison && (
          <TableContainer component={Paper} sx={{ mt: 1.5, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f3e5f5' }}>
                  {traditionalVsNew.header.map((h, i) => (
                    <TableCell
                      key={i}
                      sx={{
                        fontWeight: 700, color: '#7B1FA2', fontSize: '0.85rem',
                        ...(i === 0 ? { width: '18%' } : { width: '41%' }),
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {traditionalVsNew.rows.map((row, ri) => (
                  <TableRow key={ri} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                    {row.map((cell, ci) => (
                      <TableCell
                        key={ci}
                        sx={{
                          fontSize: '0.85rem',
                          fontWeight: ci === 0 ? 600 : 400,
                          color: ci === 0 ? '#555' : '#333',
                          lineHeight: 1.7,
                        }}
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

    </ToolPageLayout>
  );
};

export default IndustrialLocation;
