import type { TerrainPreset, RiverBasin, OceanCurrent } from '@/types';

/** 地形剖面预设 */
export const terrainPresets: TerrainPreset[] = [
  {
    id: 'mountain',
    name: '山地',
    description: '典型山地地形，中间高四周低',
    peakX: 200,
    peakY: 200,
    peakHeight: 800,
    contours: [
      [100, 100], [200, 80], [300, 100], [340, 160], [350, 250],
      [340, 340], [300, 400], [200, 420], [100, 400], [60, 340],
      [50, 250], [60, 160],
    ],
  },
  {
    id: 'basin',
    name: '盆地',
    description: '四周高中间低，典型盆地地形',
    peakX: 200,
    peakY: 200,
    peakHeight: 600,
    contours: [
      [80, 80], [320, 80], [360, 200], [320, 320], [200, 360],
      [80, 320], [40, 200],
    ],
  },
  {
    id: 'valley',
    name: '山谷',
    description: '两山之间低洼地带，等高线向高处凸出',
    peakX: 200,
    peakY: 100,
    peakHeight: 700,
    contours: [
      [50, 50], [150, 70], [200, 150], [250, 70], [350, 50],
      [380, 200], [350, 350], [250, 380], [200, 300], [150, 380],
      [50, 350], [20, 200],
    ],
  },
  {
    id: 'ridge',
    name: '山脊',
    description: '等高线向低处凸出，分水岭',
    peakX: 200,
    peakY: 200,
    peakHeight: 750,
    contours: [
      [150, 50], [250, 50], [280, 150], [250, 250], [280, 350],
      [250, 450], [150, 450], [120, 350], [150, 250], [120, 150],
    ],
  },
  {
    id: 'saddle',
    name: '鞍部',
    description: '两山顶之间低洼处',
    peakX: 200,
    peakY: 200,
    peakHeight: 650,
    contours: [
      [100, 50], [180, 80], [220, 200], [180, 320], [100, 350],
      [60, 320], [80, 200], [60, 80],
    ],
  },
];

/** 河流流域数据 */
export const riverBasins: RiverBasin[] = [
  {
    id: 'yangtze',
    name: '长江流域',
    area: 1800000,
    length: 6300,
    seasonalFlow: [12000, 14000, 18000, 25000, 35000, 42000, 50000, 45000, 38000, 28000, 18000, 13000],
    description: '中国第一大河，流域面积180万平方公里，雨季流量远大于旱季',
  },
  {
    id: 'yellow',
    name: '黄河流域',
    area: 750000,
    length: 5464,
    seasonalFlow: [3000, 3500, 5000, 8000, 12000, 15000, 18000, 16000, 12000, 8000, 5000, 3500],
    description: '中国第二大河，以含沙量高著称，夏季流量集中',
  },
  {
    id: 'pearl',
    name: '珠江流域',
    area: 450000,
    length: 2320,
    seasonalFlow: [5000, 6000, 9000, 15000, 22000, 28000, 30000, 28000, 22000, 12000, 7000, 5000],
    description: '中国第三大河，位于亚热带季风区，降水丰富',
  },
];

/** 洋流数据 */
export const oceanCurrents: OceanCurrent[] = [
  {
    id: 'kuroshio',
    name: '日本暖流（黑潮）',
    type: 'warm',
    path: [[120, 220], [130, 200], [140, 180], [150, 170], [160, 175]],
    description: '北太平洋西部强暖流，使日本沿岸气候温暖湿润',
  },
  {
    id: 'california',
    name: '加利福尼亚寒流',
    type: 'cold',
    path: [[40, 170], [35, 190], [30, 210], [28, 230]],
    description: '北太平洋东部寒流，使北美西海岸降温减湿',
  },
  {
    id: 'gulf',
    name: '墨西哥湾暖流',
    type: 'warm',
    path: [[260, 210], [280, 195], [300, 185], [320, 190], [340, 200]],
    description: '北大西洋强暖流，使西欧气候温和湿润',
  },
  {
    id: 'benguela',
    name: '本格拉寒流',
    type: 'cold',
    path: [[270, 310], [265, 330], [260, 350], [258, 370]],
    description: '南大西洋东部寒流，使非洲西南沿岸干燥',
  },
  {
    id: 'peru',
    name: '秘鲁寒流',
    type: 'cold',
    path: [[55, 270], [50, 290], [48, 310], [50, 330], [55, 350]],
    description: '南太平洋东部寒流，使秘鲁沿岸降温减湿，与厄尔尼诺相关',
  },
  {
    id: 'north-atlantic-drift',
    name: '北大西洋暖流',
    type: 'warm',
    path: [[320, 190], [340, 180], [360, 175], [380, 180]],
    description: '墨西哥湾暖流延续，使北欧气候异常温暖',
  },
];
