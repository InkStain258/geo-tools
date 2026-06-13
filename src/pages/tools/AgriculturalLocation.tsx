import React, { useRef, useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { agricultureTypes } from '@/data/geoFormulas';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AgriculturalLocation: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState('rice');

  const agri = agricultureTypes.find((a) => a.id === selectedId) || agricultureTypes[0];

  const naturalChartData = {
    labels: agri.naturalFactors.map((f) => f.name),
    datasets: [{
      label: '自然因素权重',
      data: agri.naturalFactors.map((f) => f.weight),
      backgroundColor: 'rgba(46,125,50,0.6)',
      borderColor: '#2E7D32',
      borderWidth: 1,
    }],
  };

  const humanChartData = {
    labels: agri.humanFactors.map((f) => f.name),
    datasets: [{
      label: '人文因素权重',
      data: agri.humanFactors.map((f) => f.weight),
      backgroundColor: 'rgba(245,124,0,0.6)',
      borderColor: '#F57C00',
      borderWidth: 1,
    }],
  };

  return (
    <ToolPageLayout title="农业区位图解" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}>
        <Box sx={{ flex: 1 }}>
          <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
            <InputLabel>农业类型</InputLabel>
            <Select value={selectedId} label="农业类型" onChange={(e) => setSelectedId(e.target.value)}>
              {agricultureTypes.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>自然因素</Typography>
          <div style={{ height: 180 }}>
            <Bar data={naturalChartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { max: 0.5, title: { display: true, text: '权重' } } },
            }} />
          </div>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>人文因素</Typography>
          <div style={{ height: 180 }}>
            <Bar data={humanChartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { max: 0.5, title: { display: true, text: '权重' } } },
            }} />
          </div>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            {agri.name} · 因素详解
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#2E7D32', fontWeight: 700 }}>🌿 自然因素</Typography>
            {agri.naturalFactors
              .sort((a, b) => b.weight - a.weight)
              .map((f, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.5 }}>
                  <Typography variant="body2" sx={{ minWidth: 50, fontWeight: 600 }}>{f.name}</Typography>
                  <Box sx={{ flex: 1, height: 10, bgcolor: '#e8f5e9', borderRadius: 5, overflow: 'hidden' }}>
                    <Box sx={{ width: `${f.weight * 100}%`, height: '100%', bgcolor: '#2E7D32', borderRadius: 5 }} />
                  </Box>
                  <Typography variant="caption" sx={{ minWidth: 35 }}>{(f.weight * 100).toFixed(0)}%</Typography>
                </Box>
              ))}
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#F57C00', fontWeight: 700 }}>👥 人文因素</Typography>
            {agri.humanFactors
              .sort((a, b) => b.weight - a.weight)
              .map((f, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.5 }}>
                  <Typography variant="body2" sx={{ minWidth: 50, fontWeight: 600 }}>{f.name}</Typography>
                  <Box sx={{ flex: 1, height: 10, bgcolor: '#fff3e0', borderRadius: 5, overflow: 'hidden' }}>
                    <Box sx={{ width: `${f.weight * 100}%`, height: '100%', bgcolor: '#F57C00', borderRadius: 5 }} />
                  </Box>
                  <Typography variant="caption" sx={{ minWidth: 35 }}>{(f.weight * 100).toFixed(0)}%</Typography>
                </Box>
              ))}
          </Box>

          <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: 2 }}>
            {agri.detailDesc && (
              <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                📖 {agri.detailDesc}
              </Typography>
            )}
            {agri.naturalFactors.map((f, i) => (
              <Typography key={`n${i}`} variant="body2" sx={{ mb: 0.3 }}>
                <b>{f.name}</b>：{f.description}
              </Typography>
            ))}
            {agri.humanFactors.map((f, i) => (
              <Typography key={`h${i}`} variant="body2" sx={{ mb: 0.3 }}>
                <b>{f.name}</b>：{f.description}
              </Typography>
            ))}
          </Box>

          {/* Examples */}
          {agri.examples && agri.examples.length > 0 && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8eaf6', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#283593', mb: 0.5 }}>
                🌍 典型分布区域
              </Typography>
              {agri.examples.map((ex, i) => (
                <Typography key={i} variant="body2" sx={{ mb: 0.3 }}>
                  • {ex}
                </Typography>
              ))}
            </Box>
          )}

          {/* Gaokao Tips */}
          {agri.gaokaoTips && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2, borderLeft: '4px solid #FF8F00' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E65100', mb: 0.5 }}>
                💡 学习提示 (Gaokao Tips)
              </Typography>
              <Typography variant="body2">
                {agri.gaokaoTips}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* 中国农业地域差异 */}
      <Box sx={{ mt: 3, width: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#2E7D32' }}>
          🌏 中国农业地域差异
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
          中国幅员辽阔，自然条件差异显著，农业生产呈现<b>东部季风区、西北干旱区、青藏高寒区</b>三大地域分异格局。这是高考\"中国地理\"部分的核心考点。
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 32%' }, p: 2, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #a5d6a7' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2E7D32' }}>🌾 东部季风区（种植业为主）</Typography>
            <Typography variant="caption" sx={{ color: '#2E7D32', display: 'block', mb: 1 }}>约占国土面积45%，承载95%以上人口</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
              <b>范围：</b>大兴安岭—阴山—贺兰山—巴颜喀拉山—冈底斯山以东以南（季风区与非季风区分界线）。<br/>
              <b>自然条件：</b>季风气候显著，雨热同期，降水&gt;400mm；平原、盆地和低缓丘陵为主。<br/>
              <b>农业特征：</b>以种植业为主，林业和渔业发达。南北方差异明显：<br/>
              · <b>北方</b>（秦岭—淮河以北）：旱地，小麦、玉米为主，一年一熟至两年三熟（长城以北一年一熟，华北两年三熟或一年两熟）；<br/>
              · <b>南方</b>（秦岭—淮河以南）：水田，水稻为主，一年两熟至三熟（长江中下游一年两熟，华南一年三熟）。<br/>
              <b>秦岭—淮河线</b>是中国最重要的农业分界线：800mm等降水量线、1月0°C等温线、水田与旱地分界线、南方与北方分界线。
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 32%' }, p: 2, bgcolor: '#fff3e0', borderRadius: 2, border: '1px solid #ffcc80' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E65100' }}>🐑 西北干旱区（畜牧业为主）</Typography>
            <Typography variant="caption" sx={{ color: '#E65100', display: 'block', mb: 1 }}>约占国土面积30%，人口稀少</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
              <b>范围：</b>大兴安岭以西，长城和昆仑山—阿尔金山—祁连山以北。<br/>
              <b>自然条件：</b>深居内陆，距海遥远，降水稀少（&lt;400mm，大部分&lt;200mm）；温带大陆性气候，光照充足但干旱缺水；草原、荒漠草原和荒漠为主。<br/>
              <b>农业特征：</b>以畜牧业（草原牧业）为主，灌溉农业（绿洲农业）沿河流分布。<br/>
              · <b>牧区：</b>内蒙古东部（草原牧业）、新疆天山南北（山地牧业，季节转场）；<br/>
              · <b>灌溉农业区：</b>河套平原（引黄河水）、宁夏平原（塞上江南）、河西走廊（祁连山冰雪融水）、新疆绿洲（塔里木盆地边缘）。主要作物：小麦、棉花（新疆长绒棉）、瓜果（哈密瓜、葡萄）。
              <br/><b>制约因素：</b>水资源短缺是限制农业发展的决定性因素（\"有水就有农业\"）。
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 32%' }, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #90caf9' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0' }}>🏔️ 青藏高寒区（高寒牧业+河谷农业）</Typography>
            <Typography variant="caption" sx={{ color: '#1565C0', display: 'block', mb: 1 }}>约占国土面积25%，人口极为稀少</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
              <b>范围：</b>青藏高原（西藏、青海、四川西部、云南西北部）。<br/>
              <b>自然条件：</b>海拔高（平均&gt;4000m），气温低（年均温&lt;0°C），热量严重不足；日照时间长，太阳辐射强；空气稀薄，昼夜温差大。<br/>
              <b>农业特征：</b>以高寒畜牧业为主，河谷地区有零星种植业。<br/>
              · <b>高寒牧业：</b>牦牛、藏绵羊、藏山羊，耐寒耐粗饲，主要分布在高原面上；<br/>
              · <b>河谷农业：</b>雅鲁藏布江谷地、湟水谷地，海拔较低（3000-4000m），热量条件较好，种植青稞、小麦、油菜。<br/>
              · 独特优势：日照时间长、昼夜温差大，有利于作物养分积累（青稞品质优良）。
              <br/><b>制约因素：</b>热量不足（低温冻害严重）是青藏高寒区农业生产的根本限制因素。
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 世界主要农业地域类型分布 */}
      <Box sx={{ mt: 3, width: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#2E7D32' }}>
          🗺️ 世界主要农业地域类型分布
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
          全球农业地域类型分布与气候带、经济发展水平密切相关。掌握各类型的<b>空间分布格局</b>是高考读图分析和综合题的基础。
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' }, p: 2, bgcolor: '#f9fbe7', borderRadius: 2, border: '1px solid #dce775' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#827717' }}>🌍 按纬度带分布</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
              <b>热带地区（南北回归线之间）：</b>热带雨林迁移农业（亚马孙、刚果盆地）、热带种植园农业（东南亚橡胶、油棕；西非可可；中美洲香蕉；巴西咖啡）、水稻种植业（东南亚、南亚季风区）。<br/><br/>
              <b>亚热带地区（南北纬23.5°-35°）：</b>地中海式农业（地中海沿岸、美国加州、澳大利亚西南、南非开普敦、智利中部，以葡萄、柑橘、油橄榄为特色）；水稻种植业（中国南方、美国南部）；混合农业（美国东南部、澳大利亚东南部）。<br/><br/>
              <b>温带地区（南北纬35°-55°）：</b>商品谷物农业（美国中部、加拿大、乌克兰、中国东北、阿根廷潘帕斯南部）；乳畜业（西欧、北美五大湖区、新西兰）；混合农业（欧洲西部）；大牧场放牧业（美国西部、阿根廷潘帕斯、中国内蒙古）。<br/><br/>
              <b>寒带/干旱区：</b>粗放畜牧业（蒙古高原、中亚、澳大利亚内陆、非洲萨赫勒地带）；传统游牧业。
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' }, p: 2, bgcolor: '#fce4ec', borderRadius: 2, border: '1px solid #f8bbd0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#AD1457' }}>🏗️ 按经济发展水平分布</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
              <b>发达国家：</b><br/>
              · 商品谷物农业：高度机械化、大规模经营（美国、加拿大、澳大利亚）；<br/>
              · 乳畜业：集约化、工厂化生产（西欧、新西兰、北美五大湖区）；<br/>
              · 大牧场放牧业：现代牧场管理（美国西部、澳大利亚、新西兰）；<br/>
              · 混合农业：农牧结合，灵活应对市场（欧洲、澳大利亚）。<br/>
              特征：科技水平高，机械化程度高，商品率高，受政府补贴政策影响大。<br/><br/>
              <b>发展中国家：</b><br/>
              · 水稻种植业：小农经营、精耕细作（东亚、东南亚、南亚）；<br/>
              · 热带种植园农业：单一作物、外资控制、出口导向（东南亚、非洲、拉丁美洲）；<br/>
              · 传统旱作农业：自给自足（非洲撒哈拉以南、南亚内陆）；<br/>
              · 游牧业：逐水草而居（非洲萨赫勒地带、中亚、蒙古高原）。<br/>
              特征：劳动力密集，商品率相对较低，受自然条件约束大，面临粮食安全挑战。
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 农业区位因素变化 */}
      <Box sx={{ mt: 3, width: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#2E7D32' }}>
          📊 农业区位因素的变化趋势
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
          与工业区位类似，农业区位因素也在动态变化中。传统自然因素（气候、地形、土壤、水源）的基础性作用依然存在，但<b>市场、交通、技术</b>等人文因素的影响力不断上升。
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 31%' }, p: 2, bgcolor: '#e8eaf6', borderRadius: 2, border: '1px solid #c5cae9' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#283593' }}>🛒 市场影响力上升</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
              <b>城市化和消费升级</b>推动农业市场化程度不断提高：<br/>
              · 城市周边农业从粮食生产转向蔬菜、花卉、乳畜产品等<b>城郊农业</b>（经济收益更高）；<br/>
              · 市场需求决定农业生产类型和规模——如\"订单农业\"；<br/>
              · 国际市场需求催生<b>出口导向型农业</b>（如荷兰花卉、智利车厘子、泰国热带水果）；<br/>
              · <b>农业品牌化</b>：从卖产品到卖品牌（如五常大米、阳澄湖大闸蟹、西湖龙井茶）。
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 31%' }, p: 2, bgcolor: '#fff3e0', borderRadius: 2, border: '1px solid #ffcc80' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E65100' }}>🚄 交通影响力上升</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
              <b>现代物流和冷链技术</b>极大拓宽了农产品的市场半径：<br/>
              · 高速公路和高速铁路网缩短了产地到消费地的时空距离；<br/>
              · <b>冷链物流</b>使鲜活农产品（鲜奶、蔬菜、水果、海鲜）可以跨区域甚至跨洲运输；<br/>
              · 集装箱化和多式联运降低了运输成本，促进了农业地域专业化；<br/>
              · 典型案例：荷兰鲜花通过冷链航空运往全球（阿姆斯特丹鲜花拍卖市场），中国寿光蔬菜通过\"绿色通道\"辐射华北。
            </Typography>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 31%' }, p: 2, bgcolor: '#e0f2f1', borderRadius: 2, border: '1px solid #b2dfdb' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00695C' }}>🔬 技术影响力上升</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
              <b>农业科技进步</b>正在重塑农业区位格局：<br/>
              · <b>温室和设施农业</b>突破自然条件限制（如荷兰温室蔬菜、以色列沙漠农业、中国寿光大棚）；<br/>
              · <b>滴灌和喷灌技术</b>使干旱区也能发展高效农业（如以色列、中国新疆）；<br/>
              · <b>品种改良</b>（杂交水稻、转基因抗虫棉、耐寒品种）扩大作物适宜种植范围；<br/>
              · <b>精准农业</b>（GPS导航、无人机植保、物联网监控）提升农业生产效率；<br/>
              · 技术使\"不适宜区\"变为\"适宜区\"，自然因素的限制作用在弱化。
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2, borderLeft: '4px solid #FF8F00' }}>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#E65100' }}>
            <b>💡 高考答题模板：</b>分析农业区位因素变化——①自然因素：相对稳定（但温室、灌溉等技术可局部改变）；②市场：决定农业生产<b>类型和规模</b>（核心动力）；③交通：扩大<b>市场半径</b>，促进专业化；④技术：降低<b>自然条件约束</b>，提高生产效率。综合题常要求\"说明某地农业区位因素的变化及其影响\"。
          </Typography>
        </Box>
      </Box>

    </ToolPageLayout>
  );
};

export default AgriculturalLocation;
