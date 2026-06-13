import type { ClimateType } from '@/types';
import { climateTypes } from '@/data/climateData';

/** 判断推理步骤 */
export interface JudgeStep {
  title: string;
  conclusion: string;
  detail: string;
}

/** 判断结果 */
export interface JudgeResult {
  climate: ClimateType | null;
  steps: JudgeStep[];
  confidence: number;
}

/**
 * 气候类型判断
 * 以气温定带 → 以降水定型
 */
export function judgeClimate(monthlyTemps: number[], monthlyPrecips: number[]): JudgeResult {
  const steps: JudgeStep[] = [];

  // 基本统计
  const maxTemp = Math.max(...monthlyTemps);
  const minTemp = Math.min(...monthlyTemps);
  const annualPrecip = monthlyPrecips.reduce((a, b) => a + b, 0);
  const summerPrecip = monthlyPrecips.slice(5, 9).reduce((a, b) => a + b, 0);
  const winterPrecip = monthlyPrecips.slice(10, 12).reduce((a, b) => a + b, 0) + monthlyPrecips[0];
  const maxMonthlyPrecip = Math.max(...monthlyPrecips);
  const minMonthlyPrecip = Math.min(...monthlyPrecips);
  const tempRange = maxTemp - minTemp;

  // Step 1: 以气温定带（地理学界一般以18°C等温线划分热带）
  let tempBand = '';
  if (minTemp >= 18) {
    tempBand = '热带';
    steps.push({
      title: 'Step 1: 以气温定带',
      conclusion: '热带',
      detail: `最冷月均温 ${minTemp.toFixed(1)}°C ≥ 18°C，判定为热带`,
    });
  } else if (minTemp > 0) {
    tempBand = '亚热带';
    steps.push({
      title: 'Step 1: 以气温定带',
      conclusion: '亚热带/温带海洋性',
      detail: `最冷月均温 ${minTemp.toFixed(1)}°C 在 0-18°C 之间，判定为亚热带或温带`,
    });
  } else {
    tempBand = '温带';
    steps.push({
      title: 'Step 1: 以气温定带',
      conclusion: '温带',
      detail: `最冷月均温 ${minTemp.toFixed(1)}°C < 0°C，判定为温带`,
    });
  }

  // Step 2: 以降水定型
  let precipType = '';
  if (annualPrecip < 200) {
    precipType = '干旱';
    steps.push({
      title: 'Step 2: 以降水定型',
      conclusion: '干旱型',
      detail: `年降水量 ${annualPrecip.toFixed(0)}mm < 200mm，判定为干旱型`,
    });
  } else if (summerPrecip > winterPrecip * 2) {
    // 季风型：夏半年降水远大于冬半年（区分热带/亚热带季风不再要求月峰>300mm）
    precipType = '季风';
    steps.push({
      title: 'Step 2: 以降水定型',
      conclusion: '季风型',
      detail: `夏半年降水 ${summerPrecip.toFixed(0)}mm 远大于冬半年 ${winterPrecip.toFixed(0)}mm（>2倍），判定为季风型`,
    });
  } else if (tempBand !== '热带' && tempRange <= 15 && annualPrecip >= 500 && annualPrecip <= 1500) {
    // 海洋性：排除热带（热带不可能有海洋性气候），放宽年较差阈值至15°C
    precipType = '海洋性';
    steps.push({
      title: 'Step 2: 以降水定型',
      conclusion: '海洋性',
      detail: `气温年较差 ${tempRange.toFixed(1)}°C 较小（≤15°C），年降水量 ${annualPrecip.toFixed(0)}mm 适中且各月均匀，判定为海洋性`,
    });
  } else if (annualPrecip > 2000 && minMonthlyPrecip > 60) {
    precipType = '雨林';
    steps.push({
      title: 'Step 2: 以降水定型',
      conclusion: '雨林型',
      detail: `年降水量 ${annualPrecip.toFixed(0)}mm > 2000mm，且最干月降水 ${minMonthlyPrecip.toFixed(0)}mm > 60mm，判定为雨林型`,
    });
  } else if (summerPrecip > winterPrecip * 1.5 && maxMonthlyPrecip < 300) {
    precipType = '草原';
    steps.push({
      title: 'Step 2: 以降水定型',
      conclusion: '草原型',
      detail: `干湿季分明但月最大降水 ${maxMonthlyPrecip.toFixed(0)}mm < 300mm，判定为草原型`,
    });
  } else {
    precipType = '过渡';
    steps.push({
      title: 'Step 2: 以降水定型',
      conclusion: '过渡型',
      detail: `降水特征不够典型，需综合判断`,
    });
  }

  // Step 3: 综合判断
  let matchedClimate: ClimateType | null = null;
  let confidence = 0;

  if (tempBand === '热带' && precipType === '雨林') {
    matchedClimate = climateTypes.find((c) => c.id === 'tropical-rainforest') || null;
    confidence = 95;
  } else if (tempBand === '热带' && precipType === '草原') {
    matchedClimate = climateTypes.find((c) => c.id === 'tropical-savanna') || null;
    confidence = 85;
  } else if (tempBand === '热带' && precipType === '干旱') {
    matchedClimate = climateTypes.find((c) => c.id === 'tropical-desert') || null;
    confidence = 90;
  } else if (tempBand === '热带' && precipType === '季风') {
    matchedClimate = climateTypes.find((c) => c.id === 'tropical-monsoon') || null;
    confidence = 85;
  } else if (tempBand === '亚热带' && precipType === '季风') {
    matchedClimate = climateTypes.find((c) => c.id === 'subtropical-monsoon') || null;
    confidence = 90;
  } else if ((tempBand === '亚热带' || tempBand === '温带') && precipType === '海洋性') {
    matchedClimate = climateTypes.find((c) => c.id === 'temperate-oceanic') || null;
    confidence = 85;
  } else if (tempBand === '热带' && precipType === '过渡') {
    // 尝试更精细判断
    if (annualPrecip > 1500 && summerPrecip > winterPrecip * 2) {
      matchedClimate = climateTypes.find((c) => c.id === 'tropical-monsoon') || null;
      confidence = 65;
    } else if (annualPrecip > 1500) {
      matchedClimate = climateTypes.find((c) => c.id === 'tropical-rainforest') || null;
      confidence = 60;
    } else {
      matchedClimate = climateTypes.find((c) => c.id === 'tropical-savanna') || null;
      confidence = 55;
    }
  } else if (tempBand === '亚热带' && precipType === '过渡') {
    // 亚热带过渡型：尝试按季风判断
    if (summerPrecip > winterPrecip * 1.5) {
      matchedClimate = climateTypes.find((c) => c.id === 'subtropical-monsoon') || null;
      confidence = 60;
    }
  }

  if (matchedClimate) {
    steps.push({
      title: 'Step 3: 综合判断',
      conclusion: matchedClimate.name,
      detail: `${tempBand} + ${precipType} → ${matchedClimate.name}（置信度 ${confidence}%）`,
    });
  } else {
    steps.push({
      title: 'Step 3: 综合判断',
      conclusion: '无法确定',
      detail: '当前数据特征不够典型，无法精确判断气候类型',
    });
    confidence = 0;
  }

  return { climate: matchedClimate, steps, confidence };
}
