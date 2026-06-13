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
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default AgriculturalLocation;
