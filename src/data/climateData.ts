import type { ClimateType } from '@/types';

/** 6种高频气候类型判断数据 */
export const climateTypes: ClimateType[] = [
  {
    id: 'tropical-rainforest',
    name: '热带雨林气候',
    nameEn: 'Tropical Rainforest',
    tempRange: [24, 28],
    precipRange: [60, 300],
    precipPattern: 'uniform',
    annualPrecipRange: [2000, 4000],
    description: '全年高温多雨，各月气温均在24°C以上，年降水量超过2000mm',
    judgeRules: [
      '最冷月均温 > 20°C → 热带',
      '年降水量 > 2000mm → 多雨',
      '各月降水较均匀 → 雨林型',
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
    description: '全年高温，干湿季分明，夏季多雨，冬季少雨',
    judgeRules: [
      '最冷月均温 > 20°C → 热带',
      '年降水量 500-1500mm → 过渡',
      '干湿季分明，夏季多雨 → 草原型',
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
    description: '全年高温少雨，年降水量不足200mm，昼夜温差大',
    judgeRules: [
      '最冷月均温 > 15°C → 热带',
      '年降水量 < 200mm → 干旱',
      '各月极少降水 → 沙漠型',
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
    description: '全年高温，雨季集中夏季，降水集中在6-9月，年降水量大',
    judgeRules: [
      '最冷月均温 > 15°C → 热带',
      '年降水量 > 1500mm → 多雨',
      '雨季集中6-9月，月降水可达300mm以上 → 季风型',
    ],
  },
  {
    id: 'subtropical-monsoon',
    name: '亚热带季风气候',
    nameEn: 'Subtropical Monsoon',
    tempRange: [2, 30],
    precipRange: [30, 250],
    precipPattern: 'summer',
    annualPrecipRange: [800, 1600],
    description: '夏季高温多雨，冬季温和少雨，最冷月均温0-15°C',
    judgeRules: [
      '最冷月均温 0-15°C → 亚热带',
      '夏季多雨冬季少雨 → 季风型',
      '年降水量 800-1600mm',
    ],
  },
  {
    id: 'temperate-oceanic',
    name: '温带海洋性气候',
    nameEn: 'Temperate Oceanic',
    tempRange: [0, 20],
    precipRange: [40, 80],
    precipPattern: 'uniform',
    annualPrecipRange: [500, 1000],
    description: '全年温和湿润，气温年较差小，各月降水均匀',
    judgeRules: [
      '最冷月均温 0-15°C → 温带/亚热带',
      '最热月均温 < 22°C → 温带',
      '各月降水均匀，年较差小 → 海洋性',
    ],
  },
];

/** 示例气候数据（热带雨林 - 新加坡） */
export const exampleClimateData = {
  'tropical-rainforest': {
    temps: [26, 27, 27, 27, 27, 27, 27, 27, 27, 27, 26, 26],
    precips: [234, 160, 185, 178, 172, 162, 158, 175, 170, 197, 254, 269],
  },
  'tropical-savanna': {
    temps: [25, 27, 29, 30, 29, 27, 26, 26, 27, 28, 27, 25],
    precips: [0, 2, 10, 30, 80, 130, 200, 280, 170, 50, 5, 0],
  },
  'tropical-desert': {
    temps: [14, 16, 20, 24, 29, 33, 35, 34, 30, 25, 19, 15],
    precips: [5, 3, 3, 1, 0, 0, 0, 0, 1, 3, 4, 5],
  },
  'tropical-monsoon': {
    temps: [20, 23, 27, 30, 32, 31, 29, 29, 29, 27, 23, 20],
    precips: [10, 15, 20, 40, 120, 350, 450, 400, 280, 80, 20, 5],
  },
  'subtropical-monsoon': {
    temps: [4, 5, 10, 16, 21, 25, 29, 28, 24, 18, 12, 6],
    precips: [50, 60, 90, 110, 130, 180, 150, 140, 120, 70, 55, 45],
  },
  'temperate-oceanic': {
    temps: [5, 5, 7, 9, 12, 15, 17, 17, 14, 11, 7, 5],
    precips: [60, 50, 55, 50, 55, 55, 60, 65, 60, 65, 65, 65],
  },
};
