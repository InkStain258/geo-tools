import React, { useRef, useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Chip,
  ToggleButtonGroup, ToggleButton, Divider,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, Filler, ArcElement, RadialLinearScale,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import ClimateChart from '@/components/shared/ClimateChart';
import { climateTypes, exampleClimateData } from '@/data/climateData';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, Filler, ArcElement, RadialLinearScale,
);

type ChartType = 'climate' | 'isotherm' | 'precip-compare' | 'population-pyramid' | 'industry-pie' | 'isohyet' | 'temp-curve-compare';

interface QuizQuestion {
  type: ChartType;
  // climate chart
  temps?: number[];
  precips?: number[];
  // isotherm
  isothermData?: { cities: { name: string; lat: number; lng: number; temp: number }[] };
  // precip histogram
  precipHistData?: { labels: string[]; values: number[]; answer: string };
  // population pyramid
  popPyramidData?: { ages: string[]; male: number[]; female: number[]; answer: string };
  // industry pie
  industryData?: { labels: string[]; values: number[]; answer: string };
  // isohyet
  isohyetData?: { cities: { name: string; lat: number; precip: number }[]; season: string };
  // temp curve compare
  tempCurveData?: { cities: { name: string; climate: string; temps: number[] }[] };
  answer: string;
  steps: string[];
}

// ---- Data Generators ----

const ISOTHERM_CITIES = {
  china: [
    { name: '北京', lat: 39.9, lng: 116.4, temp: 12 },
    { name: '上海', lat: 31.2, lng: 121.5, temp: 17 },
    { name: '广州', lat: 23.1, lng: 113.3, temp: 22 },
    { name: '哈尔滨', lat: 45.8, lng: 126.5, temp: 4 },
    { name: '乌鲁木齐', lat: 43.8, lng: 87.6, temp: 7 },
    { name: '拉萨', lat: 29.7, lng: 91.1, temp: 9 },
    { name: '昆明', lat: 25.0, lng: 102.7, temp: 16 },
    { name: '海口', lat: 20.0, lng: 110.3, temp: 25 },
  ],
  world: [
    { name: '新加坡', lat: 1.3, lng: 103.8, temp: 27 },
    { name: '利雅得', lat: 24.7, lng: 46.7, temp: 27 },
    { name: '罗马', lat: 41.9, lng: 12.5, temp: 15 },
    { name: '伦敦', lat: 51.5, lng: -0.1, temp: 11 },
    { name: '莫斯科', lat: 55.8, lng: 37.6, temp: 6 },
    { name: '雅库茨克', lat: 62.0, lng: 129.7, temp: -9 },
    { name: '开罗', lat: 30.0, lng: 31.2, temp: 22 },
    { name: '悉尼', lat: -33.9, lng: 151.2, temp: 18 },
  ],
};

const PRECIP_HISTOGRAMS = [
  {
    answer: '热带雨林气候区',
    labels: ['新加坡', '马瑙斯', '雅加达', '吉隆坡', '科伦坡'],
    values: [2342, 2287, 1805, 2587, 2485],
  },
  {
    answer: '温带海洋性气候区',
    labels: ['伦敦', '巴黎', '柏林', '阿姆斯特丹', '都柏林'],
    values: [602, 641, 571, 838, 758],
  },
  {
    answer: '热带沙漠气候区',
    labels: ['利雅得', '开罗', '迪拜', '巴格达', '喀土穆'],
    values: [90, 25, 95, 140, 150],
  },
];

const POPULATION_PYRAMIDS = [
  {
    answer: '快速增长型（发展中国家）',
    ages: ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70+'],
    male: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1.5, 1],
    female: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 2, 1.5],
  },
  {
    answer: '稳定型（发达国家）',
    ages: ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70+'],
    male: [6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 6, 6, 5, 4],
    female: [6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 6, 6, 6, 6],
  },
  {
    answer: '收缩型（老龄化社会）',
    ages: ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70+'],
    male: [4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8, 7, 7, 6, 5],
    female: [4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8, 8, 8, 7, 7],
  },
];

