import React, { useRef, useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, ToggleButton, ToggleButtonGroup, Divider } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { calcLocalTime, calcZoneTime, lngToTimezone } from '@/utils/geoCalculations';

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
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>公式速查</Typography>
            <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', mt: 0.5 }}>
              地方时：T₂ = T₁ + (λ₂ - λ₁) × 4min
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
              区时：T₂ = T₁ + (N₂ - N₁) × 1h
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
              时区号：N = round(λ / 15)
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </ToolPageLayout>
  );
};

export default TimezoneCalculator;
