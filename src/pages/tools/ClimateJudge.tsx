import React, { useRef, useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Chip } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import ClimateChart from '@/components/shared/ClimateChart';
import { exampleClimateData } from '@/data/climateData';
import { judgeClimate } from '@/utils/climateJudge';
import type { JudgeResult } from '@/utils/climateJudge';
import type { ClimateType } from '@/types';

const defaultTemps = [4, 5, 10, 16, 21, 25, 29, 28, 24, 18, 12, 6];
const defaultPrecips = [50, 60, 90, 110, 130, 180, 150, 140, 120, 70, 55, 45];

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
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>快速填充示例数据</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {exampleClimateIds.map((id) => {
              const label = id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
              return (
                <Chip key={id} label={label} size="small" onClick={() => handleFillExample(id)} variant="outlined" sx={{ cursor: 'pointer' }} />
              );
            })}
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>月均气温 (°C)</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.5 }}>
            {temps.map((t, i) => (
              <TextField
                key={`t${i}`}
                size="small"
                type="number"
                label={months[i]}
                value={t}
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
                key={`p${i}`}
                size="small"
                type="number"
                label={months[i]}
                value={p}
                onChange={(e) => {
                  const newPrecips = [...precips];
                  newPrecips[i] = parseFloat(e.target.value) || 0;
                  setPrecips(newPrecips);
                }}
                slotProps={{ htmlInput: { style: { fontSize: 12 } } }}
              />
            ))}
          </Box>

          <Button variant="contained" onClick={handleJudge} sx={{ mt: 1, bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}>
            开始判断
          </Button>
        </Box>

        {/* Right: Chart and result */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>气温降水统计图</Typography>
          <ClimateChart monthlyTemps={temps} monthlyPrecips={precips} height={260} />

          {result && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>推理过程</Typography>
              {result.steps.map((step, i) => (
                <Card key={i} variant="outlined" sx={{ bgcolor: '#f5f5f5' }}>
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2">
                      <strong>结论：</strong>{step.conclusion}
                    </Typography>
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
                    <Chip label={`置信度 ${result.confidence}%`} sx={{ mt: 1 }} color="primary" size="small" />
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default ClimateJudge;