const INDUSTRY_PIES = [
  {
    answer: '发达国家产业结构',
    labels: ['第一产业(农业)', '第二产业(工业)', '第三产业(服务业)'],
    values: [3, 25, 72],
  },
  {
    answer: '发展中国家产业结构',
    labels: ['第一产业(农业)', '第二产业(工业)', '第三产业(服务业)'],
    values: [25, 40, 35],
  },
  {
    answer: '新兴工业化国家',
    labels: ['第一产业(农业)', '第二产业(工业)', '第三产业(服务业)'],
    values: [10, 45, 45],
  },
];

const ISOHYET_DATA = [
  {
    answer: '中国年等降水量线分布',
    season: 'annual',
    cities: [
      { name: '台北', lat: 25.0, precip: 2400 },
      { name: '广州', lat: 23.1, precip: 1700 },
      { name: '武汉', lat: 30.6, precip: 1300 },
      { name: '北京', lat: 39.9, precip: 580 },
      { name: '呼和浩特', lat: 40.8, precip: 400 },
      { name: '乌鲁木齐', lat: 43.8, precip: 290 },
      { name: '喀什', lat: 39.5, precip: 65 },
    ],
  },
  {
    answer: '等降水量线判读——季风影响',
    season: 'annual',
    cities: [
      { name: '孟买', lat: 19.1, precip: 2200 },
      { name: '加尔各答', lat: 22.6, precip: 1600 },
      { name: '新德里', lat: 28.6, precip: 800 },
      { name: '斋浦尔', lat: 26.9, precip: 650 },
      { name: '卡拉奇', lat: 24.9, precip: 200 },
    ],
  },
];

const TEMP_CURVE_COMPARE = [
  {
    answer: '温带季风 vs 温带海洋性气候——气温曲线对比',
    cities: [
      { name: '北京', climate: '温带季风气候', temps: [-4, -1, 6, 14, 20, 25, 27, 25, 20, 13, 4, -2] },
      { name: '伦敦', climate: '温带海洋性气候', temps: [5, 5, 7, 9, 12, 15, 17, 17, 14, 11, 7, 5] },
    ],
  },
  {
    answer: '大陆性 vs 海洋性气候——气温年较差对比',
    cities: [
      { name: '莫斯科', climate: '温带大陆性气候', temps: [-9, -7, -2, 6, 14, 17, 19, 17, 11, 5, -1, -6] },
      { name: '都柏林', climate: '温带海洋性气候', temps: [5, 5, 7, 8, 11, 13, 15, 15, 13, 10, 7, 5] },
    ],
  },
  {
    answer: '同纬度——海拔对气温的影响',
    cities: [
      { name: '重庆(259m)', climate: '亚热带季风(低海拔)', temps: [8, 10, 15, 20, 24, 27, 30, 30, 25, 19, 14, 9] },
      { name: '昆明(1891m)', climate: '亚热带季风(高原)', temps: [8, 10, 14, 17, 19, 20, 20, 20, 18, 15, 12, 8] },
    ],
  },
];

