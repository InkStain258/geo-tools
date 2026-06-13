import React, { useRef, useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import RadarChart from '@/components/shared/RadarChart';
import { industryTypes } from '@/data/geoFormulas';

const IndustrialLocation: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState('labor-oriented');

  const industry = industryTypes.find((i) => i.id === selectedId) || industryTypes[0];

  return (
    <ToolPageLayout title="工业区位分析" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}>
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

      {/* 工业区位选择变化历史演变 */}
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
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555' }}>
              蒸汽机时代，原料和燃料运输成本极高。<b>工厂紧邻原料产地或能源基地</b>。
              典型：英国伯明翰钢铁工业（近煤铁）、德国鲁尔区（近煤）。
              特征：工业布局呈现"<b>移铁就煤</b>"或"<b>移煤就铁</b>"的格局。
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, p: 2, bgcolor: '#e8eaf6', borderRadius: 2, border: '1px solid #c5cae9' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#283593' }}>🚂 第二阶段：市场导向型</Typography>
            <Typography variant="caption" sx={{ color: '#283593', display: 'block', mb: 1 }}>第二次工业革命 ~ 20世纪中后期</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555' }}>
              电力时代，运输技术进步（铁路网、海运）。<b>工厂向消费市场集中</b>。
              典型：美国五大湖工业区（水运便利+巨大市场）、日本太平洋沿岸工业带（临港型）。
              特征：原料和产品的运输成本降低，<b>市场规模和交通枢纽地位</b>成为主导因素。
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, p: 2, bgcolor: '#e0f2f1', borderRadius: 2, border: '1px solid #b2dfdb' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00695C' }}>💻 第三阶段：知识/技术导向型</Typography>
            <Typography variant="caption" sx={{ color: '#00695C', display: 'block', mb: 1 }}>第三次工业革命（信息技术革命）至今</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555' }}>
              信息时代，知识和技术成为核心生产要素。<b>企业向科技中心和人才聚集区靠拢</b>。
              典型：美国硅谷（斯坦福大学+风险资本）、中国中关村（清华北大+科研院所）、深圳南山科技园。
              特征：<b>高素质人才、创新环境、信息通达度</b>成为决定性区位因素。原料和市场的影响力相对下降。
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2, borderLeft: '4px solid #FF8F00' }}>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#E65100' }}>
            <b>💡 高考要点：</b>工业区位选择变化反映了生产力发展水平。①原料导向→市场导向：交通运输技术进步降低了原料的运输成本；②市场导向→知识导向：科技进步使知识成为第一生产力。答题时务必结合具体时代背景分析区位因素的变化。
          </Typography>
        </Box>
      </Box>

      {/* 中国四大工业基地对比 */}
      <Box sx={{ mt: 3, width: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#7B1FA2' }}>
          🏗️ 中国四大工业基地对比
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
          中国四大工业基地是高考高频考点，掌握各基地的<b>区位优势、制约因素和发展方向</b>至关重要。
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f3e5f5' }}>
                <TableCell sx={{ fontWeight: 700, color: '#7B1FA2' }}>工业基地</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#7B1FA2' }}>核心城市</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#7B1FA2' }}>优势条件</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#7B1FA2' }}>制约因素</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#7B1FA2' }}>发展方向</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>辽中南工业基地</TableCell>
                <TableCell>沈阳、大连、鞍山、抚顺、本溪</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>①煤、铁、石油等矿产资源丰富；②海陆交通便利（大连港、京哈铁路）；③工业基础雄厚（\"新中国工业摇篮\"）；④劳动力丰富</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', color: '#c62828' }}>①资源枯竭（煤炭资源趋减）；②产业结构单一（重工业为主）；③水资源短缺；④环境污染严重</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>①调整产业结构，发展高新技术和现代服务业；②治理环境污染；③发展循环经济；④振兴东北老工业基地战略</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>京津唐工业基地</TableCell>
                <TableCell>北京、天津、唐山、秦皇岛</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>①煤、铁、石油、海盐等资源丰富（华北油田、开滦煤矿、长芦盐场）；②京津唐城市群市场广阔；③科技教育发达（北京高校和科研院所密集）；④交通枢纽（天津港、北京首都机场）</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', color: '#c62828' }}>①水资源严重短缺（华北\"漏斗区\"）；②能源供应紧张；③首都功能疏解（非首都功能外迁）；④大气污染治理压力大</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>①发展高新技术产业（中关村、雄安新区）；②京津冀协同发展战略；③南水北调缓解水资源压力；④疏解非首都功能</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>沪宁杭工业基地</TableCell>
                <TableCell>上海、南京、杭州、苏州、无锡、宁波</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>①地理位置优越（长江入海口，\"T\"字形交汇点）；②水陆交通便利（上海港世界第一大港、长江黄金水道）；③科技力量雄厚（高校密集）；④市场腹地广阔（长三角城市群）；⑤产业基础好，经济发达</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', color: '#c62828' }}>①能源和矿产资源贫乏（几乎全部依赖外调）；②土地资源紧张（用地成本高）；③部分产业同质化竞争</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>①发展高端制造业和现代服务业；②建设国际航运中心和金融中心；③长三角一体化战略；④产业升级（\"腾笼换鸟\"）</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>珠三角工业基地</TableCell>
                <TableCell>广州、深圳、香港、东莞、佛山、珠海</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>①毗邻港澳，靠近东南亚，区位优势独特；②华侨众多，外资来源丰富；③改革开放政策先行区（经济特区）；④劳动力充足；⑤交通便捷（粤港澳大湾区一体化）</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', color: '#c62828' }}>①能源和矿产资源短缺；②产业层次偏低（传统加工贸易为主）；③土地开发强度高；④劳动力成本上升</TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>①向高端制造业和现代服务业转型；②粤港澳大湾区建设（世界级湾区）；③科技创新（深圳建设国际科创中心）；④\"腾笼换鸟\"产业升级</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p: 1.5, bgcolor: '#e0f2f1', borderRadius: 2, borderLeft: '4px solid #00695C' }}>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#00695C' }}>
            <b>📌 四大基地共同规律：</b>①都分布在<b>东部沿海</b>地区（交通便利、市场广阔）；②沪宁杭和珠三角属于<b>\"资源贫乏型\"</b>（靠交通和市场弥补），辽中南和京津唐属于<b>\"资源丰富型\"</b>（靠资源起家）；③都面临产业结构优化升级的共同课题。
          </Typography>
        </Box>
      </Box>

      {/* 世界典型工业区案例对比 */}
      <Box sx={{ mt: 3, width: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#7B1FA2' }}>
          🌍 世界典型工业区案例对比（高考综合题高频考点）
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
          掌握世界典型工业区的<b>区位条件、产业特征和发展演变</b>，是高考工业地理综合题的重要素材。以下是四个最具代表性的案例。
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {/* 鲁尔区 */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' }, p: 2, bgcolor: '#fce4ec', borderRadius: 2, border: '1px solid #f8bbd0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#AD1457' }}>🏭 德国鲁尔区（传统工业区振兴典范）</Typography>
            <Typography variant="caption" sx={{ color: '#AD1457', display: 'block', mb: 1 }}>世界著名传统工业区 · 高考五星考点</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.6 }}>
              <b>区位优势：</b>①<b>煤炭资源丰富</b>（鲁尔煤田，欧洲最大煤田之一）；②水陆交通便利（莱茵河、鲁尔河水运+密集铁路网）；③靠近法国洛林铁矿（后期进口铁矿石）；④西欧巨大消费市场；⑤充沛的水源（鲁尔河、莱茵河）。<br/>
              <b>产业特征：</b>以煤炭、钢铁、机械、化工为核心的<b>重工业体系</b>，曾占德国工业产值40%。<br/>
              <b>衰落原因（20世纪60年代后）：</b>①煤炭地位下降（石油、天然气替代）；②铁矿枯竭（依赖进口→向沿海转移）；③产业结构单一（\"煤铁复合型\"）；④环境恶化；⑤新技术冲击。<br/>
              <b>振兴措施（必背）：</b>①调整产业结构——发展高新技术和第三产业（电子信息、生物医药）；②治理环境污染（埃姆舍河生态修复）；③完善交通网络；④旧工业用地再利用（工业博物馆、文化创意园）。<br/>
              <b>高考启示：</b>鲁尔区是<b>传统工业区衰落与转型</b>的标准案例，可与辽中南工业基地（东北振兴）进行对比分析。
            </Typography>
          </Box>

          {/* 硅谷 */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' }, p: 2, bgcolor: '#e8eaf6', borderRadius: 2, border: '1px solid #c5cae9' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#283593' }}>💻 美国硅谷（高新技术工业区代表）</Typography>
            <Typography variant="caption" sx={{ color: '#283593', display: 'block', mb: 1 }}>世界最大微电子工业基地 · 高考高频考点</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.6 }}>
              <b>区位优势（独有的\"创新生态\"）：</b>①<b>斯坦福大学</b>——顶尖人才和技术来源（产学研结合）；②<b>风险资本</b>（Sand Hill Road）——硅谷创业公司的燃料；③宜人气候（地中海气候）和优美环境吸引人才；④<b>集聚效应</b>——世界高科技企业总部云集（Apple、Google、Meta、NVIDIA）；⑤<b>创新文化</b>（容忍失败、开放协作）；⑥临近旧金山国际机场（全球连接）。<br/>
              <b>产业特征：</b>以<b>微电子（芯片）→计算机→互联网→AI</b>产业链为核心，辐射全球。集群效应极强。<br/>
              <b>与传统工业区的本质区别：</b>①<b>不依赖自然资源</b>（无煤无铁）——依靠\"智力资源\"；②从业人员以<b>科学家和工程师</b>为主（高学历、高工资）；③产品\"轻、薄、短、小\"——航空运输替代水运/铁路；④环境质量要求高（洁净的空气和水是芯片制造的前提）。<br/>
              <b>高考对比要点：</b>硅谷 vs 鲁尔区 = 知识导向型 vs 原料导向型；硅谷 vs 中关村/深圳 = 不同国家的创新路径比较。
            </Typography>
          </Box>

          {/* 意大利新工业区 */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' }, p: 2, bgcolor: '#e0f2f1', borderRadius: 2, border: '1px solid #b2dfdb' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00695C' }}>👗 意大利新工业区（中小企业集聚典范）</Typography>
            <Typography variant="caption" sx={{ color: '#00695C', display: 'block', mb: 1 }}>东北部和中部——\"第三意大利\" · 高考必考</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.6 }}>
              <b>区位特征：</b>①以<b>中小企业</b>为主（与传统大规模工厂不同）；②以<b>轻工业</b>为主（纺织、服装、陶瓷、家具、制鞋）；③高度<b>专业化分工</b>——一村一品/一镇一业（如普拉托毛纺织、萨索罗瓷砖）；④<b>分散布局</b>在小城镇和农村——\"工业小区\"模式；⑤形成生产—销售—服务网络。与温州模式非常相似。<br/>
              <b>与传统工业区的区别：</b>①\"小\"而\"专\"——不是大企业寡头垄断，而是中小企业集群协作；②灵活性强——可根据市场快速调整产品；③<b>省去大型设备投资</b>（轻工业固定资产少）。<br/>
              <b>高考命题模式：</b>常以意大利新工业区为案例，要求分析<b>中小企业集聚的优势</b>（信息共享、协作配套、品牌效应、降低运费），或与中国<b>浙江温州/义乌</b>模式进行中外对比。
            </Typography>
          </Box>

          {/* 日本太平洋沿岸工业带 */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' }, p: 2, bgcolor: '#fff3e0', borderRadius: 2, border: '1px solid #ffcc80' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E65100' }}>🚢 日本太平洋沿岸工业带（临港型工业代表）</Typography>
            <Typography variant="caption" sx={{ color: '#E65100', display: 'block', mb: 1 }}>京滨—中京—阪神—濑户内—北九州 · 高考拓展</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.6 }}>
              <b>形成背景（\"两头在外\"）：</b>日本矿产资源极度贫乏（煤、铁、石油几乎全部依赖进口），但拥有<b>优良港湾</b>和发达的造船业。因此工业布局选择<b>临港型</b>——工厂建在沿海港口附近，原料进口→加工→产品出口一步到位。<br/>
              <b>区位优势：</b>①深水良港密集（东京湾、大阪湾、伊势湾）；②廉价海运（超级油轮/矿砂船）降低运输成本；③<b>高素质劳动力</b>和先进技术；④外向型经济（产品出口全球）。<br/>
              <b>五大工业区（自东向西）：</b>京滨（东京-横滨，机械、电子）→中京（名古屋，汽车、航空）→阪神（大阪-神户，钢铁、造船）→濑户内（化工、钢铁）→北九州（钢铁、机械）。<br/>
              <b>高考启示：</b>临港型工业布局反映了<b>\"移铁就港\"</b>的趋势（铁矿石海运成本降低后，钢铁工业从煤铁复合型→临港型），是工业区位演变的重要案例。
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2, borderLeft: '4px solid #FF8F00' }}>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#E65100' }}>
            <b>💡 四大案例对比规律：</b>鲁尔区（原料导向型→转型）→ 硅谷（技术导向型）→ 意大利新工业区（中小企业集群）→ 日本临港型（交通导向型）。这四种模式代表了工业布局主导因素的演变链：<b>原料→交通→市场→技术</b>。高考综合题常要求\"结合具体案例，分析区位因素的变化对工业布局的影响\"。
          </Typography>
        </Box>
      </Box>

    </ToolPageLayout>
  );
};

export default IndustrialLocation;
