import React, { useRef, useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText } from '@mui/material';
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
    </ToolPageLayout>
  );
};

export default IndustrialLocation;
