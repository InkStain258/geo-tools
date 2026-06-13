import React, { useRef, useState } from 'react';
import {
  Box, Typography, Select, MenuItem, FormControl, InputLabel, List, ListItem,
  ListItemText, Tabs, Tab, Chip, Card, CardContent,
} from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import RadarChart from '@/components/shared/RadarChart';
import { industryTypes } from '@/data/geoFormulas';

/* ============ 数据 ============ */
const fourBases = [
  { name:'辽中南',tag:'资源型·重工业摇篮',color:'#AD1457',bg:'#fce4ec',cities:'沈阳 大连 鞍山 抚顺 本溪',adv:'煤铁石油丰富+大连港+京哈铁路+工业基础雄厚',cons:'资源枯竭+结构单一+缺水+污染',dir:'调结构→高新+服务业, 治污, 循环经济, 东北振兴'},
  { name:'京津唐',tag:'资源型·科技政治中心',color:'#7B1FA2',bg:'#f3e5f5',cities:'北京 天津 唐山 秦皇岛',adv:'华北油田+开滦煤矿+长芦盐场+京津市场+高校密集+天津港',cons:'缺水(漏斗区)+能源紧张+非首都功能疏解+大气污染',dir:'中关村+雄安+京津冀协同+南水北调'},
  { name:'沪宁杭',tag:'资源贫乏·最大综合基地',color:'#283593',bg:'#e8eaf6',cities:'上海 南京 杭州 苏州 无锡 宁波',adv:'长江入海口T字交汇+上海港+长江水道+高校密集+长三角市场',cons:'能源矿产全外调+土地贵+同质化竞争',dir:'高端制造+航运金融中心+长三角一体化+腾笼换鸟'},
  { name:'珠三角',tag:'资源贫乏·外向型引擎',color:'#00695C',bg:'#e0f2f1',cities:'广州 深圳 香港 东莞 佛山 珠海',adv:'毗邻港澳+华侨外资+经济特区+劳动力+粤港澳一体化',cons:'能源矿产短缺+产业偏低端+土地高开发+人工涨',dir:'高端制造+湾区建设+深圳科创+腾笼换鸟'},
];

const worldCases = [
  { title:'鲁尔区(德)',sub:'传统工业区振兴',color:'#AD1457',bg:'#fce4ec',content:'区位:鲁尔煤田(欧洲最大)+莱茵河水运+西欧市场。产业:煤铁钢机化重工体系。衰落:煤炭被油气替代+铁矿枯竭+单一结构+污染。振兴(必背):调结构→高新+三产, 治污(埃姆舍河), 旧工业用地→文创园。'},
  { title:'硅谷(美)',sub:'高新技术代表',color:'#283593',bg:'#e8eaf6',content:'区位:斯坦福大学+风险资本(Sand Hill Rd)+宜人气候+集聚效应(Apple/Google/NVIDIA)+创新文化。特点:不靠资源靠智力, 科学家为主, 产品轻小→空运, 环境要求高。对比鲁尔区=知识导向vs原料导向。'},
  { title:'意大利新工业区',sub:'中小企业集群',color:'#00695C',bg:'#e0f2f1',content:'区位:东北部中部(第三意大利)。特点:中小企业+轻工为主(纺织/陶瓷/家具)+一镇一品高度专业化(普拉托毛纺/萨索罗瓷砖)+分散在小城镇。优势:小而专+灵活+信息共享。对比:温州/义乌模式。'},
  { title:'日本临港型',sub:'两头在外模式',color:'#E65100',bg:'#fff3e0',content:'背景:资源极度贫乏(煤铁油全进口)+优良港湾+发达造船。布局:工厂建在沿海→原料进口→加工→产品出口一步到位。五大区:京滨(机械电子)→中京(汽车)→阪神(钢铁造船)→濑户内(化工)→北九州(钢铁)。趋势:移铁就港。'},
];

