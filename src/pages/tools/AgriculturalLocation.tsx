import React, { useRef, useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Card, CardContent, Chip } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { agricultureTypes } from '@/data/geoFormulas';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ============ 中国三大农业区 ============ */
const chinaZones = [
  {
    t:'🌾 东部季风区（种植业主导）',c:'#2E7D32',bg:'#e8f5e9',pct:'45%国土, 95%人口',
    d:'范围：大兴安岭—阴山—贺兰山—巴颜喀拉山—冈底斯山以东以南。| 条件：季风气候、雨热同期、降水>400mm、平原盆地为主。| 特征：北方旱地小麦玉米（1-2熟）、南方水田水稻（2-3熟）。秦岭—淮河线=800mm降水/1月0°C/水旱田分界。| 制约：洪涝、寒潮、水土流失。'
  },
  {
    t:'🐑 西北干旱区（畜牧业主导）',c:'#E65100',bg:'#fff3e0',pct:'30%国土',
    d:'范围：大兴安岭以西、长城—祁连山以北。| 条件：深居内陆、降水<400mm（大部<200mm）、温带大陆性气候、光照充足。| 特征：草原牧业（内蒙古东部）+山地牧业季节转场（天山）+灌溉/绿洲农业（河套、宁夏平原、河西走廊）。| 制约：水资源短缺→"有水就有农业"。'
  },
  {
    t:'🏔️ 青藏高寒区（高寒牧业+河谷农业）',c:'#1565C0',bg:'#e3f2fd',pct:'25%国土',
    d:'范围：青藏高原（西藏、青海、川西、滇西北）。| 条件：海拔>4000m、年均温<0°C、热量不足但日照强+昼夜温差大。| 特征：牦牛/藏绵羊耐寒牧业+雅鲁藏布江/湟水河谷种植青稞/小麦/油菜。| 制约：热量不足（低温冻害）是根本限制因素。'
  },
];

/* ============ 世界农业地域 ============ */
const worldAgriByLat = [
  ['热带','热带雨林迁移农业(亚马孙/刚果)、热带种植园(东南亚橡胶油棕/西非可可)、水稻种植(东南亚/南亚季风区)'],
  ['亚热带','地中海式农业(地中海沿岸/加州/智利/开普敦/澳洲西南:葡萄柑橘橄榄)、水稻(中国南方/美国南部)、混合农业(美国东南/澳洲东南)'],
  ['温带','商品谷物(美国中部/加拿大/乌克兰/中国东北)、乳畜业(西欧/五大湖区/新西兰)、大牧场放牧(美国西部/阿根廷/内蒙古)'],
  ['寒带/干旱','粗放畜牧业(蒙古/中亚/澳大利亚内陆/非洲萨赫勒)、传统游牧业'],
];

const worldAgriByDev = [
  ['发达国家','商品谷物(高度机械化大规模)、乳畜业(集约化工厂化)、大牧场(现代管理)、混合农业。特征:科技高+机械高+商品率高+受补贴影响大'],
  ['发展中国家','水稻种植(小农精耕)、热带种植园(单一作物外资出口)、传统旱作(自给)、游牧。特征:劳动力密集+商品率低+受自然约束大+粮食安全挑战'],
];

/* ============ 美国农业带 ============ */
const usBelts = [
  ['🥛乳畜带','五大湖及东北','气候湿冷+土壤贫瘠','牛奶乳制品','市场(城市密集+冷链)'],
  ['🌽玉米带','中央低平原中北部','夏季高温多雨+黑钙土','玉米(全球最大)','自然+饲料需求'],
  ['🌾小麦带','大平原北部/南部','地势平坦+半干旱','小麦','地形+机械化+出口市场'],
  ['🌿棉花带','东南部35°N以南','亚热带湿热+长生长期','棉花','热量+劳动力(历史)'],
  ['🐄混合带','玉米带以南','过渡带+温和','玉米大豆养猪','多元化抗风险'],
  ['🏜️畜牧灌溉','西部落基山区','干旱+地广人稀','肉牛绵羊','水源决定分布'],
];