function generateQuiz(): QuizQuestion {
  const types: ChartType[] = ['climate', 'isotherm', 'precip-compare', 'population-pyramid', 'industry-pie'];
  const type = types[Math.floor(Math.random() * types.length)];

  switch (type) {
    case 'climate': {
      const keys = Object.keys(exampleClimateData);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const ex = exampleClimateData[randomKey as keyof typeof exampleClimateData];
      const climate = climateTypes.find((c) => c.id === randomKey)!;
      return {
        type: 'climate',
        temps: [...ex.temps],
        precips: [...ex.precips],
        answer: climate.name,
        steps: climate.judgeRules,
      };
    }
    case 'isotherm': {
      const maps = ['china', 'world'] as const;
      const map = maps[Math.floor(Math.random() * maps.length)];
      const cities = ISOTHERM_CITIES[map];
      return {
        type: 'isotherm',
        isothermData: { cities },
        answer: map === 'china' ? '中国气温分布图判读' : '世界气温分布图判读',
        steps: [
          'Step 1: 观察纬度与气温的关系 → 纬度越高，气温越低',
          'Step 2: 查找等温线密集区域 → 温差大（地形、海陆）',
          'Step 3: 注意海陆差异 → 同纬度沿海冬季暖、夏季凉',
          'Step 4: 特殊等温线弯曲 → 地形/洋流/海陆影响',
        ],
      };
    }
    case 'precip-compare': {
      const dataset = PRECIP_HISTOGRAMS[Math.floor(Math.random() * PRECIP_HISTOGRAMS.length)];
      return {
        type: 'precip-compare',
        precipHistData: { labels: dataset.labels, values: dataset.values, answer: dataset.answer },
        answer: dataset.answer,
        steps: [
          'Step 1: 观察各城市年降水量 → 判断大致气候带',
          'Step 2: 查找降水分布规律 → 多雨/少雨/均匀',
          'Step 3: 结合城市所在大洲/纬度 → 判断气候类型',
          'Step 4: 对照气压带风带 → 确认降水成因',
        ],
      };
    }
    case 'population-pyramid': {
      const pyr = POPULATION_PYRAMIDS[Math.floor(Math.random() * POPULATION_PYRAMIDS.length)];
      return {
        type: 'population-pyramid',
        popPyramidData: { ages: pyr.ages, male: pyr.male, female: pyr.female, answer: pyr.answer },
        answer: pyr.answer,
        steps: [
          'Step 1: 看底部宽度 → 底部宽=高出生率（年轻型）',
          'Step 2: 看塔形 → 三角形=增长型 / 矩形=稳定型 / 倒三角=收缩型',
          'Step 3: 看顶部 → 顶部宽=老龄化严重',
          'Step 4: 看性别比 → 判断移民/战争等社会因素',
        ],
      };
    }
    case 'industry-pie': {
      const pie = INDUSTRY_PIES[Math.floor(Math.random() * INDUSTRY_PIES.length)];
      return {
        type: 'industry-pie',
        industryData: { labels: pie.labels, values: pie.values, answer: pie.answer },
        answer: pie.answer,
        steps: [
          'Step 1: 看第一产业占比 → >20%为农业国',
          'Step 2: 看第二产业占比 → >40%为工业化阶段',
          'Step 3: 看第三产业占比 → >60%为发达国家水平',
          'Step 4: 综合判断 → 三>二>一 = 发达 / 二>三>一 = 发展中工业国',
        ],
      };
    }
    case 'isohyet': {
      const iso = ISOHYET_DATA[Math.floor(Math.random() * ISOHYET_DATA.length)];
      return {
        type: 'isohyet',
        isohyetData: { cities: iso.cities, season: iso.season },
        answer: iso.answer,
        steps: [
          'Step 1: 观察降水量整体范围 → 判断干湿区（>800mm湿润，400-800mm半湿润，200-400mm半干旱，<200mm干旱）',
          'Step 2: 查找降水空间变化规律 → 从沿海向内陆递减？从低纬向高纬递减？',
          'Step 3: 注意特殊值 → 800mm等降水量线（秦岭—淮河线）、400mm等降水量线（季风区与非季风区分界）',
          'Step 4: 结合海陆位置和地形 → 判断降水分布成因（距海远近、地形抬升/雨影效应、洋流影响）',
        ],
      };
    }
    case 'temp-curve-compare': {
      const tc = TEMP_CURVE_COMPARE[Math.floor(Math.random() * TEMP_CURVE_COMPARE.length)];
      return {
        type: 'temp-curve-compare',
        tempCurveData: { cities: tc.cities },
        answer: tc.answer,
        steps: [
          'Step 1: 比较两条曲线的最冷月气温 → 判断气候带（>15°C热带，0-15°C亚热带/温带海洋，<0°C温带/寒带）',
          'Step 2: 比较气温年较差 → 年较差大=大陆性；年较差小=海洋性',
          'Step 3: 观察曲线形状 → \"尖峰\"=大陆性特征；\"平缓\"=海洋性特征',
          'Step 4: 结合地理因素 → 海陆位置、海拔高度、纬度等综合分析成因',
        ],
      };
    }
  }
}

