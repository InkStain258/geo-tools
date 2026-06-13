/** 工具模块分类 */
export type ModuleType = 'natural' | 'atmosphere' | 'astronomy' | 'human' | 'learning';

/** 工具配置 */
export interface ToolConfig {
  id: string;
  name: string;
  module: ModuleType;
  description: string;
  icon: string;
  path: string;
  priority: number;
}

/** 月度气候数据 */
export interface MonthlyData {
  month: number;
  temp: number;
  precip: number;
}

/** 气候类型 */
export interface ClimateType {
  id: string;
  name: string;
  nameEn: string;
  tempRange: [number, number];
  precipRange: [number, number];
  precipPattern: 'uniform' | 'summer' | 'winter' | 'dry';
  annualPrecipRange: [number, number];
  description: string;
  judgeRules: string[];
}

/** 完整气候数据 */
export interface ClimateData {
  climateId: string;
  monthlyTemps: number[];
  monthlyPrecips: number[];
}

/** 太阳位置 */
export interface SunPosition {
  declination: number;
  hourAngle: number;
  altitude: number;
}

/** 时区计算 */
export interface TimezoneCalc {
  sourceLng: number;
  sourceTime: string;
  targetLng: number;
  resultTime: string;
  timeDiff: number;
}

/** 区位因素 */
export interface LocationFactor {
  name: string;
  weight: number;
  description: string;
}

/** 地形预设 */
export interface TerrainPreset {
  id: string;
  name: string;
  contours: number[][];
  peakX: number;
  peakY: number;
  peakHeight: number;
  description: string;
}

/** 河流流域 */
export interface RiverBasin {
  id: string;
  name: string;
  area: number;
  length: number;
  seasonalFlow: number[];
  description: string;
}

/** 洋流 */
export interface OceanCurrent {
  id: string;
  name: string;
  type: 'warm' | 'cold';
  path: [number, number][];
  description: string;
}

/** 工业类型 */
export interface IndustryType {
  id: string;
  name: string;
  orientation: string;
  factors: LocationFactor[];
}

/** 农业类型 */
export interface AgricultureType {
  id: string;
  name: string;
  naturalFactors: LocationFactor[];
  humanFactors: LocationFactor[];
}

/** 公式条目 */
export interface FormulaItem {
  id: string;
  category: string;
  name: string;
  formula: string;
  description: string;
  example?: string;
  params?: FormulaParam[];
}

/** 公式参数 */
export interface FormulaParam {
  name: string;
  label: string;
  defaultValue: number;
  min: number;
  max: number;
  unit: string;
}

/** 动画控制状态 */
export interface AnimationState {
  playing: boolean;
  speed: number;
  progress: number;
}

/** 剖面线端点 */
export interface ProfilePoint {
  x: number;
  y: number;
}

/** 锋面类型 */
export type FrontType = 'cold' | 'warm' | 'stationary';