/* ============ 澳洲混合农业 ============ */
const ausMix = [
  {t:'📋 特征',c:'#2E7D32',bg:'#e8f5e9',d:'墨累-达令河流域(温带)+西南部(地中海)。农场数千公顷，家庭经营，极高机械化。轮作:小麦→牧草(豆科固氮)→放牧绵羊→再种小麦，形成"小麦→牧草→羊→小麦"循环。'},
  {t:'🎯 区位',c:'#E65100',bg:'#fff3e0',d:'地势平坦(大自流盆地)+温带气候+降水300-600mm(旱作边界)。地广人稀(3人/km²)+机械化+近港口出口+政府补贴。'},
  {t:'✅ 三大优势',c:'#283593',bg:'#e8eaf6',d:'①时间互补:小麦忙季(秋播春夏收)与牧羊忙季(春剪毛秋配种)错开，劳力均衡。②风险对冲:小麦/羊毛两市场独立→东方不亮西方亮。③生态循环:秸秆饲料→羊粪还田→豆科固氮→减化肥。"以农养牧、以牧促农"。'},
  {t:'⚠️ 制约',c:'#AD1457',bg:'#fce4ec',d:'①水资源短缺→过度灌溉→土壤盐碱化(最大生态威胁)。②距国际市场远运输成本高。③厄尔尼诺→周期性干旱(如2003-2012千年干旱)。'},
];

