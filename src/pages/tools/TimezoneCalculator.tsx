import React, { useRef, useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, ToggleButton, ToggleButtonGroup, Divider, Chip } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { calcLocalTime, calcZoneTime, lngToTimezone } from '@/utils/geoCalculations';

interface PresetCity {
  name: string;
  lng: number;
  zone: number;
  source: boolean;
}

const presetCities: PresetCity[] = [
  { name: '北京', lng: 116.4, zone: 8, source: true },
  { name: '纽约', lng: -74, zone: -5, source: false },
  { name: '伦敦', lng: 0, zone: 0, source: false },
  { name: '东京', lng: 139.7, zone: 9, source: false },
  { name: '悉尼', lng: 151.2, zone: 10, source: false },
  { name: '莫斯科', lng: 37.6, zone: 3, source: false },
  { name: '开罗', lng: 31.2, zone: 2, source: false },
  { name: '圣保罗', lng: -46.6, zone: -3, source: false },
  { name: '洛杉矶', lng: -118.2, zone: -8, source: false },
  { name: '新加坡', lng: 103.8, zone: 8, source: false },
  { name: '巴黎', lng: 2.3, zone: 1, source: false },
  { name: '迪拜', lng: 55.3, zone: 4, source: false },
];

const TimezoneCalculator: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'local' | 'zone'>('local');
  const [sourceLng, setSourceLng] = useState(120);
  const [sourceHour, setSourceHour] = useState(12);
  const [sourceMinute, setSourceMinute] = useState(0);
  const [targetLng, setTargetLng] = useState(0);
  const [sourceZone, setSourceZone] = useState(8);
  const [targetZone, setTargetZone] = useState(0);
  const [result, setResult] = useState<{ hour: number; minute: number } | null>(null);
  const [steps, setSteps] = useState<string[]>([]);

  const handlePresetClick = (city: PresetCity) => {
    if (mode === 'local') {
      if (city.source) {
        setSourceLng(city.lng);
      } else {
        setTargetLng(city.lng);
        setTargetZone(city.zone);
      }
    } else {
      if (city.source) {
        setSourceZone(city.zone);
      } else {
        setTargetZone(city.zone);
      }
    }
  };

  const handleCalc = () => {
    if (mode === 'local') {
      const res = calcLocalTime(sourceLng, sourceHour, sourceMinute, targetLng);
      setResult(res);
      const lngDiff = targetLng - sourceLng;
      const timeDiff = lngDiff * 4;
      setSteps([
        `已知：经度${sourceLng}°E，地方时 ${sourceHour}:${String(sourceMinute).padStart(2, '0')}`,
        `目标地经度：${targetLng}°E`,
        `经度差：${targetLng}° - ${sourceLng}° = ${lngDiff}°`,
        `时间差：${lngDiff}° × 4分钟/° = ${timeDiff}分钟 = ${Math.abs(Math.floor(timeDiff / 60))}时${Math.abs(timeDiff % 60)}分`,
        `目标地地方时 = ${sourceHour}:${String(sourceMinute).padStart(2, '0')} ${timeDiff >= 0 ? '+' : '-'} ${Math.abs(timeDiff)}分钟`,
        `结果：${res.hour}:${String(res.minute).padStart(2, '0')}`,
      ]);
    } else {
      const res = calcZoneTime(sourceZone, sourceHour, sourceMinute, targetZone);
      setResult(res);
      const zoneDiff = targetZone - sourceZone;
      setSteps([
        `已知：时区东${sourceZone}区，区时 ${sourceHour}:${String(sourceMinute).padStart(2, '0')}`,
        `目标地时区：东${targetZone}区`,
        `时区差：东${targetZone}区 - 东${sourceZone}区 = ${zoneDiff}个时区`,
        `时间差：${zoneDiff} × 1小时 = ${zoneDiff}小时`,
        `目标地区时 = ${sourceHour}:${String(sourceMinute).padStart(2, '0')} ${zoneDiff >= 0 ? '+' : ''}${zoneDiff}小时`,
        `结果：${res.hour}:${String(res.minute).padStart(2, '0')}`,
      ]);
    }
  };

  const handleLngToZone = () => {
    const zone = lngToTimezone(targetLng);
    setTargetZone(zone);
  };

  return (
    <ToolPageLayout title="时区与地方时计算器" exportRef={exportRef} showExport={false}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, v) => { if (v) setMode(v); setResult(null); setSteps([]); }}
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="local">地方时</ToggleButton>
          <ToggleButton value="zone">区时</ToggleButton>
        </ToggleButtonGroup>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>已知条件</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <TextField
                size="small" type="number"
                label={mode === 'local' ? '已知地经度(°E)' : '已知地时区'}
                value={mode === 'local' ? sourceLng : sourceZone}
                onChange={(e) => mode === 'local' ? setSourceLng(parseFloat(e.target.value) || 0) : setSourceZone(parseInt(e.target.value) || 0)}
                sx={{ width: 150 }}
              />
              <TextField
                size="small" type="number"
                label="时(0-23)"
                value={sourceHour}
                onChange={(e) => setSourceHour(parseInt(e.target.value) || 0)}
                sx={{ width: 100 }}
              />
              <TextField
                size="small" type="number"
                label="分(0-59)"
                value={sourceMinute}
                onChange={(e) => setSourceMinute(parseInt(e.target.value) || 0)}
                sx={{ width: 100 }}
              />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>目标地</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
              <TextField
                size="small" type="number"
                label={mode === 'local' ? '目标地经度(°E)' : '目标地时区'}
                value={mode === 'local' ? targetLng : targetZone}
                onChange={(e) => mode === 'local' ? setTargetLng(parseFloat(e.target.value) || 0) : setTargetZone(parseInt(e.target.value) || 0)}
                sx={{ width: 150 }}
              />
              {mode === 'local' && (
                <Button size="small" variant="outlined" onClick={handleLngToZone}>
                  经度转时区
                </Button>
              )}
            </Box>

            <Button variant="contained" onClick={handleCalc} sx={{ mt: 2, bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}>
              计算
            </Button>
          </CardContent>
        </Card>

        {result && (
          <>
            <Card sx={{ bgcolor: '#e8f5e9', border: '2px solid #2E7D32', mb: 2 }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#2E7D32' }}>
                  {result.hour}:{String(result.minute).padStart(2, '0')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#757575' }}>
                  目标地{mode === 'local' ? '地方时' : '区时'}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>计算过程</Typography>
                {steps.map((step, i) => (
                  <Typography key={i} variant="body2" sx={{ mb: 0.5, pl: 1, borderLeft: '3px solid #2E7D32' }}>
                    {step}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>🌍 快速选择城市</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 1.5 }}>
              {presetCities.filter(c => c.source).map((city) => (
                <Chip
                  key={city.name}
                  label={`📍 ${city.name}`}
                  size="small"
                  color="success"
                  variant="outlined"
                  onClick={() => handlePresetClick(city)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {presetCities.filter(c => !c.source).map((city) => (
                <Chip
                  key={city.name}
                  label={`${city.name} (${city.zone >= 0 ? '东' : '西'}${Math.abs(city.zone)}区)`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={() => handlePresetClick(city)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>公式速查</Typography>
            <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', mt: 0.5 }}>
              地方时：T₂ = T₁ + (λ₂ − λ₁) × 4min
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
              区时：T₂ = T₁ + (N₂ − N₁) × 1h
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
              时区号：N = round(λ / 15)
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: '#757575' }}>
              💡 点击上方城市名称可快速填充经度/时区，然后点击"计算"
            </Typography>
          </CardContent>
        </Card>

        {/* 时区计算口诀 */}
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>🎵 时区计算口诀</Typography>
            <Box sx={{ bgcolor: '#e8f5e9', p: 1.5, borderRadius: 1, mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#2E7D32', fontSize: '1rem', textAlign: 'center' }}>
                「东加西减，同减异加」
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.7 }}>
              <b>东加西减：</b>已知某地时间，求东侧地点的时间——用<b>加法</b>（加上时区差/经度差对应的时间）；求西侧地点的时间——用<b>减法</b>。东侧时间更早（数值更大），西侧时间更晚（数值更小）。
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
              <b>同减异加：</b>计算两地时区差时，若两地同在<b>东时区</b>或同在<b>西时区</b>，时区号<b>相减</b>（大减小）；若两地分居<b>东、西时区</b>，时区号<b>相加</b>（取绝对值和）。
            </Typography>
            <Box sx={{ mt: 1.5, p: 1, bgcolor: '#f3e5f5', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#7B1FA2' }}>
                <b>速记口诀：</b><br/>
                ① 同在东时区（如北京东8区→东京东9区）：8和9同在东 → 相减 → 差1小时 → 东加 → 北京12:00→东京13:00<br/>
                ② 同在东西区（如纽约西5区→洛杉矶西8区）：5和8同在西 → 相减 → 差3小时 → 东加西减（洛杉矶在西） → 纽约15:00→洛杉矶12:00<br/>
                ③ 跨东西区（如北京东8区→纽约西5区）：8和5分居东西 → 相加 → 差13小时 → 东加西减（纽约在西） → 北京12:00→纽约前日23:00
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* 国际日期变更线 */}
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>📅 国际日期变更线（日界线）</Typography>
            <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.7 }}>
              国际日期变更线（International Date Line）大致沿<b>180°经线</b>，但有三处弯折（避开陆地和岛屿——阿留申群岛、基里巴斯、汤加附近）。它是全球日期切换的分界线。
            </Typography>
            <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: 1, mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565C0', textAlign: 'center', mb: 0.5 }}>
                核心规则：「东减西加」
              </Typography>
              <Typography variant="body2" sx={{ color: '#1565C0', lineHeight: 1.7 }}>
                · <b>自东向西</b>越过日界线（从美洲→亚洲/大洋洲）：日期<b>加一天</b>（如1月1日→1月2日）<br/>
                · <b>自西向东</b>越过日界线（从亚洲/大洋洲→美洲）：日期<b>减一天</b>（如1月2日→1月1日）
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
              📌 重要考点：「自然日界线」与「国际日界线」的区分
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7, mb: 1 }}>
              全球实际上有<b>两条</b>日界线共同划分日期：<br/>
              ① <b>国际日界线</b>（人为日界线）：大致为180°经线，固定不变。自东向西越过＋1天，自西向东越过－1天。<br/>
              ② <b>零时日界线</b>（自然日界线）：地方时0:00所在的经线，随地球自转不断向西移动。自东向西越过＋1天。<br/>
              两条日界线将全球分为两个日期——<b>新的一天</b>（0:00经线以东→180°经线以西）和<b>旧的一天</b>（180°经线以东→0:00经线以西）。
            </Typography>
          </CardContent>
        </Card>

        {/* 实际案例 */}
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>🌐 实际案例：北京 12:00 → 世界主要城市时间</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: '#e8f5e9' }}>
                    <Box component="th" sx={{ p: 0.8, border: '1px solid #c8e6c9', textAlign: 'left' }}>目标城市</Box>
                    <Box component="th" sx={{ p: 0.8, border: '1px solid #c8e6c9', textAlign: 'left' }}>时区</Box>
                    <Box component="th" sx={{ p: 0.8, border: '1px solid #c8e6c9', textAlign: 'left' }}>与北京时间差</Box>
                    <Box component="th" sx={{ p: 0.8, border: '1px solid #c8e6c9', textAlign: 'left' }}>当地时间</Box>
                    <Box component="th" sx={{ p: 0.8, border: '1px solid #c8e6c9', textAlign: 'left' }}>日期</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  <Box component="tr">
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0', fontWeight: 600 }}>纽约</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>西五区 (UTC-5)</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>−13小时</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0', fontWeight: 600, color: '#1565C0' }}>23:00</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0', color: '#c62828' }}>前一天</Box>
                  </Box>
                  <Box component="tr" sx={{ bgcolor: '#fafafa' }}>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0', fontWeight: 600 }}>伦敦</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>零时区 (UTC+0)</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>−8小时</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0', fontWeight: 600, color: '#1565C0' }}>04:00</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>同日</Box>
                  </Box>
                  <Box component="tr">
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0', fontWeight: 600 }}>东京</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>东九区 (UTC+9)</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>+1小时</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0', fontWeight: 600, color: '#2E7D32' }}>13:00</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>同日</Box>
                  </Box>
                  <Box component="tr" sx={{ bgcolor: '#fafafa' }}>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0', fontWeight: 600 }}>莫斯科</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>东三区 (UTC+3)</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>−5小时</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0', fontWeight: 600, color: '#1565C0' }}>07:00</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>同日</Box>
                  </Box>
                  <Box component="tr">
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0', fontWeight: 600 }}>悉尼</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>东十区 (UTC+10)</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>+2小时</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0', fontWeight: 600, color: '#2E7D32' }}>14:00</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>同日</Box>
                  </Box>
                  <Box component="tr" sx={{ bgcolor: '#fafafa' }}>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0', fontWeight: 600 }}>洛杉矶</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>西八区 (UTC-8)</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0' }}>−16小时</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0', fontWeight: 600, color: '#1565C0' }}>20:00</Box>
                    <Box component="td" sx={{ p: 0.8, border: '1px solid #e0e0e0', color: '#c62828' }}>前一天</Box>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box sx={{ mt: 1.5, p: 1, bgcolor: '#fff8e1', borderRadius: 1, borderLeft: '4px solid #FF8F00' }}>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#E65100' }}>
                <b>💡 分析要点：</b>表中体现了「东早西晚」规律——东京在东侧，比北京早1小时（13:00）；纽约在西侧，比北京晚13小时（前一天23:00）。<b>「东加西减」</b>适用于所有时区换算。跨越国际日期变更线时注意日期变更（东→西加一天，西→东减一天）。
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* 时区计算常见错误 */}
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#c62828' }}>
              ⚠️ 时区计算常见错误（高考易错点汇总）
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5, lineHeight: 1.6 }}>
              <b>❌ 错误1——跨日界线忘记±1天：</b>这是时区计算<b>最高频错误</b>。当计算结果的小时 &lt; 0 或 ≥ 24 时，说明跨越了日界线。规则：小时≥24 → 小时−24，日期<b>+1天</b>；小时&lt;0 → 小时+24，日期<b>−1天</b>。例如：北京时间12:00求纽约时间：12−(8−(−5))=12−13=−1→−1+24=23时，日期减1天→昨天23:00。<b>口诀：「超了24加一天，不够0时减一天」。</b>
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5, lineHeight: 1.6 }}>
              <b>❌ 错误2——东西方向搞反（最致命）：</b>混淆"东加西减"的方向。<b>求东侧地点时间用加法，求西侧用减法</b>。易混淆场景：已知西侧时间求东侧→用加法；已知东侧时间求西侧→用减法。判断东西：时区号大的在东侧（东8区在东9区的西侧）。验证：北京(东8)12:00→东京(东9)=13:00（东侧加1h）；北京12:00→伦敦(0区)=4:00（西侧减8h）。口诀：「求东就加，求西就减；区号越大越在东」。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5, lineHeight: 1.6 }}>
              <b>❌ 错误3——时区差计算错误（同减异加搞混）：</b>同在<b>东时区</b>或同在<b>西时区</b>→大号减小号（相减）；一个在东时区、一个在西时区→区号绝对值和（相加）。例：东8区和东3区（同在东西区）→差=8−3=5小时；东8区和西5区（跨东西区）→差=8+5=13小时。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5, lineHeight: 1.6 }}>
              <b>❌ 错误4——地方时与区时混淆：</b>地方时基于经度（每1°差4分钟），区时基于时区（每1时区差1小时）。给定的"北京时间"是指东八区<b>区时</b>（120°E的地方时），而非北京本地（116.4°E）的地方时。高考题目严格区分"地方时"和"区时"，互换使用会导致约14分钟的误差。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
              <b>❌ 错误5——飞行时间题中的"到达时间"判断：</b>题型：飞机A地起飞→飞行N小时→B地到达。求到达时B地当地时间。步骤：①起飞时B地时间=A地时间±时区差→②到达时B地时间=①+N小时（飞行时间）。常见错误：先把A地时间+N小时（飞行后时间），再换算时区——两种顺序结果相同但第一种更直观。口诀：「先转时区再加飞行」。
            </Typography>
            <Box sx={{ mt: 1.5, p: 1, bgcolor: '#e8f5e9', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#2E7D32', fontWeight: 700 }}>
                ✅ 正确解题步骤：①确定两地时区号（分清东西）→②计算时区差（「同减异加」）→③「东加西减」→④若跨日期（结果&lt;0或≥24），调整日期 ±1天 → ⑤检查结果是否合理（东侧应早于西侧）。
              </Typography>
            </Box>
          </CardContent>
        </Card>

      </Box>
    </ToolPageLayout>
  );
};

export default TimezoneCalculator;
