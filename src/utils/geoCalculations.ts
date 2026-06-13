/**
 * 地理计算工具函数
 * 包含太阳直射点、昼夜长短、正午太阳高度角、地方时/区时等计算
 */

/** 计算太阳直射点纬度（根据日期） */
export function calcDeclination(dayOfYear: number): number {
  // δ = 23.5° × sin[(d-81)×360/365]
  const rad = ((dayOfYear - 81) * 360) / 365 * (Math.PI / 180);
  return 23.5 * Math.sin(rad);
}

/** 计算某日是一年中的第几天 */
export function getDayOfYear(month: number, day: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let total = 0;
  for (let i = 0; i < month - 1; i++) {
    total += daysInMonth[i];
  }
  return total + day;
}

/** 计算昼夜长短 */
export function calcDayLength(latitude: number, declination: number): number {
  // 昼长 = 2/15 × arccos(-tanφ × tanδ) (小时)
  const latRad = latitude * (Math.PI / 180);
  const declRad = declination * (Math.PI / 180);
  const cosHourAngle = -Math.tan(latRad) * Math.tan(declRad);

  // 极昼或极夜判断
  if (cosHourAngle <= -1) return 24; // 极昼
  if (cosHourAngle >= 1) return 0;   // 极夜

  const hourAngle = Math.acos(cosHourAngle);
  return (2 * hourAngle * 180) / (Math.PI * 15);
}

/** 计算正午太阳高度角 */
export function calcSunAltitude(latitude: number, declination: number): number {
  // H = 90° - |φ - δ|
  return 90 - Math.abs(latitude - declination);
}

/** 计算地方时 */
export function calcLocalTime(
  sourceLng: number,
  sourceHour: number,
  sourceMinute: number,
  targetLng: number,
): { hour: number; minute: number } {
  const lngDiff = targetLng - sourceLng;
  const timeDiffMin = lngDiff * 4; // 每度4分钟
  let totalMin = sourceHour * 60 + sourceMinute + timeDiffMin;

  // 标准化到 0-1440 分钟
  while (totalMin < 0) totalMin += 1440;
  while (totalMin >= 1440) totalMin -= 1440;

  return {
    hour: Math.floor(totalMin / 60),
    minute: Math.round(totalMin % 60),
  };
}

/** 计算区时 */
export function calcZoneTime(
  sourceZone: number,
  sourceHour: number,
  sourceMinute: number,
  targetZone: number,
): { hour: number; minute: number } {
  const zoneDiff = targetZone - sourceZone;
  let totalMin = sourceHour * 60 + sourceMinute + zoneDiff * 60;

  while (totalMin < 0) totalMin += 1440;
  while (totalMin >= 1440) totalMin -= 1440;

  return {
    hour: Math.floor(totalMin / 60),
    minute: Math.round(totalMin % 60),
  };
}

/** 经度转时区号 */
export function lngToTimezone(lng: number): number {
  return Math.round(lng / 15);
}

/** 计算晨昏线位置（纬度） */
export function calcTerminatorLatitude(declination: number): number {
  // 晨昏线与极圈相切的纬度
  return 90 - Math.abs(declination);
}

/** 计算两点间经纬度距离（km） */
export function calcDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** 坡度计算 */
export function calcSlope(heightDiff: number, horizDistance: number): number {
  return Math.atan(heightDiff / horizDistance) * (180 / Math.PI);
}

/** 人口密度计算 */
export function calcPopDensity(population: number, area: number): number {
  if (area === 0) return 0;
  return population / area;
}
