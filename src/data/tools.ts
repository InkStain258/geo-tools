import type { ToolConfig } from '@/types';

export const moduleLabels: Record<string, string> = {
  natural: '自然地理',
  atmosphere: '大气与气候',
  astronomy: '天文与地球运动',
  human: '人文地理',
  learning: '辅助学习',
};

export const tools: ToolConfig[] = [
  {
    id: 'terrain-profile',
    name: '地形剖面生成器',
    module: 'natural',
    description: '绘制等高线地形图并生成交互式地形剖面图',
    icon: 'Terrain',
    path: '/tools/terrain-profile',
    priority: 1,
  },
  {
    id: 'river-basin',
    name: '河流流域交互图',
    module: 'natural',
    description: '探索河流流域特征与季节流量变化',
    icon: 'Water',
    path: '/tools/river-basin',
    priority: 2,
  },
  {
    id: 'ocean-current',
    name: '洋流动态模拟',
    module: 'natural',
    description: '可视化全球洋流分布与流动方向',
    icon: 'Waves',
    path: '/tools/ocean-current',
    priority: 3,
  },
  {
    id: 'climate-judge',
    name: '气候类型判断器',
    module: 'atmosphere',
    description: '根据气温降水数据逐步推理判断气候类型',
    icon: 'Cloud',
    path: '/tools/climate-judge',
    priority: 4,
  },
  {
    id: 'atmospheric-circulation',
    name: '大气环流可视化',
    module: 'atmosphere',
    description: '三圈环流与气压带风带的动态演示',
    icon: 'Air',
    path: '/tools/atmospheric-circulation',
    priority: 5,
  },
  {
    id: 'front-weather',
    name: '锋面天气模拟',
    module: 'atmosphere',
    description: '冷锋暖锋过境天气变化过程模拟',
    icon: 'Thunderstorm',
    path: '/tools/front-weather',
    priority: 6,
  },
  {
    id: 'sunlight-calculator',
    name: '日照图计算器',
    module: 'astronomy',
    description: '交互式日照图与晨昏线计算',
    icon: 'WbSunny',
    path: '/tools/sunlight-calculator',
    priority: 7,
  },
  {
    id: 'timezone-calculator',
    name: '时区与地方时计算器',
    module: 'astronomy',
    description: '计算不同经度的地方时与区时',
    icon: 'Schedule',
    path: '/tools/timezone-calculator',
    priority: 8,
  },
  {
    id: 'sun-altitude',
    name: '正午太阳高度角计算器',
    module: 'astronomy',
    description: '计算任意地点的正午太阳高度角',
    icon: 'LightMode',
    path: '/tools/sun-altitude',
    priority: 9,
  },
  {
    id: 'industrial-location',
    name: '工业区位分析',
    module: 'human',
    description: '不同工业类型的区位因素雷达图分析',
    icon: 'Factory',
    path: '/tools/industrial-location',
    priority: 10,
  },
  {
    id: 'agricultural-location',
    name: '农业区位图解',
    module: 'human',
    description: '农业区位因素分栏展示与权重分析',
    icon: 'Agriculture',
    path: '/tools/agricultural-location',
    priority: 11,
  },
  {
    id: 'city-hierarchy',
    name: '城市等级服务圈',
    module: 'human',
    description: '中心地理论与城市服务范围可视化',
    icon: 'LocationCity',
    path: '/tools/city-hierarchy',
    priority: 12,
  },
  {
    id: 'chart-reading',
    name: '图表判读训练',
    module: 'learning',
    description: '随机生成地理图表，步骤化判读引导',
    icon: 'BarChart',
    path: '/tools/chart-reading',
    priority: 13,
  },
  {
    id: 'formula-reference',
    name: '地理计算公式速查',
    module: 'learning',
    description: '常用地理公式速查与交互例题',
    icon: 'Calculate',
    path: '/tools/formula-reference',
    priority: 14,
  },
];

export function getToolById(id: string): ToolConfig | undefined {
  return tools.find((t) => t.id === id);
}

export function getToolsByModule(module: string): ToolConfig[] {
  return tools.filter((t) => t.module === module).sort((a, b) => a.priority - b.priority);
}