const IndustrialLocation: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState('labor-oriented');
  const [tab, setTab] = useState(0);
  const industry = industryTypes.find(i => i.id === selectedId) || industryTypes[0];

  return (
    <ToolPageLayout title="工业区位分析" exportRef={exportRef}>
      {/* ========== 上半部: 2列布局 ========== */}
      <Box ref={exportRef} sx={{ display:'flex', flexDirection:{xs:'column',md:'row'}, gap:2, width:'100%' }}>
        {/* 左: 雷达图 */}
        <Box sx={{ flex:1 }}>
          <FormControl size="small" sx={{ minWidth:200, mb:2 }}>
            <InputLabel>工业类型</InputLabel>
            <Select value={selectedId} label="工业类型" onChange={e => setSelectedId(e.target.value)}>
              {industryTypes.map(i => <MenuItem key={i.id} value={i.id}>{i.name}（{i.orientation}）</MenuItem>)}
            </Select>
          </FormControl>
          <Typography variant="subtitle2" sx={{ fontWeight:700, mb:1 }}>{industry.name} · 区位因素权重</Typography>
          <RadarChart labels={industry.factors.map(f=>f.name)} values={industry.factors.map(f=>f.weight)} title={industry.name} color="#7B1FA2" height={320} />
        </Box>
        {/* 右: 因素详解 + 学习提示 */}
        <Box sx={{ flex:1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight:700, mb:1 }}>区位因素详解</Typography>
          <List dense>
            {industry.factors.sort((a,b)=>b.weight-a.weight).map((f,i)=>(
              <ListItem key={i} sx={{py:0.3, alignItems:'flex-start'}}>
                <ListItemText
                  primary={
                    <Box sx={{display:'flex',alignItems:'center',gap:1}}>
                      <Typography variant="body2" sx={{fontWeight:700,minWidth:80}}>{f.name}</Typography>
                      <Box sx={{flex:1,height:7,bgcolor:'#eee',borderRadius:4,overflow:'hidden'}}>
                        <Box sx={{width:`${f.weight*100}%`,height:'100%',bgcolor:'#7B1FA2',borderRadius:4}}/>
                      </Box>
                      <Typography variant="caption" sx={{minWidth:36,textAlign:'right'}}>{(f.weight*100).toFixed(0)}%</Typography>
                    </Box>
                  }
                  secondary={f.description}
                  slotProps={{secondary:{variant:'body2' as const}}}
                />
              </ListItem>
            ))}
          </List>
          {industry.detailDesc && (
            <Box sx={{mt:1.5,p:1.5,bgcolor:'#f3e5f5',borderRadius:2}}>
              <Typography variant="subtitle2" sx={{fontWeight:700,color:'#7B1FA2',mb:0.5}}>📌 {industry.orientation}</Typography>
              <Typography variant="body2" sx={{fontSize:13}}>{industry.detailDesc}</Typography>
            </Box>
          )}
          {industry.gaokaoTips && (
            <Box sx={{mt:1.5,p:1.5,bgcolor:'#fff8e1',borderRadius:2,borderLeft:'3px solid #FF8F00'}}>
              <Typography variant="subtitle2" sx={{fontWeight:700,color:'#E65100',mb:0.3}}>💡 高考提示</Typography>
              <Typography variant="body2" sx={{fontSize:13}}>{industry.gaokaoTips}</Typography>
            </Box>
          )}
          {industry.examples && industry.examples.length>0 && (
            <Box sx={{mt:1.5}}>
              <Typography variant="subtitle2" sx={{fontWeight:700,mb:0.5}}>🏭 典型工业</Typography>
              <Box sx={{display:'flex',flexWrap:'wrap',gap:0.5}}>
                {industry.examples.map((ex,i)=>(
                  <Chip key={i} label={ex} size="small" sx={{bgcolor:'#e8eaf6',fontSize:12}} />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* ========== 下半部: 标签切换知识区 ========== */}
      <Box sx={{ mt:3, width:'100%' }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ mb:2, '& .MuiTab-root':{minWidth:80,fontSize:13,fontWeight:600,textTransform:'none'} }}>
          <Tab label="📈 历史演变" />
          <Tab label="🏗️ 四大基地" />
          <Tab label="🌍 世界案例" />
          <Tab label="📚 知识拓展" />
        </Tabs>

        {/* Tab 0: 历史演变 */}
        {tab === 0 && (
          <Box sx={{display:'flex',flexWrap:'wrap',gap:2}}>
            {[
              {t:'🏭 原料导向型(19世纪)',c:'#AD1457',bg:'#fce4ec',d:'蒸汽机时代, 原料燃料运输贵→工厂紧邻煤铁产地。典型:英国伯明翰、德国鲁尔区。"移铁就煤"的格局。'},
              {t:'🚂 市场导向型(20世纪)',c:'#283593',bg:'#e8eaf6',d:'电力时代+铁路海运进步→运输成本降→工厂向消费市场集中。典型:美国五大湖区、日本临港型。市场+交通枢纽成为主导。'},
              {t:'💻 知识导向型(21世纪)',c:'#00695C',bg:'#e0f2f1',d:'信息时代, 知识和技术是核心要素→企业向科技中心/人才聚集区靠拢。典型:硅谷、中关村。人才+创新环境＞原料+市场。'},
            ].map((c,i)=>(
              <Card key={i} sx={{flex:{xs:'1 1 100%',md:'1 1 30%'},bgcolor:c.bg,border:`1px solid ${c.c}40`}}>
                <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
                  <Typography variant="subtitle2" sx={{fontWeight:700,color:c.c,mb:0.5}}>{c.t}</Typography>
                  <Typography variant="body2" sx={{fontSize:13,lineHeight:1.7}}>{c.d}</Typography>
                </CardContent>
              </Card>
            ))}
            <Box sx={{width:'100%',p:1.5,bgcolor:'#fff8e1',borderRadius:2,borderLeft:'3px solid #FF8F00'}}>
              <Typography variant="body2" sx={{fontSize:13,color:'#E65100'}}>
                <b>💡 演变规律：</b>原料→交通→市场→技术，反映了生产力发展水平。答题务必结合时代背景分析区位因素变化。
              </Typography>
            </Box>
          </Box>
        )}

        {/* Tab 1: 四大基地 */}
        {tab === 1 && (
          <Box sx={{display:'flex',flexWrap:'wrap',gap:2}}>
            {fourBases.map((b,i)=>(
              <Card key={i} sx={{flex:{xs:'1 1 100%',md:'1 1 48%'},bgcolor:b.bg,border:`1px solid ${b.color}40`}}>
                <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
                  <Box sx={{display:'flex',alignItems:'center',gap:1,mb:1}}>
                    <Typography variant="subtitle2" sx={{fontWeight:700,color:b.color}}>{b.name}</Typography>
                    <Chip label={b.tag} size="small" sx={{bgcolor:`${b.color}18`,color:b.color,fontSize:10,fontWeight:600}} />
                  </Box>
                  <Typography variant="caption" sx={{color:'#666',display:'block',mb:1}}>核心城市: {b.cities}</Typography>
                  <Box sx={{display:'flex',flexWrap:'wrap',gap:1.5}}>
                    <Box sx={{flex:'1 1 140px',p:1,bgcolor:'#fff',borderRadius:1}}>
                      <Typography variant="caption" sx={{fontWeight:700,color:'#2E7D32'}}>✅ 优势</Typography>
                      <Typography variant="body2" sx={{fontSize:12,mt:0.3}}>{b.adv}</Typography>
                    </Box>
                    <Box sx={{flex:'1 1 140px',p:1,bgcolor:'#fff',borderRadius:1}}>
                      <Typography variant="caption" sx={{fontWeight:700,color:'#c62828'}}>⚠️ 制约</Typography>
                      <Typography variant="body2" sx={{fontSize:12,mt:0.3}}>{b.cons}</Typography>
                    </Box>
                    <Box sx={{flex:'1 1 140px',p:1,bgcolor:'#fff',borderRadius:1}}>
                      <Typography variant="caption" sx={{fontWeight:700,color:'#1565C0'}}>🎯 方向</Typography>
                      <Typography variant="body2" sx={{fontSize:12,mt:0.3}}>{b.dir}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
            <Box sx={{width:'100%',p:1.5,bgcolor:'#e8f5e9',borderRadius:2}}>
              <Typography variant="body2" sx={{fontSize:13}}>
                <b>📌 规律：</b>均分布在东部沿海。沪宁杭/珠三角=资源贫乏型(靠交通市场)；辽中南/京津唐=资源丰富型(靠资源起家)。都面临产业升级。
              </Typography>
            </Box>
          </Box>
        )}

        {/* Tab 2: 世界案例 */}
        {tab === 2 && (
          <Box sx={{display:'flex',flexWrap:'wrap',gap:2}}>
            {worldCases.map((c,i)=>(
              <Card key={i} sx={{flex:{xs:'1 1 100%',md:'1 1 48%'},bgcolor:c.bg,border:`1px solid ${c.color}40`}}>
                <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
                  <Typography variant="subtitle2" sx={{fontWeight:700,color:c.color,mb:0.3}}>{c.title}</Typography>
                  <Typography variant="caption" sx={{color:c.color,display:'block',mb:1}}>{c.sub}</Typography>
                  <Typography variant="body2" sx={{fontSize:13,lineHeight:1.8}}>{c.content}</Typography>
                </CardContent>
              </Card>
            ))}
            <Box sx={{width:'100%',p:1.5,bgcolor:'#fff8e1',borderRadius:2,borderLeft:'3px solid #FF8F00'}}>
              <Typography variant="body2" sx={{fontSize:13}}>
                <b>💡 对比链：</b>鲁尔(原料→转型) → 硅谷(技术) → 意大利新区(中小企业集群) → 日本临港(交通)。四种模式代表: 原料→交通→市场→技术 的区位演变。
              </Typography>
            </Box>
          </Box>
        )}

        {/* Tab 3: 知识拓展 */}
        {tab === 3 && (
          <Box sx={{display:'flex',flexWrap:'wrap',gap:2}}>
            {/* 工业分散 */}
            <Card sx={{flex:{xs:'1 1 100%',md:'1 1 48%'},bgcolor:'#f3e5f5',border:'1px solid #ce93d8'}}>
              <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
                <Typography variant="subtitle2" sx={{fontWeight:700,color:'#7B1FA2',mb:1}}>🔀 工业分散与工业地域</Typography>
                <Typography variant="body2" sx={{fontSize:13,lineHeight:1.8}}>
                  <b>分散原因：</b>①产品轻小→可远离原料地(如芯片)；②交通/信息技术进步→远距离协作可能；③寻找最优区位(劳动力/土地/政策)；④环境因素(污染企业外迁)。<br/>
                  <b>新工业区类型：</b>①高新技术区(硅谷/中关村)；②中小企业集聚区(意大利东北部/温州)；③临空型(机场周边，产品时效性强)。<br/>
                  <b>集聚 vs 分散：</b>集聚→降低成本+信息共享+品牌效应；分散→寻求最优单要素(廉价劳动力/低价土地/优惠政策)。
                </Typography>
              </CardContent>
            </Card>

            {/* 传统vs新工业 */}
            <Card sx={{flex:{xs:'1 1 100%',md:'1 1 48%'},bgcolor:'#e8f5e9',border:'1px solid #a5d6a7'}}>
              <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
                <Typography variant="subtitle2" sx={{fontWeight:700,color:'#2E7D32',mb:1}}>⚖️ 传统工业 vs 新工业</Typography>
                {[
                  ['典型代表','鲁尔区/五大湖/辽中南','硅谷/中关村/意大利新区'],
                  ['主导区位','原料/能源/交通','知识/技术/创新环境'],
                  ['企业规模','大型联合企业','中小企业/集群'],
                  ['产业类型','重工业(钢铁/机械/化工)','高新技术/轻工/创意'],
                  ['布局特点','煤铁复合型/临港型','环境优美/人才聚集区'],
                  ['劳动力','普通工人为主','科学家+工程师为主'],
                  ['产品特点','重厚长大','轻薄短小'],
                  ['运输方式','水运/铁路','航空/高速公路'],
                ].map((row,i)=>(
                  <Box key={i} sx={{display:'flex',borderBottom:'1px solid #eee',py:0.5}}>
                    <Typography variant="caption" sx={{minWidth:70,fontWeight:600,color:'#555'}}>{row[0]}</Typography>
                    <Typography variant="caption" sx={{flex:1,color:'#c62828',fontSize:11}}>{row[1]}</Typography>
                    <Typography variant="caption" sx={{flex:1,color:'#2E7D32',fontSize:11,textAlign:'right'}}>{row[2]}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </ToolPageLayout>
  );
};

export default IndustrialLocation;
