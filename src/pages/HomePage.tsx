import React from 'react';
import { Box, Typography, Card, CardContent, Chip, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import TerrainIcon from '@mui/icons-material/Terrain';
import WaterIcon from '@mui/icons-material/Water';
import WavesIcon from '@mui/icons-material/Waves';
import CloudIcon from '@mui/icons-material/Cloud';
import AirIcon from '@mui/icons-material/Air';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LightModeIcon from '@mui/icons-material/LightMode';
import FactoryIcon from '@mui/icons-material/Factory';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalculateIcon from '@mui/icons-material/Calculate';
import { tools, moduleLabels, getToolsByModule } from '@/data/tools';
import type { ToolConfig } from '@/types';

const iconMap: Record<string, React.ReactNode> = {
  Terrain: <TerrainIcon />,
  Water: <WaterIcon />,
  Waves: <WavesIcon />,
  Cloud: <CloudIcon />,
  Air: <AirIcon />,
  Thunderstorm: <ThunderstormIcon />,
  WbSunny: <WbSunnyIcon />,
  Schedule: <ScheduleIcon />,
  LightMode: <LightModeIcon />,
  Factory: <FactoryIcon />,
  Agriculture: <AgricultureIcon />,
  LocationCity: <LocationCityIcon />,
  BarChart: <BarChartIcon />,
  Calculate: <CalculateIcon />,
};

const moduleColors: Record<string, string> = {
  natural: '#2E7D32',
  atmosphere: '#1565C0',
  astronomy: '#F57C00',
  human: '#7B1FA2',
  learning: '#00838F',
};

interface HomePageProps {
  searchQuery?: string;
}

const HomePage: React.FC<HomePageProps> = ({ searchQuery = '' }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const activeModule = searchParams.get('module') || '';

  const filteredTools = tools.filter((t) => {
    const matchSearch = !searchQuery ||
      t.name.includes(searchQuery) ||
      t.description.includes(searchQuery);
    const matchModule = !activeModule || t.module === activeModule;
    return matchSearch && matchModule;
  });

  const groupedTools: Record<string, ToolConfig[]> = {};
  if (activeModule) {
    groupedTools[activeModule] = filteredTools;
  } else {
    filteredTools.forEach((t) => {
      if (!groupedTools[t.module]) groupedTools[t.module] = [];
      groupedTools[t.module].push(t);
    });
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* Hero */}
      <Box sx={{ textAlign: 'center', py: { xs: 3, md: 5 } }}>
        <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 800, color: '#2E7D32', mb: 1 }}>
          🌍 GeoTools
        </Typography>
        <Typography variant="h6" sx={{ color: '#757575', fontWeight: 400 }}>
          高中地理交互工具 · 让地理学习更直观
        </Typography>
      </Box>

      {/* Tool cards grouped by module */}
      {Object.entries(groupedTools).map(([moduleKey, moduleTools]) => (
        <Box key={moduleKey} sx={{ mb: 4 }}>
          <Chip
            label={moduleLabels[moduleKey] || moduleKey}
            sx={{
              bgcolor: moduleColors[moduleKey] || '#2E7D32',
              color: '#fff',
              fontWeight: 700,
              mb: 2,
              fontSize: '0.9rem',
            }}
          />
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}>
            {moduleTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <Card
                  onClick={() => navigate(tool.path)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: 4,
                      borderColor: moduleColors[tool.module],
                    },
                    border: '1px solid #e0e0e0',
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{
                        color: moduleColors[tool.module],
                        mr: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 28,
                      }}>
                        {iconMap[tool.icon] || <TerrainIcon />}
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {tool.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.8rem', lineHeight: 1.5 }}>
                      {tool.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        </Box>
      ))}

      {filteredTools.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8, color: '#757575' }}>
          <Typography variant="h6">未找到匹配的工具</Typography>
        </Box>
      )}
    </Box>
  );
};

export default HomePage;
