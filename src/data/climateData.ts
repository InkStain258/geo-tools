import type { ClimateType } from '@/types';

/** 13种主要气候类型（覆盖高中地理全部考点） */
export const climateTypes: ClimateType[] = [
  // ===== 热带（最冷月 ≥ 15°C）=====
  {
    id: 'tropical-rainforest',
    name: '热带雨林气候',
    nameEn: 'Tropical Rainforest',
    tempRange: [24, 28],
    precipRange: [60, 300],
    precipPattern: 'uniform',
    annualPrecipRange: [2000, 4000],
    description: '全年高温多雨，年均温25°C以上，年降水量>2000mm，各月降水均匀。分布：赤道两侧（亚马孙平原、刚果盆地、马来群岛）。成因：常年受赤道低压控制，盛行上升气流。',
    judgeRules: [
      '最冷月均温 ≥ 20°C → 热带',
      '年降水量 > 2000mm → 多雨',
      '各月降水量均 > 60mm，降水均匀 → 雨林型',
    ],
  },
  {
    id: 'tropical-savanna',
    name: '热带草原气候',
    nameEn: 'Tropical Savanna',
    tempRange: [20, 30],
    precipRange: [0, 400],
    precipPattern: 'summer',
    annualPrecipRange: [500, 1500],
    description: '全年高温，干湿季分明（夏雨冬干）。年均温20°C以上，年降水量500-1500mm。分布：非洲中部、巴西高原、澳大利亚北部。成因：赤道低压与信风交替控制。',
    judgeRules: [
      '最冷月均温 ≥ 20°C → 热带',
      '年降水量 500-1500mm → 过渡型',
      '干湿季分明，夏季（所在半球）多雨、冬季干燥 → 草原型',
    ],
  },
  {
    id: 'tropical-desert',
    name: '热带沙漠气候',
    nameEn: 'Tropical Desert',
    tempRange: [13, 38],
    precipRange: [0, 30],
    precipPattern: 'dry',
    annualPrecipRange: [0, 200],
    description: '全年高温、极端干燥。年降水量<200mm（部分地区<50mm），昼夜温差大（可达30°C+）。分布：撒哈拉、阿拉伯、澳大利亚中西部。成因：常年受副热带高压或信风控制。',
    judgeRules: [
      '最冷月均温 ≥ 15°C → 热带',
      '年降水量 < 200mm（极低） → 干旱',
      '各月极少或无降水 → 沙漠型',
    ],
  },
  {
    id: 'tropical-monsoon',
    name: '热带季风气候',
    nameEn: 'Tropical Monsoon',
    tempRange: [18, 32],
    precipRange: [5, 500],
    precipPattern: 'summer',
    annualPrecipRange: [1500, 3000],
    description: '全年高温，降水集中在夏季（6-9月），雨季降水量极大（月降水量可>500mm），旱季明显。分布：印度半岛、中南半岛、菲律宾。成因：海陆热力性质差异 + 气压带风带季节移动。',
    judgeRules: [
      '最冷月均温 ≥ 18°C → 热带',
      '年降水量 > 1500mm，雨季降水极为集中',
      '旱雨季分明，夏季降水量占全年80%以上 → 季风型',
    ],
  },

  // ===== 亚热带（最冷月 0-15°C）=====
  {
    id: 'subtropical-monsoon',
    name: '亚热带季风气候',
    nameEn: 'Subtropical Monsoon',
    tempRange: [2, 30],
    precipRange: [30, 250],
    precipPattern: 'summer',
    annualPrecipRange: [800, 1600],
    description: '夏季高温多雨（受夏季风影响），冬季温和少雨（受冬季风影响）。最冷月0-15°C。分布：我国秦岭—淮河以南、日本南部、美国东南部。成因：海陆热力性质差异。',
    judgeRules: [
      '最冷月均温 0-15°C → 亚热带',
      '夏季（6-8月）降水量大，冬季（12-2月）少 → 季风型',
      '年降水量 800-1600mm',
    ],
  },
  {
    id: 'mediterranean',
    name: '地中海气候',
    nameEn: 'Mediterranean',
    tempRange: [5, 28],
    precipRange: [15, 120],
    precipPattern: 'winter',
    annualPrecipRange: [300, 1000],
    description: '夏季炎热干燥（副高控制），冬季温和多雨（西风控制）。分布：地中海沿岸（30°-40°大陆西岸）及加州、智利中部、澳洲西南等。成因：副热带高压与西风带交替控制。',
    judgeRules: [
      '最冷月均温 0-15°C → 亚热带',
      '夏季降水极少，冬季降水较多 → 冬雨型（地中海型）',
      '年降水量 300-1000mm，且夏季干燥特征明显',
    ],
  },

  // ===== 温带（最冷月 < 0°C 或温和海洋性）=====
  {
    id: 'temperate-monsoon',
    name: '温带季风气候',
    nameEn: 'Temperate Monsoon',
    tempRange: [-15, 28],
    precipRange: [3, 200],
    precipPattern: 'summer',
    annualPrecipRange: [400, 800],
    description: '夏季高温多雨，冬季寒冷干燥。最冷月<0°C，四季分明。分布：我国华北/东北、朝鲜半岛、日本北部、俄罗斯远东。成因：海陆热力性质差异（季风环流）。',
    judgeRules: [
      '最冷月均温 < 0°C → 温带',
      '夏季降水多、冬季降水极少 → 季风型',
      '年降水量 400-800mm，集中在7-8月',
    ],
  },
  {
    id: 'temperate-oceanic',
    name: '温带海洋性气候',
    nameEn: 'Temperate Oceanic',
    tempRange: [2, 20],
    precipRange: [40, 80],
    precipPattern: 'uniform',
    annualPrecipRange: [500, 1000],
    description: '全年温和湿润，气温年较差小（约10-15°C），最冷月>0°C，最热月<22°C。各月降水均匀。分布：西欧（40°-60°大陆西岸）、北美西北部、新西兰。成因：终年受盛行西风控制。',
    judgeRules: [
      '最冷月均温 0-15°C → 温和',
      '最热月均温 < 22°C → 夏季凉爽',
      '各月降水量差异小（月降水变异系数小） → 海洋性均匀型',
    ],
  },
  {
    id: 'temperate-continental',
    name: '温带大陆性气候',
    nameEn: 'Temperate Continental',
    tempRange: [-25, 30],
    precipRange: [5, 100],
    precipPattern: 'summer',
    annualPrecipRange: [200, 600],
    description: '冬冷夏热，气温年较差大（>20°C），降水少且集中在夏季。最冷月<0°C。分布：中亚、蒙古、我国西北内陆、北美内陆。成因：深居内陆，远离海洋，海洋水汽难以到达。',
    judgeRules: [
      '最冷月均温 < 0°C → 温带',
      '气温年较差大（>20°C）',
      '年降水量 200-600mm，集中在夏季 → 大陆性',
    ],
  },

  // ===== 亚寒带与寒带 =====
  {
    id: 'subarctic',
    name: '亚寒带针叶林气候',
    nameEn: 'Subarctic (Taiga)',
    tempRange: [-30, 20],
    precipRange: [10, 80],
    precipPattern: 'summer',
    annualPrecipRange: [200, 500],
    description: '冬季漫长严寒（<-20°C），夏季短促凉爽（<20°C），降水少但蒸发弱（湿润）。分布：俄罗斯西伯利亚、加拿大北部、阿拉斯加。成因：纬度高，太阳辐射弱。',
    judgeRules: [
      '最冷月均温 < 0°C → 温带/寒带',
      '最热月均温 10-20°C → 亚寒带',
      '气温年较差极大（>30°C）',
    ],
  },
  {
    id: 'tundra',
    name: '寒带苔原气候',
    nameEn: 'Tundra',
    tempRange: [-35, 10],
    precipRange: [5, 40],
    precipPattern: 'summer',
    annualPrecipRange: [100, 300],
    description: '全年严寒，最热月0-10°C，仅地衣苔藓生长。分布：北冰洋沿岸、格陵兰沿海。成因：纬度高，太阳辐射极弱。有极昼极夜现象。',
    judgeRules: [
      '最热月均温 0-10°C → 苔原型',
      '全年气温极低，无真正的夏季',
      '年降水量 < 300mm',
    ],
  },
  {
    id: 'ice-cap',
    name: '寒带冰原气候',
    nameEn: 'Ice Cap',
    tempRange: [-50, 0],
    precipRange: [0, 10],
    precipPattern: 'dry',
    annualPrecipRange: [0, 200],
    description: '全年极端严寒，最热月<0°C，终年冰雪覆盖。分布：南极洲、格陵兰内陆。成因：极地高压控制，太阳辐射极弱。',
    judgeRules: [
      '最热月均温 < 0°C → 冰原型',
      '全年各月气温均在冰点以下',
      '降水极少，终年冰雪',
    ],
  },
  {
    id: 'highland',
    name: '高原山地气候',
    nameEn: 'Highland',
    tempRange: [-15, 25],
    precipRange: [0, 200],
    precipPattern: 'summer',
    annualPrecipRange: [200, 1500],
    description: '气温随海拔升高而降低（垂直变化），降水随海拔和坡向变化大。分布：青藏高原、安第斯山、阿尔卑斯山。成因：海拔高度引起的水热条件垂直分异。',
    judgeRules: [
      '气温年较差相对较小',
      '昼夜温差大',
      '降水量和气温在垂直方向上变化大（需结合海拔判断）',
    ],
  },
];

