import type { ClimateType } from '@/types';
import { climateTypes } from '@/data/climateData';

export interface JudgeStep {
  title: string;
  conclusion: string;
  detail: string;
}

export interface JudgeResult {
  climate: ClimateType | null;
  steps: JudgeStep[];
  confidence: number;
  candidates: { climate: ClimateType; confidence: number }[];
}

export function judgeClimate(monthlyTemps: number[], monthlyPrecips: number[]): JudgeResult {
  const steps: JudgeStep[] = [];

  const maxTemp = Math.max(...monthlyTemps);
  const minTemp = Math.min(...monthlyTemps);
  const annualPrecip = monthlyPrecips.reduce((a, b) => a + b, 0);
  const tempRange = maxTemp - minTemp;

  // Seasonal analysis
  const summerMonths = [5, 6, 7]; // JJA (June, July, August)
  const winterMonths = [11, 0, 1]; // DJF (Dec, Jan, Feb)
  const summerPrecip = summerMonths.reduce((s, m) => s + monthlyPrecips[m], 0);
  const winterPrecip = winterMonths.reduce((s, m) => s + monthlyPrecips[m], 0);
  const maxMonthlyPrecip = Math.max(...monthlyPrecips);
  const minMonthlyPrecip = Math.min(...monthlyPrecips);

  let candidates: { climate: ClimateType; confidence: number }[] = [];

  // Step 1: Temperature band
  let tempBand = '';
  if (minTemp >= 18) {
    tempBand = '热带';
    steps.push({
      title: 'Step 1: 以气温定带',
      conclusion: '热带',
      detail: `最冷月均温 ${minTemp.toFixed(1)}°C ≥ 18°C，判定为热带。热带地区全年高温，最冷月也在18°C以上。`,
    });
  } else if (minTemp >= 0) {
    tempBand = '亚热带/温带海洋';
    steps.push({
      title: 'Step 1: 以气温定带',
      conclusion: '亚热带或温带海洋性',
      detail: `最冷月均温 ${minTemp.toFixed(1)}°C 在 0-18°C 之间。若年较差小、降水均匀则为温带海洋性；否则为亚热带。`,
    });
  } else {
    tempBand = '温带/寒带';
    steps.push({
      title: 'Step 1: 以气温定带',
      conclusion: '温带或寒带',
      detail: `最冷月均温 ${minTemp.toFixed(1)}°C < 0°C，需结合最热月气温和年较差进一步判断。`,
    });
  }

  // Step 2: Precipitation pattern
  const summerWinterRatio = winterPrecip > 0 ? summerPrecip / winterPrecip : 99;
  const precipConcentration = maxMonthlyPrecip > 0 ? (maxMonthlyPrecip - minMonthlyPrecip) / annualPrecip * 12 : 0;

  let precipType = '';
  if (summerWinterRatio > 3 && summerPrecip > winterPrecip * 2) {
    precipType = '夏雨型(季风/草原)';
    steps.push({
      title: 'Step 2: 以降水定型',
      conclusion: '夏雨型',
      detail: `夏季降水 ${summerPrecip.toFixed(0)}mm 远大于冬季 ${winterPrecip.toFixed(0)}mm（比值 ${summerWinterRatio.toFixed(1)}:1），降水集中在夏季。这通常由季风环流或赤道低压带季节性移动引起。`,
    });
  } else if (winterPrecip > summerPrecip * 1.5) {
    precipType = '冬雨型(地中海)';
    steps.push({
      title: 'Step 2: 以降水定型',
      conclusion: '冬雨型（地中海型）',
      detail: `冬季降水 ${winterPrecip.toFixed(0)}mm 明显多于夏季 ${summerPrecip.toFixed(0)}mm（冬/夏比 ${(winterPrecip / summerPrecip).toFixed(1)}:1）。这是地中海气候的典型特征：夏季受副热带高压控制干燥，冬季受西风带影响多雨。`,
    });
  } else if (precipConcentration < 1.5 && annualPrecip > 400) {
    precipType = '年雨型(均匀)';
    steps.push({
      title: 'Step 2: 以降水定型',
      conclusion: '年雨型（均匀）',
      detail: `各月降水量差异小（变异系数 ${precipConcentration.toFixed(1)}），年降水量 ${annualPrecip.toFixed(0)}mm，降水季节分配均匀。这是热带雨林气候或温带海洋性气候的特征。`,
    });
  } else if (annualPrecip < 200) {
    precipType = '少雨型(干旱)';
    steps.push({
      title: 'Step 2: 以降水定型',
      conclusion: '少雨型（干旱）',
      detail: `年降水量 ${annualPrecip.toFixed(0)}mm < 200mm，全年干燥。可能是热带沙漠、温带大陆性干旱区或寒带气候。`,
    });
  } else {
    precipType = '过渡型';
    steps.push({
      title: 'Step 2: 以降水定型',
      conclusion: '过渡型',
      detail: `年降水量 ${annualPrecip.toFixed(0)}mm，季节分配特征不够典型，需综合气温和降水特征判断。`,
    });
  }

  // Step 3: Comprehensive matching with confidence scores
  if (tempBand === '热带') {
    if (annualPrecip > 2000 && minMonthlyPrecip > 60) {
      candidates.push({ climate: climateTypes.find(c => c.id === 'tropical-rainforest')!, confidence: 95 });
      candidates.push({ climate: climateTypes.find(c => c.id === 'tropical-monsoon')!, confidence: 40 });
    } else if (annualPrecip < 200) {
      candidates.push({ climate: climateTypes.find(c => c.id === 'tropical-desert')!, confidence: 90 });
    } else if (summerWinterRatio > 5 && maxMonthlyPrecip > 250) {
      candidates.push({ climate: climateTypes.find(c => c.id === 'tropical-monsoon')!, confidence: 90 });
      candidates.push({ climate: climateTypes.find(c => c.id === 'tropical-savanna')!, confidence: 50 });
    } else if (annualPrecip >= 500 && annualPrecip <= 1500) {
      candidates.push({ climate: climateTypes.find(c => c.id === 'tropical-savanna')!, confidence: 85 });
      candidates.push({ climate: climateTypes.find(c => c.id === 'tropical-monsoon')!, confidence: 40 });
    } else {
      candidates.push({ climate: climateTypes.find(c => c.id === 'tropical-savanna')!, confidence: 55 });
    }
  } else if (tempBand === '亚热带/温带海洋') {
    if (winterPrecip > summerPrecip * 1.5 && summerPrecip < 50) {
      candidates.push({ climate: climateTypes.find(c => c.id === 'mediterranean')!, confidence: 92 });
    } else if (tempRange < 15 && precipConcentration < 2 && annualPrecip >= 500 && annualPrecip <= 1000 && maxTemp < 22) {
      candidates.push({ climate: climateTypes.find(c => c.id === 'temperate-oceanic')!, confidence: 90 });
    } else if (summerWinterRatio > 2) {
      candidates.push({ climate: climateTypes.find(c => c.id === 'subtropical-monsoon')!, confidence: 90 });
      candidates.push({ climate: climateTypes.find(c => c.id === 'temperate-oceanic')!, confidence: 30 });
    } else {
      candidates.push({ climate: climateTypes.find(c => c.id === 'subtropical-monsoon')!, confidence: 55 });
    }
  } else if (tempBand === '温带/寒带') {
    if (maxTemp < 0) {
      candidates.push({ climate: climateTypes.find(c => c.id === 'ice-cap')!, confidence: 95 });
    } else if (maxTemp < 10) {
      candidates.push({ climate: climateTypes.find(c => c.id === 'tundra')!, confidence: 90 });
      candidates.push({ climate: climateTypes.find(c => c.id === 'ice-cap')!, confidence: 20 });
    } else if (maxTemp < 20 && tempRange > 30) {
      candidates.push({ climate: climateTypes.find(c => c.id === 'subarctic')!, confidence: 85 });
    } else if (annualPrecip < 400 && tempRange > 25) {
      candidates.push({ climate: climateTypes.find(c => c.id === 'temperate-continental')!, confidence: 85 });
    } else if (summerWinterRatio > 3 && annualPrecip >= 400 && annualPrecip <= 800) {
      candidates.push({ climate: climateTypes.find(c => c.id === 'temperate-monsoon')!, confidence: 88 });
    } else if (tempRange > 20 && annualPrecip < 600) {
      candidates.push({ climate: climateTypes.find(c => c.id === 'temperate-continental')!, confidence: 70 });
      candidates.push({ climate: climateTypes.find(c => c.id === 'temperate-monsoon')!, confidence: 50 });
    } else {
      candidates.push({ climate: climateTypes.find(c => c.id === 'temperate-continental')!, confidence: 55 });
    }
  }

  // Also check for highland climate
  if (tempRange < 20 && minTemp < 0 && maxTemp < 20 && annualPrecip < 1000) {
    candidates.push({ climate: climateTypes.find(c => c.id === 'highland')!, confidence: 50 });
  }

  // Sort by confidence
  candidates.sort((a, b) => b.confidence - a.confidence);

  const best = candidates.length > 0 ? candidates[0] : null;

  if (best && best.climate) {
    steps.push({
      title: 'Step 3: 综合判断',
      conclusion: best.climate.name,
      detail: `→ ${best.climate.name}（置信度 ${best.confidence}%）`,
    });

    // Add a detailed explanation step
    steps.push({
      title: 'Step 4: 成因分析',
      conclusion: '',
      detail: best.climate.description,
    });
  } else {
    steps.push({
      title: 'Step 3: 综合判断',
      conclusion: '无法确定',
      detail: '当前数据特征不够典型，请检查数据准确性或选择更典型的数据。',
    });
  }

  return {
    climate: best?.climate || null,
    steps,
    confidence: best?.confidence || 0,
    candidates: candidates.slice(0, 3),
  };
}
