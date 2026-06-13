import React, { useRef, useState } from 'react';
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  TextField, Button, Card, CardContent, Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { geoFormulas } from '@/data/geoFormulas';
import {
  calcDeclination, calcSunAltitude, calcDayLength,
  calcLocalTime, calcZoneTime, calcDistance, calcSlope, calcPopDensity,
} from '@/utils/geoCalculations';

const FormulaReference: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [paramValues, setParamValues] = useState<Record<string, Record<string, number>>>({});
  const [calcResults, setCalcResults] = useState<Record<string, string>>({});

  const categories = [...new Set(geoFormulas.map((f) => f.category))];

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
    }
  };

  const updateParam = (formulaId: string, paramName: string, value: number) => {
    setParamValues((prev) => ({
      ...prev,
      [formulaId]: { ...(prev[formulaId] || {}), [paramName]: value },
    }));
  };

  return (
    <ToolPageLayout title="地理计算公式速查" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ maxWidth: 900 }}>
        {categories.map((cat) => (
          <Box key={cat} sx={{ mb: 2 }}>
            <Chip label={cat} sx={{ bgcolor: '#2E7D32', color: '#fff', fontWeight: 700, mb: 1 }} />
            {geoFormulas
              .filter((f) => f.category === cat)
              .map((formula) => (
                <Accordion key={formula.id} defaultExpanded={false}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{formula.name}</Typography>
                      <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#1565C0' }}>
                        {formula.formula}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 1 }}>{formula.description}</Typography>

                    {formula.params && (
                      <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 2, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>交互计算</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
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
                              helperText={p.unit}
                            />
                          ))}
                        </Box>
                        <Button variant="contained" size="small" onClick={() => handleCalc(formula.id)} sx={{ bgcolor: '#2E7D32' }}>
                          计算
                        </Button>
                        {calcResults[formula.id] && (
                          <Card sx={{ mt: 1, bgcolor: '#e8f5e9' }}>
                            <CardContent sx={{ py: 0.5, '&:last-child': { pb: 0.5 } }}>
                              <Typography variant="body1" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                                {calcResults[formula.id]}
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
        ))}
      </Box>
    </ToolPageLayout>
  );
};

export default FormulaReference;