/** 示例气候数据（以著名城市/区域为代表） */
export const exampleClimateData = {
  'tropical-rainforest': {
    label: '新加坡 (热带雨林)',
    temps: [26.1, 26.6, 27.1, 27.4, 27.4, 27.3, 27.0, 26.9, 26.9, 27.1, 26.8, 26.3],
    precips: [234, 160, 185, 178, 172, 162, 158, 175, 170, 197, 254, 269],
  },
  'tropical-savanna': {
    label: '巴马科(马里) (热带草原)',
    temps: [25.0, 27.5, 29.5, 30.5, 29.0, 27.0, 26.0, 26.0, 26.5, 28.0, 27.0, 25.0],
    precips: [0, 2, 10, 30, 80, 130, 200, 280, 170, 50, 5, 0],
  },
  'tropical-desert': {
    label: '利雅得(沙特) (热带沙漠)',
    temps: [14.4, 16.4, 21.0, 26.3, 31.8, 34.3, 35.8, 35.4, 32.4, 27.4, 20.9, 16.0],
    precips: [12, 8, 22, 24, 5, 0, 0, 0, 0, 2, 6, 11],
  },
  'tropical-monsoon': {
    label: '孟买(印度) (热带季风)',
    temps: [24.4, 24.9, 26.9, 28.7, 30.1, 29.0, 27.3, 27.0, 27.3, 28.4, 27.3, 25.6],
    precips: [1, 2, 0, 1, 18, 485, 617, 340, 264, 64, 13, 2],
  },
  'subtropical-monsoon': {
    label: '上海 (亚热带季风)',
    temps: [4.3, 5.6, 9.7, 15.8, 21.1, 24.8, 28.5, 27.9, 24.0, 18.5, 12.6, 6.7],
    precips: [55, 65, 95, 105, 118, 185, 145, 140, 120, 65, 55, 40],
  },
  'mediterranean': {
    label: '罗马(意大利) (地中海)',
    temps: [7.5, 8.7, 11.2, 14.0, 18.0, 21.9, 24.7, 24.5, 21.2, 17.0, 12.0, 8.7],
    precips: [80, 73, 65, 55, 40, 22, 8, 18, 65, 105, 113, 92],
  },
  'temperate-monsoon': {
    label: '北京 (温带季风)',
    temps: [-3.7, -1.0, 6.1, 14.4, 20.4, 24.8, 26.6, 25.1, 20.1, 13.1, 4.6, -1.5],
    precips: [3, 5, 9, 21, 34, 78, 185, 160, 46, 22, 7, 2],
  },
  'temperate-oceanic': {
    label: '伦敦(英国) (温带海洋)',
    temps: [5.0, 5.0, 7.2, 9.4, 12.8, 16.1, 18.3, 17.8, 15.0, 11.7, 7.8, 5.6],
    precips: [55, 40, 42, 44, 49, 45, 48, 52, 50, 59, 59, 55],
  },
  'temperate-continental': {
    label: '乌鲁木齐 (温带大陆)',
    temps: [-12.2, -9.6, -0.8, 11.0, 18.4, 23.9, 25.8, 24.3, 18.0, 8.7, -1.9, -10.1],
    precips: [8, 10, 18, 30, 38, 36, 26, 23, 26, 18, 14, 10],
  },
  'subarctic': {
    label: '雅库茨克(俄) (亚寒带针叶林)',
    temps: [-38.6, -33.8, -20.1, -5.4, 7.5, 16.0, 19.5, 15.2, 6.2, -8.0, -27.0, -37.0],
    precips: [9, 7, 6, 10, 18, 37, 39, 36, 29, 18, 15, 12],
  },
  'tundra': {
    label: '巴罗(阿拉斯加) (苔原)',
    temps: [-25.6, -26.7, -24.4, -16.7, -6.7, 1.7, 4.4, 3.3, -1.1, -9.4, -18.3, -23.9],
    precips: [5, 4, 4, 3, 5, 8, 24, 25, 15, 12, 7, 5],
  },
  'ice-cap': {
    label: '东方站(南极) (冰原)',
    temps: [-32.1, -44.3, -57.9, -64.7, -65.6, -65.2, -66.9, -67.6, -66.0, -57.1, -42.6, -31.5],
    precips: [2, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 2],
  },
  'highland': {
    label: '拉萨 (高原山地)',
    temps: [-1.7, 1.0, 5.0, 8.9, 13.1, 16.8, 16.5, 15.6, 13.4, 8.5, 2.6, -1.1],
    precips: [1, 1, 2, 5, 23, 65, 119, 118, 56, 6, 1, 1],
  },
  // 新增5个示例城市（高考常见案例）
  'sydney': {
    label: '悉尼(澳大利亚) (亚热带湿润)',
    temps: [23.0, 22.9, 21.6, 19.2, 15.8, 13.2, 12.4, 13.7, 16.0, 18.3, 20.1, 22.0],
    precips: [102, 118, 130, 126, 121, 131, 98, 81, 69, 77, 84, 77],
  },
  'capetown': {
    label: '开普敦(南非) (地中海)',
    temps: [21.3, 21.6, 20.1, 17.4, 14.8, 12.8, 12.2, 12.9, 14.3, 16.7, 18.6, 20.1],
    precips: [15, 17, 20, 41, 69, 93, 82, 77, 40, 30, 14, 17],
  },
  'moscow': {
    label: '莫斯科(俄罗斯) (温带大陆性)',
    temps: [-6.5, -6.7, -1.0, 6.7, 13.2, 17.0, 19.2, 17.0, 11.3, 5.6, -1.2, -5.2],
    precips: [52, 47, 42, 38, 50, 75, 85, 82, 68, 71, 58, 52],
  },
  'irkutsk': {
    label: '伊尔库茨克(俄罗斯) (亚寒带大陆性)',
    temps: [-17.9, -14.6, -6.5, 3.0, 10.4, 15.9, 18.5, 15.7, 9.1, 1.4, -7.9, -15.4],
    precips: [12, 9, 12, 24, 40, 70, 119, 90, 52, 21, 18, 15],
  },
  'reykjavik': {
    label: '雷克雅未克(冰岛) (寒带苔原/亚寒带海洋)',
    temps: [-0.5, 0.4, 0.5, 2.9, 6.3, 9.0, 10.6, 10.0, 7.2, 4.1, 1.3, 0.0],
    precips: [76, 72, 78, 58, 44, 50, 51, 67, 74, 80, 77, 80],
  },
};