const AgriculturalLocation: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState('rice');
  const [tab, setTab] = useState(0);
  const agri = agricultureTypes.find(a => a.id === selectedId) || agricultureTypes[0];

  const naturalChartData = {
    labels: agri.naturalFactors.map(f => f.name),
    datasets: [{ label:'自然因素权重', data:agri.naturalFactors.map(f=>f.weight), backgroundColor:'rgba(46,125,50,0.6)', borderColor:'#2E7D32', borderWidth:1 }],
  };
  const humanChartData = {
    labels: agri.humanFactors.map(f => f.name),
    datasets: [{ label:'人文因素权重', data:agri.humanFactors.map(f=>f.weight), backgroundColor:'rgba(245,124,0,0.6)', borderColor:'#F57C00', borderWidth:1 }],
  };

  return (
    <ToolPageLayout title="农业区位图解" exportRef={exportRef}>
      {/* ========== 上半部: 2列布局 ========== */}
      <Box ref={exportRef} sx={{ display:'flex', flexDirection:{xs:'column',md:'row'}, gap:2, width:'100%' }}>
        <Box sx={{ flex:1 }}>
          <FormControl size="small" sx={{ minWidth:200, mb:2 }}>
            <InputLabel>农业类型</InputLabel>
            <Select value={selectedId} label="农业类型" onChange={e => setSelectedId(e.target.value)}>
              {agricultureTypes.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Typography variant="subtitle2" sx={{ fontWeight:700, mb:1 }}>🌿 自然因素</Typography>
          <div style={{ height:160 }}><Bar data={naturalChartData} options={{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{max:0.5,title:{display:true,text:'权重'}}}} } /></div>
          <Typography variant="subtitle2" sx={{ fontWeight:700, mt:2, mb:1 }}>👥 人文因素</Typography>
          <div style={{ height:160 }}><Bar data={humanChartData} options={{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{max:0.5,title:{display:true,text:'权重'}}}} } /></div>
        </Box>

        {/* 右: 因素详解 */}
        <Box sx={{ flex:1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight:700, mb:1 }}>{agri.name} · 因素详解</Typography>
          {(['natural','human'] as const).map((type, idx) => {
            const factors = type==='natural' ? agri.naturalFactors : agri.humanFactors;
            const color = type==='natural' ? '#2E7D32' : '#F57C00';
            const bg = type==='natural' ? '#e8f5e9' : '#fff3e0';
            const icon = type==='natural' ? '🌿 自然因素' : '👥 人文因素';
            return (
              <Box key={idx} sx={{mb:1.5}}>
                <Typography variant="subtitle2" sx={{color,fontWeight:700,mb:0.5}}>{icon}</Typography>
                {factors.sort((a,b)=>b.weight-a.weight).map((f,i)=>(
                  <Box key={i} sx={{display:'flex',alignItems:'center',gap:1,my:0.4}}>
                    <Typography variant="body2" sx={{minWidth:50,fontWeight:600,fontSize:13}}>{f.name}</Typography>
                    <Box sx={{flex:1,height:8,bgcolor:bg,borderRadius:4,overflow:'hidden'}}>
                      <Box sx={{width:`${f.weight*100}%`,height:'100%',bgcolor:color,borderRadius:4}}/>
                    </Box>
                    <Typography variant="caption">{(f.weight*100).toFixed(0)}%</Typography>
                  </Box>
                ))}
              </Box>
            );
          })}
          {agri.detailDesc && (
            <Box sx={{p:1.5,bgcolor:'#e8f5e9',borderRadius:2,mb:1.5}}>
              <Typography variant="body2" sx={{fontSize:13,fontStyle:'italic'}}>📖 {agri.detailDesc}</Typography>
            </Box>
          )}
          {agri.gaokaoTips && (
            <Box sx={{p:1.5,bgcolor:'#fff8e1',borderRadius:2,borderLeft:'3px solid #FF8F00'}}>
              <Typography variant="subtitle2" sx={{fontWeight:700,color:'#E65100',mb:0.3}}>💡 高考提示</Typography>
              <Typography variant="body2" sx={{fontSize:13}}>{agri.gaokaoTips}</Typography>
            </Box>
          )}
          {agri.examples && agri.examples.length>0 && (
            <Box sx={{mt:1.5}}>
              <Typography variant="subtitle2" sx={{fontWeight:700,mb:0.5}}>🌍 典型分布</Typography>
              <Box sx={{display:'flex',flexWrap:'wrap',gap:0.5}}>
                {agri.examples.map((ex,i)=><Chip key={i} label={ex} size="small" sx={{bgcolor:'#e8eaf6',fontSize:12}} />)}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* ========== 下半部: Tab标签切换 ========== */}
      <Box sx={{ mt:3, width:'100%' }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ mb:2, '& .MuiTab-root':{minWidth:90,fontSize:13,fontWeight:600,textTransform:'none'} }}>
          <Tab label="🇨🇳 中国农业" />
          <Tab label="🗺️ 世界分布" />
          <Tab label="🇺🇸🇦🇺 美澳案例" />
          <Tab label="🌱 可持续发展" />
        </Tabs>

        {/* Tab 0: 中国农业 */}
        {tab === 0 && (
          <Box sx={{display:'flex',flexWrap:'wrap',gap:2}}>
            {chinaZones.map((z,i)=>(
              <Card key={i} sx={{flex:{xs:'1 1 100%',md:'1 1 32%'},bgcolor:z.bg,border:`1px solid ${z.c}40`}}>
                <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
                  <Typography variant="subtitle2" sx={{fontWeight:700,color:z.c}}>{z.t}</Typography>
                  <Chip label={z.pct} size="small" sx={{bgcolor:`${z.c}18`,color:z.c,fontSize:10,mt:0.5,mb:1}} />
                  {z.d.split('|').map((line,j)=>(
                    <Typography key={j} variant="body2" sx={{fontSize:13,lineHeight:1.7,mt:j>0?0.5:0}}>{line}</Typography>
                  ))}
                </CardContent>
              </Card>
            ))}
            <Box sx={{width:'100%',p:1.5,bgcolor:'#e8f5e9',borderRadius:2}}>
              <Typography variant="body2" sx={{fontSize:13}}>
                <b>📌 关键分界线：</b>秦岭—淮河线 = 800mm降水 + 1月0°C + 水田/旱田 + 南/北方分界线。大兴安岭—阴山—贺兰山—巴颜喀拉山—冈底斯山 = 季风/非季风 + 种植/畜牧分界。
              </Typography>
            </Box>
          </Box>
        )}

        {/* Tab 1: 世界分布 */}
        {tab === 1 && (
          <Box sx={{display:'flex',flexWrap:'wrap',gap:2}}>
            <Card sx={{flex:{xs:'1 1 100%',md:'1 1 48%'},bgcolor:'#f9fbe7',border:'1px solid #dce775'}}>
              <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
                <Typography variant="subtitle2" sx={{fontWeight:700,color:'#827717',mb:1}}>🌍 按纬度带分布</Typography>
                {worldAgriByLat.map((row,i)=>(
                  <Box key={i} sx={{mb:1}}>
                    <Chip label={row[0]} size="small" sx={{fontSize:11,fontWeight:600,mb:0.3,bgcolor:'#f0f4c3'}} />
                    <Typography variant="body2" sx={{fontSize:13}}>{row[1]}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            <Card sx={{flex:{xs:'1 1 100%',md:'1 1 48%'},bgcolor:'#fce4ec',border:'1px solid #f8bbd0'}}>
              <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
                <Typography variant="subtitle2" sx={{fontWeight:700,color:'#AD1457',mb:1}}>🏗️ 按经济发展水平</Typography>
                {worldAgriByDev.map((row,i)=>(
                  <Box key={i} sx={{mb:1}}>
                    <Chip label={row[0]} size="small" sx={{fontSize:11,fontWeight:600,mb:0.3,bgcolor:'#f8bbd0'}} />
                    <Typography variant="body2" sx={{fontSize:13}}>{row[1]}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* 区位因素变化 */}
            <Card sx={{flex:'1 1 100%',bgcolor:'#e8eaf6',border:'1px solid #c5cae9'}}>
              <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
                <Typography variant="subtitle2" sx={{fontWeight:700,color:'#283593',mb:1}}>📊 农业区位因素变化趋势</Typography>
                <Box sx={{display:'flex',flexWrap:'wrap',gap:1.5}}>
                  {[
                    {t:'🛒 市场↑',d:'城市化→城郊农业(蔬菜/花卉/乳畜)。订单农业+品牌化(五常大米/阳澄湖大闸蟹)。国际需求→出口导向(荷兰花卉/智利车厘子)。'},
                    {t:'🚄 交通↑',d:'冷链物流使鲜活品跨洲运输。高速路网缩短产地-消费地时距。集装箱化降低运费→促进地域专业化。'},
                    {t:'🔬 技术↑',d:'温室/大棚突破季节限制。滴灌/喷灌(以色列沙漠农业)。品种改良(杂交水稻/耐寒品种)。精准农业(GPS+无人机+物联网)。技术使"不适宜区"变"适宜区"。'},
                  ].map((ch,i)=>(
                    <Box key={i} sx={{flex:{xs:'1 1 100%',md:'1 1 32%'},p:1.5,bgcolor:'#fff',borderRadius:1}}>
                      <Typography variant="subtitle2" sx={{fontWeight:700,fontSize:13,mb:0.3}}>{ch.t}</Typography>
                      <Typography variant="body2" sx={{fontSize:12.5}}>{ch.d}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Tab 2: 美澳案例 */}
        {tab === 2 && (
          <Box sx={{display:'flex',flexWrap:'wrap',gap:2}}>
            {/* 美国农业带 */}
            <Card sx={{flex:{xs:'1 1 100%',md:'1 1 55%'},bgcolor:'#e8f5e9',border:'1px solid #a5d6a7'}}>
              <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
                <Typography variant="subtitle2" sx={{fontWeight:700,color:'#2E7D32',mb:1}}>🇺🇸 美国农业带</Typography>
                <Box sx={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                    <thead>
                      <tr style={{backgroundColor:'#c8e6c9'}}>
                        <th style={{border:'1px solid #a5d6a7',padding:4,textAlign:'center'}}>农业带</th>
                        <th style={{border:'1px solid #a5d6a7',padding:4,textAlign:'center'}}>分布</th>
                        <th style={{border:'1px solid #a5d6a7',padding:4,textAlign:'center'}}>核心因素</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usBelts.map((r,i)=>(
                        <tr key={i} style={{backgroundColor:i%2===0?'#fff':'#f1f8e9'}}>
                          <td style={{border:'1px solid #ddd',padding:4,fontWeight:600}}>{r[0]}</td>
                          <td style={{border:'1px solid #ddd',padding:4}}>{r[1]}</td>
                          <td style={{border:'1px solid #ddd',padding:4,color:'#c62828'}}><b>{r[4]}</b></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
                <Typography variant="caption" sx={{color:'#757575',mt:1,display:'block',fontSize:12}}>
                  💡 美国农业带从东到西(乳畜→玉米→小麦→畜牧)体现了水分递减(1000mm→250mm)和热量纬度差异。商品率&gt;95%。
                </Typography>
              </CardContent>
            </Card>

            {/* 澳洲混合农业 */}
            <Card sx={{flex:{xs:'1 1 100%',md:'1 1 42%'},bgcolor:'#fff8e1',border:'1px solid #ffcc80'}}>
              <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
                <Typography variant="subtitle2" sx={{fontWeight:700,color:'#E65100',mb:1}}>🇦🇺 澳洲小麦-牧羊混合农业</Typography>
                {ausMix.map((a,i)=>(
                  <Box key={i} sx={{p:1,mb:0.8,bgcolor:a.bg,borderRadius:1,border:`1px solid ${a.c}30`}}>
                    <Typography variant="caption" sx={{fontWeight:700,color:a.c,fontSize:12}}>{a.t}</Typography>
                    <Typography variant="body2" sx={{fontSize:12.5,mt:0.2}}>{a.d}</Typography>
                  </Box>
                ))}
                <Box sx={{p:1,mt:1,bgcolor:'#FFF8E1',borderRadius:1,borderLeft:'3px solid #FF8F00'}}>
                  <Typography variant="caption" sx={{fontSize:12}}>
                    <b>💡 高考命题：</b>分析墨累-达令区位条件 / 说明时间互补优势 / 对比内蒙古农牧交错带 / "为什么混合农业是可持续典范？"
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Tab 3: 可持续发展 */}
        {tab === 3 && (
          <Box sx={{display:'flex',flexWrap:'wrap',gap:2}}>
            {[
              {t:'🌿 生态农业',c:'#2E7D32',bg:'#e8f5e9',
               d:'遵循生态学原理，物质循环+能量多级利用。典型：「桑基鱼塘」(珠三角)→桑养蚕→蚕沙喂鱼→塘泥肥桑；「稻鱼共生」；「猪—沼—果」四位一体。优势：减化肥农药，废弃物资源化，经济+生态双赢。高考：分析物质循环路径，对比传统vs生态农业。'},
              {t:'🍃 有机农业',c:'#E65100',bg:'#fff3e0',
               d:'完全/基本不用人工合成化肥农药激素转基因。技术：绿肥轮作(豆科固氮)+生物防治(天敌)+有机肥(堆肥沼液)+物理防治。定位：高端市场，价格2-5倍常规。局限：产量低20-30%，劳动力大。争议："能否养活全球？"'},
              {t:'🛰️ 精准农业',c:'#1565C0',bg:'#e3f2fd',
               d:'利用GPS+GIS+RS+传感器+智能装备，精细化差异化管理。技术：无人机植保/巡田+变量施肥+自动驾驶农机+物联网墒情。优势：节水节肥30-50%，减药增产。中国：新疆棉花(北斗播种)、黑龙江农垦(物联网)、寿光(智能温室)。高考常结合3S技术命题。'},
            ].map((c,i)=>(
              <Card key={i} sx={{flex:{xs:'1 1 100%',md:'1 1 32%'},bgcolor:c.bg,border:`1px solid ${c.c}40`}}>
                <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
                  <Typography variant="subtitle2" sx={{fontWeight:700,color:c.c,fontSize:15,mb:0.5}}>{c.t}</Typography>
                  <Typography variant="body2" sx={{fontSize:13,lineHeight:1.7}}>{c.d}</Typography>
                </CardContent>
              </Card>
            ))}
            <Box sx={{width:'100%',p:1.5,bgcolor:'#fff8e1',borderRadius:2,borderLeft:'3px solid #FF8F00'}}>
              <Typography variant="body2" sx={{fontSize:13}}>
                <b>💡 答题三维度：</b>生态(减污/资源循环) + 经济(提效/品牌化) + 社会(食品安全/农民增收)。关键词：循环经济、清洁生产、绿色农业、智慧农业。
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </ToolPageLayout>
  );
};

export default AgriculturalLocation;
