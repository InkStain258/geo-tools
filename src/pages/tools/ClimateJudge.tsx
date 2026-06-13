import React, { useRef, useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Chip, LinearProgress } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import ClimateChart from '@/components/shared/ClimateChart';
import { exampleClimateData } from '@/data/climateData';
import { judgeClimate } from '@/utils/climateJudge';
import type { JudgeResult } from '@/utils/climateJudge';

const defaultTemps = [4.3, 5.6, 9.7, 15.8, 21.1, 24.8, 28.5, 27.9, 24.0, 18.5, 12.6, 6.7];
const defaultPrecips = [55, 65, 95, 105, 118, 185, 145, 140, 120, 65, 55, 40];

const ClimateJudge: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [temps, setTemps] = useState<number[]>([...defaultTemps]);
  const [precips, setPrecips] = useState<number[]>([...defaultPrecips]);
  const [result, setResult] = useState<JudgeResult | null>(null);

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  const handleJudge = () => {
    const r = judgeClimate(temps, precips);
    setResult(r);
  };

  const handleFillExample = (climateId: string) => {
    const ex = exampleClimateData[climateId as keyof typeof exampleClimateData];
    if (ex) {
      setTemps([...ex.temps]);
      setPrecips([...ex.precips]);
      setResult(null);
    }
  };

  const exampleClimateIds = Object.keys(exampleClimateData);

  return (
    <ToolPageLayout title="气候类型判断器" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}>
        {/* Left: Input panel */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>快速填充示例数据（点击切换）</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {exampleClimateIds.map((id) => {
              const ex = exampleClimateData[id as keyof typeof exampleClimateData];
              return (
                <Chip
                  key={id} label={ex?.label || id} size="small"
                  onClick={() => handleFillExample(id)} variant="outlined"
                  sx={{ cursor: 'pointer', fontSize: 11 }}
                />
              );
            })}
          </Box>

          <Box sx={{ bgcolor: '#fff3e0', p: 1.5, borderRadius: 2, mt: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#E65100' }}>
              💡 判断方法：以"温"定带 → 以"水"定型 → 综合判断（覆盖13种气候类型）
            </Typography>
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>月均气温 (°C)</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.5 }}>
            {temps.map((t, i) => (
              <TextField
                key={`t${i}`} size="small" type="number"
                label={months[i]} value={t}
                onChange={(e) => {
                  const newTemps = [...temps];
                  newTemps[i] = parseFloat(e.target.value) || 0;
                  setTemps(newTemps);
                }}
                slotProps={{ htmlInput: { style: { fontSize: 12 } } }}
              />
            ))}
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>月均降水 (mm)</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.5 }}>
            {precips.map((p, i) => (
              <TextField
                key={`p${i}`} size="small" type="number"
                label={months[i]} value={p}
                onChange={(e) => {
                  const newPrecips = [...precips];
                  newPrecips[i] = parseFloat(e.target.value) || 0;
                  setPrecips(newPrecips);
                }}
                slotProps={{ htmlInput: { style: { fontSize: 12 } } }}
              />
            ))}
          </Box>

          <Button
            variant="contained" onClick={handleJudge}
            sx={{ mt: 1, bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
          >
            开始判断
          </Button>
        </Box>

        {/* Right: Chart and results */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>气温降水统计图</Typography>
          <ClimateChart monthlyTemps={temps} monthlyPrecips={precips} height={260} />

          {result && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>推理过程</Typography>
              {result.steps.map((step, i) => (
                <Card key={i} variant="outlined" sx={{ bgcolor: step.title.includes('Step') ? '#f5f5f5' : '#e8f5e9' }}>
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                      {step.title}
                    </Typography>
                    {step.conclusion && (
                      <Typography variant="body2">
                        <strong>结论：</strong>{step.conclusion}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.8rem' }}>
                      {step.detail}
                    </Typography>
                  </CardContent>
                </Card>
              ))}

              {result.climate && (
                <Card sx={{ bgcolor: '#e8f5e9', border: '2px solid #2E7D32' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#2E7D32' }}>
                      {result.climate.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#757575' }}>
                      {result.climate.nameEn}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {result.climate.description}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`置信度 ${result.confidence}%`} color="primary" size="small" />
                      <LinearProgress
                        variant="determinate" value={result.confidence}
                        sx={{ flex: 1, height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              )}

              {result.candidates && result.candidates.length > 1 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#757575' }}>
                    其他可能类型：
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {result.candidates.slice(1).map((c, i) => (
                      <Chip
                        key={i}
                        label={`${c.climate.name} (${c.confidence}%)`}
                        size="small" variant="outlined"
                        sx={{ fontSize: 10 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* 气候分布简图 + 成因总结 */}
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* 气候分布简图 */}
          <Box sx={{ p: 1.5, bgcolor: '#e8eaf6', borderRadius: 2, border: '1px solid #9fa8da' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#283593', mb: 1 }}>
              🗺️ 世界气候分布简图（大陆位置模型）
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.5, color: '#555' }}>
              以理想大陆（北半球中纬度为例）东西两岸+内陆布局：
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.2 }}>
              <b>大陆西岸（30°-40°）：</b>地中海气候（夏干冬雨，副高+西风交替）
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.2 }}>
              <b>大陆西岸（40°-60°）：</b>温带海洋性气候（终年温和多雨，西风控制）
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.2 }}>
              <b>大陆东岸（25°-35°）：</b>亚热带季风气候（夏雨冬干，海陆热力差异）
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.2 }}>
              <b>大陆东岸（35°-55°）：</b>温带季风气候（夏雨冬干，四季分明）
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.2 }}>
              <b>大陆内陆（中纬度）：</b>温带大陆性气候（干燥少雨，年较差大）
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.2 }}>
              <b>赤道两侧（0°-10°）：</b>热带雨林气候（终年高温多雨，赤道低压）
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.2 }}>
              <b>回归线附近大陆西岸+内陆：</b>热带沙漠气候（副高+信风，极端干燥）
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
              <b>极地附近（60°-90°）：</b>亚寒带针叶林→苔原→冰原（热量递减）
            </Typography>
          </Box>

          {/* 气候成因总结 */}
          <Box sx={{ p: 1.5, bgcolor: '#fce4ec', borderRadius: 2, border: '1px solid #f48fb1' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#880e4f', mb: 1 }}>
              🔑 气候成因四大要素总结（高考答题模板）
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              <b>1. 气压带与风带（大气环流）：</b>最核心因素。如热带雨林→赤道低压控制上升气流；地中海→副高+西风交替；温带海洋→终年西风。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              <b>2. 海陆位置（海陆热力性质差异）：</b>决定季风气候。大陆东岸受季风影响显著（夏季海洋→陆地、冬季陆地→海洋）；大陆西岸受海洋调节、西风影响；内陆干燥、温差大。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              <b>3. 地形：</b>海拔升高→气温降低（0.6°C/100m）；迎风坡多雨（地形雨）、背风坡少雨（雨影效应/焚风）；山脉阻挡气流、改变气候分布。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
              <b>4. 洋流：</b>暖流增温增湿（如北大西洋暖流→西欧温暖湿润）；寒流降温减湿（如秘鲁寒流→南美西岸沙漠逼近赤道）。洋流影响沿海气候和降水分布。
            </Typography>
          </Box>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default ClimateJudge;
