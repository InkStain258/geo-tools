import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/pages/HomePage';

const TerrainProfile = lazy(() => import('@/pages/tools/TerrainProfile'));
const RiverBasin = lazy(() => import('@/pages/tools/RiverBasin'));
const OceanCurrent = lazy(() => import('@/pages/tools/OceanCurrent'));
const ClimateJudge = lazy(() => import('@/pages/tools/ClimateJudge'));
const AtmosphericCirculation = lazy(() => import('@/pages/tools/AtmosphericCirculation'));
const FrontWeather = lazy(() => import('@/pages/tools/FrontWeather'));
const SunlightCalculator = lazy(() => import('@/pages/tools/SunlightCalculator'));
const TimezoneCalculator = lazy(() => import('@/pages/tools/TimezoneCalculator'));
const SunAltitude = lazy(() => import('@/pages/tools/SunAltitude'));
const IndustrialLocation = lazy(() => import('@/pages/tools/IndustrialLocation'));
const AgriculturalLocation = lazy(() => import('@/pages/tools/AgriculturalLocation'));
const CityHierarchy = lazy(() => import('@/pages/tools/CityHierarchy'));
const ChartReading = lazy(() => import('@/pages/tools/ChartReading'));
const FormulaReference = lazy(() => import('@/pages/tools/FormulaReference'));

const Loading: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <CircularProgress sx={{ color: '#2E7D32' }} />
  </Box>
);

const App: React.FC = () => {
  return (
    <AppLayout>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools/terrain-profile" element={<TerrainProfile />} />
          <Route path="/tools/river-basin" element={<RiverBasin />} />
          <Route path="/tools/ocean-current" element={<OceanCurrent />} />
          <Route path="/tools/climate-judge" element={<ClimateJudge />} />
          <Route path="/tools/atmospheric-circulation" element={<AtmosphericCirculation />} />
          <Route path="/tools/front-weather" element={<FrontWeather />} />
          <Route path="/tools/sunlight-calculator" element={<SunlightCalculator />} />
          <Route path="/tools/timezone-calculator" element={<TimezoneCalculator />} />
          <Route path="/tools/sun-altitude" element={<SunAltitude />} />
          <Route path="/tools/industrial-location" element={<IndustrialLocation />} />
          <Route path="/tools/agricultural-location" element={<AgriculturalLocation />} />
          <Route path="/tools/city-hierarchy" element={<CityHierarchy />} />
          <Route path="/tools/chart-reading" element={<ChartReading />} />
          <Route path="/tools/formula-reference" element={<FormulaReference />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

export default App;