const IsothermChart: React.FC<{ cities: { name: string; lat: number; lng: number; temp: number }[] }> = ({ cities }) => {
  const data = {
    labels: cities.map((c) => c.name),
    datasets: [
      {
        label: '年均温 (°C)',
        data: cities.map((c) => c.temp),
        backgroundColor: cities.map((c) =>
          c.temp > 20 ? 'rgba(244,67,54,0.6)' :
          c.temp > 10 ? 'rgba(255,152,0,0.6)' :
          c.temp > 0 ? 'rgba(76,175,80,0.6)' :
          'rgba(33,150,243,0.6)'
        ),
        borderColor: '#333',
        borderWidth: 1,
      },
    ],
  };
  return (
    <div style={{ height: 280 }}>
      <Chart type="bar" data={data} options={{
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { title: { display: true, text: '°C' } } },
      }} />
    </div>
  );
};

const PrecipHistogram: React.FC<{ labels: string[]; values: number[] }> = ({ labels, values }) => {
  const data = {
    labels,
    datasets: [{
      label: '年降水量 (mm)',
      data: values,
      backgroundColor: 'rgba(21,101,192,0.6)',
      borderColor: '#1565C0',
      borderWidth: 1,
    }],
  };
  return (
    <div style={{ height: 280 }}>
      <Chart type="bar" data={data} options={{
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { title: { display: true, text: 'mm' } } },
      }} />
    </div>
  );
};

const PopulationPyramid: React.FC<{ ages: string[]; male: number[]; female: number[] }> = ({ ages, male, female }) => {
  const data = {
    labels: ages,
    datasets: [
      {
        label: '男性 (%)',
        data: male.map((v) => -v),
        backgroundColor: 'rgba(21,101,192,0.6)',
        borderColor: '#1565C0',
        borderWidth: 1,
      },
      {
        label: '女性 (%)',
        data: female,
        backgroundColor: 'rgba(233,30,99,0.6)',
        borderColor: '#E91E63',
        borderWidth: 1,
      },
    ],
  };
  return (
    <div style={{ height: 280 }}>
      <Chart type="bar" data={data} options={{
        responsive: true, maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { position: 'top' as const } },
        scales: {
          x: {
            stacked: false,
            ticks: { callback: (v) => Math.abs(Number(v)) + '%' },
            title: { display: true, text: '男性 ← | → 女性' },
          },
          y: { stacked: false, title: { display: true, text: '年龄段' } },
        },
      }} />
    </div>
  );
};

const IndustryPieChart: React.FC<{ labels: string[]; values: number[] }> = ({ labels, values }) => {
  const data = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: ['#66BB6A', '#1565C0', '#F44336'],
      borderColor: '#fff',
      borderWidth: 2,
    }],
  };
  return (
    <div style={{ height: 280, display: 'flex', justifyContent: 'center' }}>
      <Chart type="pie" data={data} options={{
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' as const },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` } },
        },
      }} />
    </div>
  );
};

const IsohyetChart: React.FC<{ cities: { name: string; lat: number; precip: number }[] }> = ({ cities }) => {
  const data = {
    labels: cities.map((c) => c.name),
    datasets: [
      {
        type: 'bar' as const,
        label: '年降水量 (mm)',
        data: cities.map((c) => c.precip),
        backgroundColor: cities.map((c) =>
          c.precip > 1600 ? 'rgba(21,101,192,0.8)' :
          c.precip > 800 ? 'rgba(46,125,50,0.7)' :
          c.precip > 400 ? 'rgba(255,152,0,0.6)' :
          'rgba(244,67,54,0.5)'
        ),
        borderColor: '#333',
        borderWidth: 1,
      },
      {
        type: 'line' as const,
        label: '趋势线',
        data: cities.map((c) => c.precip),
        borderColor: '#D32F2F',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
      },
    ],
  };
  return (
    <div style={{ height: 280 }}>
      <Chart type="bar" data={data} options={{
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' as const },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => `干湿区: ${Number(ctx.parsed.y) > 800 ? '湿润区' : Number(ctx.parsed.y) > 400 ? '半湿润区' : Number(ctx.parsed.y) > 200 ? '半干旱区' : '干旱区'}`,
            },
          },
        },
        scales: { y: { title: { display: true, text: 'mm' } } },
      }} />
    </div>
  );
};

const TempCurveCompareChart: React.FC<{ cities: { name: string; climate: string; temps: number[] }[] }> = ({ cities }) => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const colors = ['#F44336', '#1565C0', '#2E7D32'];
  const datasets = cities.map((city, i) => ({
    label: `${city.name} (${city.climate})`,
    data: city.temps,
    borderColor: colors[i % colors.length],
    backgroundColor: 'transparent',
    borderWidth: 2.5,
    pointRadius: 4,
    pointHoverRadius: 6,
    tension: 0.4,
  }));
  const data = { labels: months, datasets };
  return (
    <div style={{ height: 280 }}>
      <Chart type="line" data={data} options={{
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom' as const },
          tooltip: {
            callbacks: {
              afterLabel: () => '提示：年较差=最热月-最冷月，越大=大陆性越强',
            },
          },
        },
        scales: {
          y: {
            title: { display: true, text: '°C' },
            grid: { color: (ctx) => ctx.tick.value === 0 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)' },
          },
        },
      }} />
    </div>
  );
};

// ---- Quiz Guide Cards ----
const quizGuides: Record<ChartType, { title: string; icon: string; desc: string }> = {
  climate: { title: '气候统计图', icon: '🌡️', desc: '通过气温-降水柱状/曲线图判断气候类型' },
  isotherm: { title: '等温线图', icon: '🌍', desc: '通过等温线分布判断气温分布规律' },
  'precip-compare': { title: '降水量柱状比较', icon: '🌧️', desc: '通过多城市降水量比较判断气候区' },
  'population-pyramid': { title: '人口金字塔', icon: '👥', desc: '通过年龄结构判断人口增长模式' },
  'industry-pie': { title: '产业结构饼图', icon: '🏭', desc: '通过三次产业占比判断经济发展阶段' },
  isohyet: { title: '等降水量线图', icon: '💧', desc: '通过等降水量线空间变化判断降水分布规律' },
  'temp-curve-compare': { title: '气温曲线对比', icon: '📈', desc: '比较两条气温曲线判断气候类型差异' },
};

const ChartReading: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [quiz, setQuiz] = useState<QuizQuestion>(generateQuiz);
  const [currentStep, setCurrentStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleNext = () => {
    setQuiz(generateQuiz());
    setCurrentStep(0);
    setShowAnswer(false);
  };

  const handleNewSameType = () => {
    const currentType = quiz.type;
    const newQuiz = generateQuiz();
    // Keep same type if possible
    let attempts = 0;
    let q = newQuiz;
    while (q.type !== currentType && attempts < 10) {
      q = generateQuiz();
      attempts++;
    }
    setQuiz(q);
    setCurrentStep(0);
    setShowAnswer(false);
  };

  // Climate data
  const avgTemp = quiz.temps ? quiz.temps.reduce((a, b) => a + b, 0) / 12 : null;
  const maxTemp = quiz.temps ? Math.max(...quiz.temps) : null;
  const minTemp = quiz.temps ? Math.min(...quiz.temps) : null;
  const annualPrecip = quiz.precips ? quiz.precips.reduce((a, b) => a + b, 0) : null;

  const guide = quizGuides[quiz.type];
  const steps = quiz.steps;

  const renderChart = () => {
    switch (quiz.type) {
      case 'climate':
        return <ClimateChart monthlyTemps={quiz.temps!} monthlyPrecips={quiz.precips!} height={280} />;
      case 'isotherm':
        return <IsothermChart cities={quiz.isothermData!.cities} />;
      case 'precip-compare':
        return <PrecipHistogram labels={quiz.precipHistData!.labels} values={quiz.precipHistData!.values} />;
      case 'population-pyramid':
        return <PopulationPyramid ages={quiz.popPyramidData!.ages} male={quiz.popPyramidData!.male} female={quiz.popPyramidData!.female} />;
      case 'industry-pie':
        return <IndustryPieChart labels={quiz.industryData!.labels} values={quiz.industryData!.values} />;
      case 'isohyet':
        return <IsohyetChart cities={quiz.isohyetData!.cities} />;
      case 'temp-curve-compare':
        return <TempCurveCompareChart cities={quiz.tempCurveData!.cities} />;
    }
  };

  const renderDataSummary = () => {
    switch (quiz.type) {
      case 'climate':
        return (
          <>
            <Typography variant="body2">年均温：{avgTemp!.toFixed(1)}°C</Typography>
            <Typography variant="body2">最热月：{maxTemp}°C / 最冷月：{minTemp}°C</Typography>
            <Typography variant="body2">年降水量：{annualPrecip}mm</Typography>
            <Typography variant="body2">气温年较差：{(maxTemp! - minTemp!).toFixed(1)}°C</Typography>
          </>
        );
      case 'isotherm':
        return (
          <>
            <Typography variant="body2">共 {quiz.isothermData!.cities.length} 个城市</Typography>
            <Typography variant="body2">最高温：{Math.max(...quiz.isothermData!.cities.map((c) => c.temp))}°C</Typography>
            <Typography variant="body2">最低温：{Math.min(...quiz.isothermData!.cities.map((c) => c.temp))}°C</Typography>
            <Typography variant="body2">温差：{(Math.max(...quiz.isothermData!.cities.map((c) => c.temp)) - Math.min(...quiz.isothermData!.cities.map((c) => c.temp))).toFixed(1)}°C</Typography>
          </>
        );
      case 'precip-compare':
        return (
          <>
            <Typography variant="body2">共 {quiz.precipHistData!.labels.length} 个城市</Typography>
            <Typography variant="body2">最大降水量：{Math.max(...quiz.precipHistData!.values)}mm</Typography>
            <Typography variant="body2">最小降水量：{Math.min(...quiz.precipHistData!.values)}mm</Typography>
            <Typography variant="body2">平均降水量：{(quiz.precipHistData!.values.reduce((a, b) => a + b, 0) / quiz.precipHistData!.values.length).toFixed(0)}mm</Typography>
          </>
        );
      case 'population-pyramid':
        return (
          <>
            <Typography variant="body2">年龄段：{quiz.popPyramidData!.ages.length} 层</Typography>
            <Typography variant="body2">总男性占比：{quiz.popPyramidData!.male.reduce((a, b) => a + b, 0).toFixed(0)}%</Typography>
            <Typography variant="body2">总女性占比：{quiz.popPyramidData!.female.reduce((a, b) => a + b, 0).toFixed(0)}%</Typography>
            <Typography variant="body2">0-14岁占比（判断年轻/老龄化）</Typography>
          </>
        );
      case 'industry-pie':
        const total = quiz.industryData!.values.reduce((a, b) => a + b, 0);
        return (
          <>
            <Typography variant="body2">第一产业：{quiz.industryData!.values[0]}%</Typography>
            <Typography variant="body2">第二产业：{quiz.industryData!.values[1]}%</Typography>
            <Typography variant="body2">第三产业：{quiz.industryData!.values[2]}%</Typography>
            <Typography variant="body2">三产排序：{quiz.industryData!.values[2] > quiz.industryData!.values[1] ? '三>二>一' : '二>三>一'}</Typography>
          </>
        );
      case 'isohyet':
        const isoMax = Math.max(...quiz.isohyetData!.cities.map(c => c.precip));
        const isoMin = Math.min(...quiz.isohyetData!.cities.map(c => c.precip));
        return (
          <>
            <Typography variant="body2">城市数：{quiz.isohyetData!.cities.length} 个</Typography>
            <Typography variant="body2">最大降水量：{isoMax}mm（{isoMax > 800 ? '湿润区' : isoMax > 400 ? '半湿润区' : isoMax > 200 ? '半干旱区' : '干旱区'}）</Typography>
            <Typography variant="body2">最小降水量：{isoMin}mm（{isoMin > 800 ? '湿润区' : isoMin > 400 ? '半湿润区' : isoMin > 200 ? '半干旱区' : '干旱区'}）</Typography>
            <Typography variant="body2">降水空间变化：从东南沿海向西北内陆递减（体现海陆位置影响）</Typography>
          </>
        );
      case 'temp-curve-compare':
        const city1Range = Math.max(...quiz.tempCurveData!.cities[0].temps) - Math.min(...quiz.tempCurveData!.cities[0].temps);
        const city2Range = Math.max(...quiz.tempCurveData!.cities[1].temps) - Math.min(...quiz.tempCurveData!.cities[1].temps);
        return (
          <>
            <Typography variant="body2">{quiz.tempCurveData!.cities[0].name} 年较差：{city1Range.toFixed(0)}°C</Typography>
            <Typography variant="body2">{quiz.tempCurveData!.cities[1].name} 年较差：{city2Range.toFixed(0)}°C</Typography>
            <Typography variant="body2">
              差异原因：{city1Range > city2Range ?
                `${quiz.tempCurveData!.cities[0].name}大陆性更强（距海远/海拔高）` :
                `${quiz.tempCurveData!.cities[1].name}大陆性更强`}
            </Typography>
            <Typography variant="body2">气候类型判断：年较差大→大陆性气候；年较差小→海洋性气候</Typography>
          </>
        );
    }
  };

  return (
    <ToolPageLayout title="图表判读训练" exportRef={exportRef}>
      <Box ref={exportRef} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {guide.icon} {guide.title} · 请判读以下图表
            </Typography>
            <Chip label={quiz.type === 'climate' ? '气候图' : quiz.type === 'isotherm' ? '等温线' : quiz.type === 'precip-compare' ? '降水柱状' : quiz.type === 'population-pyramid' ? '人口金字塔' : quiz.type === 'industry-pie' ? '产业结构' : quiz.type === 'isohyet' ? '等降水量线' : '气温曲线对比'} size="small" color="success" variant="outlined" />
          </Box>
          <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
            {guide.desc}
          </Typography>
          
          {renderChart()}

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>数据摘要</Typography>
            {renderDataSummary()}
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>判读步骤引导</Typography>

          {steps.map((step, i) => (
            <Card key={i} variant="outlined" sx={{
              mb: 1,
              opacity: currentStep >= i ? 1 : 0.4,
              transition: 'opacity 0.3s',
            }}>
              <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {currentStep >= i ? step : step.replace(/^Step \d+: /, `Step ${i + 1}: ???`)}
                </Typography>
                {currentStep >= i && (
                  <Typography variant="body2" sx={{ color: '#2E7D32', mt: 0.5 }}>
                    {step}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}

          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={() => setCurrentStep((s) => Math.min(s + 1, steps.length))}
              disabled={currentStep >= steps.length}
            >
              下一步
            </Button>
            <Button
              variant="contained"
              onClick={() => setShowAnswer(true)}
              sx={{ bgcolor: '#2E7D32' }}
            >
              显示答案
            </Button>
            <Button variant="outlined" onClick={handleNewSameType}>
              同类型新题
            </Button>
            <Button variant="outlined" onClick={handleNext}>
              随机换题
            </Button>
          </Box>

          {showAnswer && (
            <Card sx={{ mt: 2, bgcolor: '#e8f5e9', border: '2px solid #2E7D32' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#2E7D32' }}>
                  答案：{quiz.answer}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {steps.map((s, i) => (
                    <Typography key={i} variant="body2" sx={{ mb: 0.3 }}>
                      {s}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>📊 图表类型说明</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(quizGuides).map(([key, g]) => (
              <Chip
                key={key}
                icon={<span>{g.icon}</span>}
                label={g.title}
                size="small"
                color={quiz.type === key ? 'success' : 'default'}
                variant={quiz.type === key ? 'filled' : 'outlined'}
                sx={{ cursor: 'default' }}
              />
            ))}
          </Box>

          {/* 图表判读口诀 */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff8e1', borderRadius: 2, borderLeft: '4px solid #FF8F00' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E65100', mb: 0.5 }}>
              🎯 图表判读通用口诀（高考答题模板）
            </Typography>
            <Box sx={{ bgcolor: '#fff', p: 1.5, borderRadius: 1, mb: 1, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#E65100', fontSize: '0.95rem', letterSpacing: 1 }}>
                读图名 → 看坐标 → 析趋势 → 找特征 → 得结论
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
              <b>第一步 · 读图名：</b>明确图表主题（是什么图？气温曲线+降水柱状图？等压线图？人口金字塔？产业结构图？）。图名包含<b>核心地理信息</b>——时间（年/月/季节）、地点（城市/区域/国家）、统计指标。忽略图名是入门级错误。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
              <b>第二步 · 看坐标：</b>横轴和纵轴各代表什么？（时间-月份？空间-经度/纬度？数量-温度°C/降水量mm/人口万人？单位注意：是‰还是%？是mm还是m？）。特别注意<b>双纵轴</b>图表——左右轴可能表示不同量纲（如气温用左轴°C、降水用右轴mm）。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
              <b>第三步 · 析趋势：</b>整体变化趋势——上升？下降？波动？周期性？阶段性？如气温曲线呈"单峰型"（夏高冬低）→大陆性/季风气候；"平缓型"→海洋性/热带气候。识别趋势中的<b>拐点</b>（突变时间/地点）往往是关键考点。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
              <b>第四步 · 找特征：</b>找极值（最大值/最小值出现的时间和数值）、找异常（偏离趋势的点）、找对比（不同曲线/柱体间的差异）、找特殊值（0°C线、800mm线、临界值）。如最冷月&gt;15°C→热带，最冷月0-15°C→亚热带，最冷月&lt;0°C→温带。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              <b>第五步 · 得结论：</b>将特征还原为地理规律 → 判断气候类型/地形部位/人口模式/经济阶段 → 用<b>地理术语</b>规范表述（"受XX控制""体现了XX规律""符合XX分布特征"）。结论必须<b>基于图表数据</b>，不能凭空套用记忆中的模板。
            </Typography>
          </Box>

          {/* 常见图表判读陷阱 */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fce4ec', borderRadius: 2, border: '1px solid #f48fb1' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#880e4f', mb: 1 }}>
              ⚠️ 常见图表判读陷阱（高考易错点汇总）
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              <b>❌ 陷阱1——忽略图名/图例：</b>直接看数据而忽略图名→误判图表类型。如把"某地各月降水量图"当成"年降水量分布图"→得出空间规律却忽略了时间变化。解法：<b>先看图名，再看图例，再读数据</b>。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              <b>❌ 陷阱2——混淆双纵轴：</b>气温用左轴°C、降水用右轴mm→看到冬季降水柱"高"就以为多雨（实际可能只有几十mm）。解法：<b>看清每个纵轴的名称、单位和刻度范围</b>。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              <b>❌ 陷阱3——比例尺/刻度变形：</b>纵轴刻度的压缩或拉伸会夸大/缩小变化幅度。如纵轴从0开始vs从100开始→同一组数据看起来差异巨大。解法：<b>查看纵轴起点和刻度间距</b>，不要仅凭视觉判断。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              <b>❌ 陷阱4——等值线判读方向错误：</b>等高线向高值凸→山谷（凸高为谷）；向低值凸→山脊（凸低为脊）。常考反记。解法：口诀<b>"凸高为谷，凸低为脊"</b>或"等高线弯曲指向海拔低处→山脊（水往两侧流）"。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              <b>❌ 陷阱5——人口金字塔误判：</b>只看底部宽窄就判断增长型/缩减型，忽略了<b>性别比异常</b>可能反映的移民/战争因素。解法：综合看塔形+性别比+顶部宽度+中间凸凹。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
              <b>❌ 陷阱6——产业结构饼图惯性思维：</b>看到"第三产业&gt;50%"就判断为发达国家，但忽略了可能是<b>旅游型小国</b>（如马尔代夫、塞舌尔——第三产业主要是旅游，工业化程度实际很低）。解法：结合<b>人均GDP、城市化率、工业化水平</b>综合判断。
            </Typography>
          </Box>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

export default ChartReading;
