import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend,
} from 'chart.js';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { riverBasins } from '@/data/terrainPresets';
import { getCanvasCoords } from '@/utils/canvasHelper';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const CANVAS_W = 600;
const CANVAS_H = 450;

// ──────────────────────────────────────
// Geographic data: simplified continent outlines, basin boundaries,
// river courses, tributaries, and city markers for each river
// ──────────────────────────────────────

interface RiverGeoData {
  continentOutline: [number, number][];
  oceanRect: [number, number, number, number]; // x, y, w, h – the ocean area bounding box
  landColor: string;
  oceanColor: string;
  basinBoundary: [number, number][];
  riverCourse: [number, number][];
  tributaries: { name: string; path: [number, number][]; side: 'left' | 'right' }[];
  cities: { name: string; x: number; y: number }[];
  source: [number, number];
  mouth: [number, number];
  flowLabel: string;
}

const geoData: Record<string, RiverGeoData> = {
  // ── Yangtze (长江) – East Asia ──────────────────────────
  yangtze: {
    continentOutline: [
      [380, 30], [430, 55], [465, 85], [455, 135],
      [478, 175], [485, 225], [465, 285], [435, 325],
      [375, 365], [305, 375], [225, 345], [155, 315],
      [85, 265], [35, 185], [25, 105], [65, 55],
      [155, 35], [255, 25], [380, 30],
    ],
    oceanRect: [350, 40, 260, 370],
    landColor: '#C8E6C9',
    oceanColor: '#B3E5FC',
    basinBoundary: [
      [32, 205], [78, 185], [115, 222], [175, 258],
      [215, 235], [275, 242], [335, 218], [375, 198],
      [415, 205], [445, 198], [472, 188], [478, 200],
      [460, 248], [418, 278], [358, 288], [298, 298],
      [198, 315], [115, 278], [58, 248], [32, 205],
    ],
    riverCourse: [
      [38, 200], [75, 188], [108, 212], [155, 245],
      [195, 232], [238, 228], [268, 235], [305, 218],
      [345, 202], [378, 198], [412, 202], [438, 198],
      [462, 192], [475, 192],
    ],
    tributaries: [
      { name: '雅砻江', path: [[60, 240], [100, 232], [155, 245]], side: 'left' },
      { name: '岷江', path: [[160, 215], [180, 225], [195, 232]], side: 'left' },
      { name: '嘉陵江', path: [[220, 210], [245, 222], [268, 235]], side: 'right' },
      { name: '汉江', path: [[320, 198], [350, 200], [378, 198]], side: 'right' },
      { name: '湘江', path: [[340, 268], [365, 245], [378, 198]], side: 'left' },
      { name: '赣江', path: [[395, 248], [410, 228], [412, 202]], side: 'left' },
    ],
    cities: [
      { name: '重庆', x: 268, y: 235 },
      { name: '武汉', x: 378, y: 198 },
      { name: '南京', x: 438, y: 198 },
      { name: '上海', x: 475, y: 192 },
      { name: '宜昌', x: 345, y: 202 },
      { name: '宜宾', x: 195, y: 232 },
    ],
    source: [38, 200],
    mouth: [475, 192],
    flowLabel: '西 → 东',
  },

  // ── Yellow River (黄河) – East Asia ──────────────────────
  yellow: {
    continentOutline: [
      [380, 30], [430, 55], [465, 85], [455, 135],
      [478, 175], [485, 225], [465, 285], [435, 325],
      [375, 365], [305, 375], [225, 345], [155, 315],
      [85, 265], [35, 185], [25, 105], [65, 55],
      [155, 35], [255, 25], [380, 30],
    ],
    oceanRect: [350, 40, 260, 370],
    landColor: '#C8E6C9',
    oceanColor: '#B3E5FC',
    basinBoundary: [
      [42, 108], [75, 88], [125, 72], [175, 62],
      [215, 48], [225, 38], [268, 52], [312, 80],
      [328, 112], [338, 148], [352, 168], [372, 178],
      [402, 188], [428, 192], [458, 185],
      [445, 235], [398, 228], [358, 218], [318, 205],
      [278, 172], [178, 152], [98, 162], [58, 142],
      [42, 108],
    ],
    riverCourse: [
      [45, 102], [82, 82], [132, 68], [182, 58],
      [218, 46], [220, 42], [262, 52], [302, 78],
      [320, 110], [335, 145], [348, 165], [368, 175],
      [388, 182], [412, 188], [435, 190], [455, 182],
    ],
    tributaries: [
      { name: '洮河', path: [[75, 130], [100, 108], [132, 68]], side: 'left' },
      { name: '渭河', path: [[240, 155], [290, 165], [335, 145]], side: 'right' },
      { name: '汾河', path: [[310, 115], [325, 130], [335, 145]], side: 'right' },
    ],
    cities: [
      { name: '兰州', x: 132, y: 68 },
      { name: '银川', x: 182, y: 58 },
      { name: '郑州', x: 388, y: 182 },
      { name: '济南', x: 435, y: 190 },
      { name: '西安', x: 290, y: 165 },
      { name: '洛阳', x: 368, y: 175 },
    ],
    source: [45, 102],
    mouth: [455, 182],
    flowLabel: '西 → 东 (几字弯)',
  },

  // ── Pearl River (珠江) – Southern China ─────────────────
  pearl: {
    continentOutline: [
      [380, 30], [430, 55], [465, 85], [455, 135],
      [478, 175], [485, 225], [465, 285], [435, 325],
      [375, 365], [305, 375], [225, 345], [155, 315],
      [85, 265], [35, 185], [25, 105], [65, 55],
      [155, 35], [255, 25], [380, 30],
    ],
    oceanRect: [350, 40, 260, 370],
    landColor: '#A5D6A7',
    oceanColor: '#81D4FA',
    basinBoundary: [
      [100, 240], [160, 218], [210, 225], [260, 235],
      [310, 245], [350, 258], [390, 278], [430, 305],
      [460, 332], [455, 360], [410, 340], [360, 325],
      [310, 310], [260, 300], [210, 295], [155, 285],
      [100, 270], [72, 258], [100, 240],
    ],
    riverCourse: [
      [105, 248], [155, 232], [205, 238], [255, 248],
      [305, 258], [348, 270], [388, 290], [425, 312],
      [452, 335],
    ],
    tributaries: [
      { name: '北江', path: [[250, 235], [290, 248], [348, 270]], side: 'right' },
      { name: '东江', path: [[340, 260], [365, 268], [388, 290]], side: 'right' },
      { name: '柳江', path: [[140, 220], [170, 228], [205, 238]], side: 'left' },
    ],
    cities: [
      { name: '广州', x: 425, y: 312 },
      { name: '深圳', x: 440, y: 320 },
      { name: '南宁', x: 155, y: 232 },
      { name: '梧州', x: 255, y: 248 },
      { name: '佛山', x: 415, y: 308 },
      { name: '珠海', x: 445, y: 330 },
    ],
    source: [105, 248],
    mouth: [452, 335],
    flowLabel: '西 → 东南',
  },

  // ── Amazon (亚马孙河) – South America ────────────────────
  amazon: {
    continentOutline: [
      [120, 195], [165, 175], [210, 162], [260, 155],
      [310, 158], [360, 165], [400, 180], [420, 205],
      [430, 235], [425, 270], [410, 305], [385, 330],
      [350, 345], [310, 348], [270, 345], [235, 335],
      [205, 318], [175, 295], [155, 268], [148, 240],
      [120, 195],
    ],
    oceanRect: [260, 150, 190, 210],
    landColor: '#81C784',
    oceanColor: '#4FC3F7',
    basinBoundary: [
      [68, 210], [110, 190], [152, 180], [198, 178],
      [245, 182], [295, 188], [340, 195], [378, 210],
      [405, 232], [420, 258], [416, 285], [395, 305],
      [358, 318], [312, 322], [268, 318], [228, 310],
      [192, 296], [162, 278], [140, 255], [128, 232],
      [120, 215], [105, 212], [68, 210],
    ],
    riverCourse: [
      [75, 215], [118, 198], [158, 188], [202, 182],
      [250, 185], [298, 190], [342, 198], [378, 212],
      [400, 235], [415, 260], [420, 285],
    ],
    tributaries: [
      { name: 'Rio Negro', path: [[310, 178], [325, 185], [342, 198]], side: 'right' },
      { name: 'Madeira', path: [[240, 245], [268, 230], [298, 190]], side: 'left' },
      { name: 'Tapajós', path: [[350, 250], [362, 232], [378, 212]], side: 'left' },
      { name: 'Xingu', path: [[380, 260], [392, 242], [400, 235]], side: 'left' },
      { name: 'Ucayali', path: [[70, 230], [95, 220], [118, 198]], side: 'left' },
    ],
    cities: [
      { name: '玛瑙斯', x: 342, y: 198 },
      { name: '伊基托斯', x: 118, y: 198 },
      { name: '贝伦', x: 420, y: 285 },
      { name: '圣塔伦', x: 378, y: 212 },
    ],
    source: [75, 215],
    mouth: [420, 285],
    flowLabel: '西 → 东',
  },

  // ── Nile (尼罗河) – Africa ───────────────────────────────
  nile: {
    continentOutline: [
      [195, 30], [230, 35], [260, 45], [280, 65],
      [295, 90], [305, 115], [320, 140], [335, 165],
      [345, 190], [350, 218], [340, 245], [320, 270],
      [298, 290], [270, 305], [245, 310], [220, 305],
      [200, 292], [185, 270], [175, 245], [170, 218],
      [172, 190], [178, 162], [185, 135], [190, 108],
      [192, 80], [195, 55], [195, 30],
    ],
    oceanRect: [140, 5, 80, 320],
    landColor: '#A5D6A7',
    oceanColor: '#4FC3F7',
    basinBoundary: [
      [215, 35], [235, 38], [255, 48], [270, 68],
      [282, 92], [292, 115], [305, 140], [318, 165],
      [330, 190], [336, 215], [328, 238], [312, 255],
      [292, 265], [272, 270], [255, 268], [240, 262],
      [228, 250], [222, 232], [220, 210], [222, 185],
      [225, 160], [228, 138], [225, 115], [218, 92],
      [212, 68], [215, 50], [215, 35],
    ],
    riverCourse: [
      [218, 40], [232, 42], [252, 52], [265, 72],
      [278, 95], [288, 118], [302, 142], [315, 168],
      [325, 192], [330, 218], [322, 240], [308, 258],
      [290, 268], [275, 275],
    ],
    tributaries: [
      { name: '青尼罗河', path: [[285, 95], [300, 108], [308, 130], [315, 168]], side: 'right' },
      { name: '白尼罗河', path: [[195, 145], [215, 155], [248, 158], [265, 150], [288, 118]], side: 'left' },
      { name: '阿特巴拉河', path: [[305, 152], [318, 160], [325, 192]], side: 'right' },
    ],
    cities: [
      { name: '开罗', x: 275, y: 275 },
      { name: '喀土穆', x: 315, y: 168 },
      { name: '阿斯旺', x: 308, y: 258 },
      { name: '卢克索', x: 308, y: 258 },
    ],
    source: [218, 40],
    mouth: [275, 275],
    flowLabel: '南 → 北',
  },

  // ── Mississippi (密西西比河) – North America ──────────────
  mississippi: {
    continentOutline: [
      [30, 30], [120, 20], [210, 25], [290, 35],
      [350, 50], [390, 75], [410, 105], [415, 135],
      [405, 165], [385, 195], [360, 215], [335, 225],
      [312, 230], [290, 228], [270, 220], [252, 210],
      [235, 195], [225, 175], [220, 155], [222, 138],
      [228, 118], [218, 95], [205, 75], [185, 55],
      [155, 42], [110, 35], [65, 32], [30, 30],
    ],
    oceanRect: [330, 120, 90, 170],
    landColor: '#A5D6A7',
    oceanColor: '#81D4FA',
    basinBoundary: [
      [68, 35], [125, 28], [185, 32], [245, 42],
      [290, 58], [325, 80], [348, 105], [360, 132],
      [368, 158], [372, 182], [368, 205], [355, 222],
      [335, 232], [312, 235], [290, 232], [272, 225],
      [255, 215], [242, 198], [232, 178], [228, 158],
      [230, 138], [222, 118], [208, 98], [188, 80],
      [160, 65], [128, 55], [95, 48], [68, 35],
    ],
    riverCourse: [
      [72, 40], [128, 32], [188, 35], [248, 45],
      [292, 62], [328, 82], [350, 108], [362, 135],
      [370, 162], [372, 188], [365, 210], [348, 228],
      [325, 235], [302, 225], [282, 210], [268, 195],
    ],
    tributaries: [
      { name: '密苏里河', path: [[110, 80], [155, 65], [210, 52], [248, 45]], side: 'right' },
      { name: '俄亥俄河', path: [[350, 140], [358, 150], [362, 135]], side: 'right' },
      { name: '阿肯色河', path: [[240, 145], [270, 155], [305, 165], [350, 185], [372, 188]], side: 'left' },
      { name: '田纳西河', path: [[350, 175], [358, 188], [365, 210]], side: 'right' },
    ],
    cities: [
      { name: '明尼阿波利斯', x: 188, y: 35 },
      { name: '圣路易斯', x: 292, y: 62 },
      { name: '孟菲斯', x: 362, y: 135 },
      { name: '新奥尔良', x: 370, y: 162 },
    ],
    source: [72, 40],
    mouth: [348, 228],
    flowLabel: '北 → 南',
  },
};

// ──────────────────────────────────────
// Flood season, sediment, hydro, navigation data
// ──────────────────────────────────────
const floodSeasonData: Record<string, { months: string; desc: string }> = {
  yangtze: { months: '6-9月', desc: '夏季季风带来集中降水，中下游易发洪涝；6月"梅雨"、7-8月"伏汛"' },
  yellow: { months: '7-10月', desc: '夏季暴雨集中，中游水土流失严重，下游"地上河"汛期决口风险大' },
  pearl: { months: '4-9月', desc: '汛期长（亚热带），台风带来极端暴雨，珠江三角洲易发城市内涝' },
  amazon: { months: '全年，12-5月为高峰', desc: '热带雨林全年多雨，安第斯山融雪补充，水位年变幅可达10-15米' },
  nile: { months: '7-10月', desc: '青尼罗河（埃塞俄比亚高原）雨季带来洪水，白尼罗河（湖区）流量较稳定' },
  mississippi: { months: '3-6月（春汛）+夏季暴雨', desc: '春季融雪+夏季暴雨形成双汛期，下游密西西比三角洲防洪压力大' },
};

const hydroData: Record<string, { sedimentLoad: string; hydroCapacity: string; navigation: string }> = {
  yangtze: {
    sedimentLoad: '年输沙量约4.8亿吨（三峡蓄水后减少~60%）',
    hydroCapacity: '装机容量：三峡2250万kW，总流域约2.3亿kW',
    navigation: '通航里程约2800km，5万吨级海轮可抵南京，\"黄金水道\"',
  },
  yellow: {
    sedimentLoad: '年输沙量约16亿吨（世界之最），近年因水土保持降至~3亿吨',
    hydroCapacity: '装机容量：龙羊峡、刘家峡、小浪底等，总约3000万kW',
    navigation: '通航能力有限，下游季节性通航，\"地上河\"限制航运发展',
  },
  pearl: {
    sedimentLoad: '年输沙量约0.9亿吨，含沙量较小',
    hydroCapacity: '红水河梯级开发，总装机约1500万kW',
    navigation: '西江航运干线通航1000吨级船舶，珠三角水网密布，航运发达',
  },
  amazon: {
    sedimentLoad: '年输沙量约10亿吨，形成巨大水下三角洲',
    hydroCapacity: '水电开发较少，已建大坝不多（环保限制），潜力约1亿kW',
    navigation: '通航里程超25000km，万吨海轮可上溯至玛瑙斯（1600km）',
  },
  nile: {
    sedimentLoad: '年输沙量约1.2亿吨（阿斯旺大坝后大幅减少）',
    hydroCapacity: '阿斯旺大坝装机210万kW，全流域水电潜力约5000万kW',
    navigation: '阿斯旺至开罗段可通航，苏丹境内季节性通航',
  },
  mississippi: {
    sedimentLoad: '年输沙量约5亿吨，三角洲每年向海延伸约100m',
    hydroCapacity: '水电开发较少（平原河流），以航运和灌溉为主',
    navigation: '通航里程约20000km，是美国内陆水运大动脉，圣路易斯以下可通万吨级',
  },
};

const factData: Record<string, { source: string; mouth: string; countries: string; majorDams: string }> = {
  yangtze: {
    source: '青藏高原唐古拉山各拉丹冬峰',
    mouth: '上海注入东海',
    countries: '中国',
    majorDams: '三峡大坝、葛洲坝、向家坝、溪洛渡、白鹤滩',
  },
  yellow: {
    source: '青海巴颜喀拉山',
    mouth: '山东东营注入渤海',
    countries: '中国',
    majorDams: '龙羊峡、李家峡、刘家峡、三门峡、小浪底',
  },
  pearl: {
    source: '云南曲靖马雄山',
    mouth: '广东八门入南海',
    countries: '中国、越南',
    majorDams: '天生桥、龙滩、大藤峡',
  },
  amazon: {
    source: '秘鲁安第斯山脉',
    mouth: '巴西注入大西洋',
    countries: '秘鲁、哥伦比亚、巴西',
    majorDams: '较少（环保限制），贝罗蒙特水电站装机1123万kW',
  },
  nile: {
    source: '白尼罗河：维多利亚湖；青尼罗河：埃塞俄比亚高原',
    mouth: '埃及注入地中海',
    countries: '坦桑尼亚、乌干达、南苏丹、苏丹、埃及等11国',
    majorDams: '阿斯旺大坝、复兴大坝（埃塞俄比亚）',
  },
  mississippi: {
    source: '美国明尼苏达州艾塔斯卡湖',
    mouth: '路易斯安那州注入墨西哥湾',
    countries: '美国',
    majorDams: '较少大型水坝，以防洪堤和船闸为主',
  },
};

const segmentDescriptions: Record<string, string[]> = {
  yangtze: [
    '上游（源头-宜昌）：峡谷多、落差大，水能资源丰富（三峡、葛洲坝），水流湍急',
    '中游（宜昌-湖口）：河道弯曲（荆江"九曲回肠"），多湖泊调节（洞庭湖、鄱阳湖），航运发达',
    '下游（湖口-入海口）：江面宽阔、水流平缓，泥沙沉积形成长江三角洲，经济发达',
  ],
  yellow: [
    '上游（源头-河口镇）：水清量小，多峡谷（龙羊峡、刘家峡），水能资源丰富',
    '中游（河口镇-桃花峪）：流经黄土高原，含沙量剧增，水土流失严重',
    '下游（桃花峪-入海口）："地上河"（河床高出地面3-10米），泥沙淤积，历史决口改道频繁',
  ],
  pearl: [
    '上游（西江）：发源于云贵高原，多峡谷瀑布，水流落差大',
    '中游（三江汇合）：西江、北江、东江汇合，水量大增，河谷宽阔',
    '下游（三角洲）：河网密布、八门入海，形成富饶的珠江三角洲平原',
  ],
  amazon: [
    '上游（安第斯山区）：发源于秘鲁安第斯山，落差极大，水流湍急',
    '中游（亚马孙平原）：流经世界最大热带雨林，支流众多呈树枝状，流量巨大',
    '下游（入海口）：河口宽达330km（雨季），形成巨大喇叭口，潮汐可达800km内陆',
  ],
  nile: [
    '上游（白尼罗河）：发源于维多利亚湖，流经沼泽区，水量较稳定',
    '中游（青尼罗河汇入）：青尼罗河从埃塞俄比亚高原带来大量泥沙和洪水',
    '下游（阿斯旺-入海口）：流经撒哈拉沙漠，形成尼罗河谷地和三角洲绿洲',
  ],
  mississippi: [
    '上游（源头-圣路易斯）：发源于落基山脉，春季融雪为主要水源',
    '中游（圣路易斯-开罗）：汇入密苏里河和俄亥俄河，流量大增',
    '下游（开罗-入海口）：流经大平原，形成巨大三角洲（鸟足三角洲），夏季暴雨',
  ],
};

const seasonDescriptions: Record<string, string> = {
  yangtze: '长江流域受季风气候控制，6-9月雨季流量占全年70%以上。冬季（12-2月）为枯水期，流量仅为汛期的1/4-1/3。三峡水库在汛期拦洪、枯水期补水，起到调节作用。',
  yellow: '黄河水量季节变化极大，7-10月汛期流量占全年60%。春季（3-4月）冰雪融水形成春汛（凌汛），下游易发生冰坝壅水。冬季上游封冻，流量降至最低。',
  pearl: '珠江位于亚热带季风区，汛期长（4-9月），流量占全年80%以上。受台风影响，7-9月可能出现极端暴雨洪水。冬季流量较小但不断流，属丰水河流。',
  amazon: '亚马孙河流域全年降水丰富，流量季节变化相对较小。12-5月为高水期（安第斯山融雪+雨季叠加），6-11月为略低水期，但最低流量仍超过长江汛期流量。',
  nile: '尼罗河流量季节变化受青尼罗河控制，7-10月埃塞俄比亚高原雨季带来洪水（占全年流量80%）。白尼罗河湖区水源稳定，全年流量变化较小。阿斯旺大坝建成后，下游流量趋于均匀。',
  mississippi: '密西西比河具有双汛期特征：3-6月春季融雪形成春汛，7-8月夏季暴雨形成夏汛。秋季（9-11月）为平水期，冬季为枯水期。上游水库群起到削峰补枯作用。',
};

// ──────────────────────────────────────
// Component
// ──────────────────────────────────────
const RiverBasin: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [basinId, setBasinId] = useState('yangtze');
  const [hoverCity, setHoverCity] = useState<string | null>(null);
  const [hoverSegment, setHoverSegment] = useState<number | null>(null);

  const basin = riverBasins.find((b) => b.id === basinId) || riverBasins[0];
  const geo = geoData[basinId];
  const floodInfo = floodSeasonData[basinId];
  const hInfo = hydroData[basinId];
  const factInfo = factData[basinId];
  const segmentDescs = segmentDescriptions[basinId];
  const seasonDesc = seasonDescriptions[basinId];

  const drawBasin = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // ── 1. Ocean background ──
    ctx.fillStyle = geo.oceanColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // ── 2. Draw continent outline (land) ──
    ctx.fillStyle = geo.landColor;
    ctx.strokeStyle = '#558B2F';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(geo.continentOutline[0][0], geo.continentOutline[0][1]);
    for (let i = 1; i < geo.continentOutline.length; i++) {
      ctx.lineTo(geo.continentOutline[i][0], geo.continentOutline[i][1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // ── 3. Basin boundary (watershed divide) ──
    ctx.save();
    ctx.strokeStyle = '#F57C00';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 3]);
    ctx.fillStyle = 'rgba(255, 224, 130, 0.25)';
    ctx.beginPath();
    ctx.moveTo(geo.basinBoundary[0][0], geo.basinBoundary[0][1]);
    for (let i = 1; i < geo.basinBoundary.length; i++) {
      ctx.lineTo(geo.basinBoundary[i][0], geo.basinBoundary[i][1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Basin label
    ctx.fillStyle = '#BF360C';
    ctx.font = 'bold 11px sans-serif';
    const bb = geo.basinBoundary;
    const cx = bb.reduce((s, p) => s + p[0], 0) / bb.length;
    const cy = bb.reduce((s, p) => s + p[1], 0) / bb.length - Math.max(...bb.map(p => p[1])) * 0.25;
    ctx.fillText('分水岭', cx - 28, cy - 45);

    // ── 4. Tributaries ──
    geo.tributaries.forEach((trib) => {
      ctx.strokeStyle = '#64B5F6';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(trib.path[0][0], trib.path[0][1]);
      for (let i = 1; i < trib.path.length; i++) {
        ctx.lineTo(trib.path[i][0], trib.path[i][1]);
      }
      ctx.stroke();

      // Label tributary
      const midPt = trib.path[Math.floor(trib.path.length / 2)];
      ctx.fillStyle = '#1565C0';
      ctx.font = '9px sans-serif';
      const tx = trib.side === 'right' ? midPt[0] + 6 : midPt[0] - 6 - ctx.measureText(trib.name).width;
      ctx.fillText(trib.name, tx, midPt[1] - 3);
    });

    // ── 5. Main river course ──
    const r = geo.riverCourse;
    ctx.strokeStyle = '#0D47A1';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(r[0][0], r[0][1]);
    for (let i = 1; i < r.length; i++) {
      ctx.lineTo(r[i][0], r[i][1]);
    }
    ctx.stroke();

    // ── 6. Flow direction arrows along main channel ──
    const drawArrow = (fromIdx: number, toIdx: number) => {
      const fx = r[fromIdx][0], fy = r[fromIdx][1];
      const tx = r[toIdx][0], ty = r[toIdx][1];
      const angle = Math.atan2(ty - fy, tx - fx);
      const midX = (fx + tx) / 2;
      const midY = (fy + ty) / 2;

      ctx.fillStyle = '#FF6F00';
      ctx.strokeStyle = '#FF6F00';
      ctx.lineWidth = 1.5;
      const al = 8;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(
        midX - al * Math.cos(angle - 0.45),
        midY - al * Math.sin(angle - 0.45)
      );
      ctx.lineTo(
        midX - al * Math.cos(angle + 0.45),
        midY - al * Math.sin(angle + 0.45)
      );
      ctx.closePath();
      ctx.fill();
    };

    // Place arrows at intervals along the river
    const numArrows = Math.max(3, Math.floor(r.length / 4));
    for (let i = 0; i < numArrows; i++) {
      const fi = Math.floor((r.length - 1) * i / numArrows);
      const ti = Math.min(fi + 1, r.length - 1);
      if (fi < ti) drawArrow(fi, ti);
    }

    // ── City markers ──
    const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    geo.cities.forEach((city) => {
      const isHovered = hoverCity === city.name;
      // City dot
      ctx.fillStyle = isHovered ? '#D32F2F' : '#C62828';
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(city.x, city.y, isHovered ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // City name
      ctx.fillStyle = isHovered ? '#B71C1C' : '#333';
      ctx.font = isHovered ? 'bold 10px sans-serif' : '9px sans-serif';
      const textW = ctx.measureText(city.name).width;
      const nx = city.x - textW / 2;
      ctx.fillText(city.name, nx, city.y + (isHovered ? 18 : 14));

      if (isHovered) {
        // tooltip background
        const tW = textW + 16;
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        const bx = city.x - tW / 2;
        const by = city.y - 28;
        drawRoundRect(ctx, bx, by, tW, 20, 4);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(city.name, bx + 8, by + 14);
      }
    });

    // ── 8. Source marker ──
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.arc(geo.source[0], geo.source[1], 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5D4037';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('源头', geo.source[0] + 8, geo.source[1] + 3);

    // ── 9. Mouth marker ──
    ctx.fillStyle = '#1565C0';
    ctx.beginPath();
    ctx.arc(geo.mouth[0], geo.mouth[1], 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('入海口', geo.mouth[0] + 8, geo.mouth[1] + 3);

    // ── 10. Segment zones (clickable) ──
    const segCount = 3;
    const segLabels = ['上游', '中游', '下游'];
    const segColors = ['#81C784', '#66BB6A', '#4CAF50'];
    for (let s = 0; s < segCount; s++) {
      const idx = Math.floor((r.length - 1) * (s + 0.5) / segCount);
      const sx = r[idx][0];
      const sy = r[idx][1] - ((s - 1) * 15);

      const isHovered = hoverSegment === s;
      ctx.fillStyle = isHovered ? '#2E7D32' : segColors[s];
      ctx.strokeStyle = isHovered ? '#F57C00' : 'transparent';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, 22, 0, Math.PI * 2);
      ctx.fill();
      if (isHovered) ctx.stroke();
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(segLabels[s], sx - 10, sy + 4);
    }

    // ── 11. Legend box ──
    const lx = 10, ly = 10, lw = 180, lh = 95;
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.strokeStyle = '#CCC';
    ctx.lineWidth = 1;
    drawRoundRect(ctx, lx, ly, lw, lh, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(basin.name, lx + 10, ly + 18);
    ctx.font = '10px sans-serif';
    ctx.fillText(`流域面积: ${(basin.area / 10000).toFixed(0)}万km² | 河长: ${basin.length}km`, lx + 10, ly + 34);
    ctx.fillText(`流向: ${geo.flowLabel}`, lx + 10, ly + 50);

    // Legend color blocks
    const legendItems = [
      { color: '#F57C00', label: '分水岭（流域边界）', lx: 10, ly: 64 },
      { color: '#0D47A1', label: '干流', lx: 10, ly: 78 },
      { color: '#64B5F6', label: '支流', lx: 10, ly: 92 },
    ];
    legendItems.forEach(item => {
      ctx.fillStyle = item.color;
      ctx.fillRect(lx + 10, lx === 10 ? item.ly : item.ly, 12, 4);
      ctx.fillStyle = '#555';
      ctx.font = '8px sans-serif';
      ctx.fillText(item.label, lx + 28, (lx === 10 ? item.ly : item.ly) + 4);
    });

    // ── 12. Info overlay at bottom ──
    const bottomY = CANVAS_H - 36;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, bottomY, CANVAS_W, 36);
    ctx.fillStyle = '#FFF';
    ctx.font = '10px sans-serif';
    ctx.fillText(`汛期: ${floodInfo?.months || '-'}  |  输沙量: ${hInfo?.sedimentLoad || '-'}`, 12, bottomY + 14);
    ctx.fillText(`水电: ${hInfo?.hydroCapacity || '-'}  |  航运: ${hInfo?.navigation || '-'}`, 12, bottomY + 28);

  }, [basin, geo, floodInfo, hInfo, hoverCity, hoverSegment]);

  useEffect(() => {
    drawBasin();
  }, [drawBasin]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e.currentTarget, e);
    // Check city hover
    const hitCity = geo.cities.find(
      (c) => Math.sqrt((x - c.x) ** 2 + (y - c.y) ** 2) < 12
    );
    setHoverCity(hitCity ? hitCity.name : null);

    // Check segment hover
    const r = geo.riverCourse;
    const segCount = 3;
    let hitSeg: number | null = null;
    for (let s = 0; s < segCount; s++) {
      const idx = Math.floor((r.length - 1) * (s + 0.5) / segCount);
      const sx = r[idx][0];
      const sy = r[idx][1] - ((s - 1) * 15);
      if (Math.sqrt((x - sx) ** 2 + (y - sy) ** 2) < 22) {
        hitSeg = s;
        break;
      }
    }
    setHoverSegment(hitSeg);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e.currentTarget, e);
    const r = geo.riverCourse;
    const segCount = 3;
    for (let s = 0; s < segCount; s++) {
      const idx = Math.floor((r.length - 1) * (s + 0.5) / segCount);
      const sx = r[idx][0];
      const sy = r[idx][1] - ((s - 1) * 15);
      if (Math.sqrt((x - sx) ** 2 + (y - sy) ** 2) < 22) {
        setHoverSegment(hoverSegment === s ? null : s);
        return;
      }
    }
  };

  // ── Annual discharge comparison chart data ──
  const allNames = riverBasins.map(b => b.name);
  const annualDischarges = riverBasins.map(
    b => Math.round(b.seasonalFlow.reduce((a, v) => a + v, 0) / 12)
  );

  const comparisonChartData = {
    labels: allNames,
    datasets: [
      {
        label: '年均流量 (m³/s)',
        data: annualDischarges,
        backgroundColor: ['#1976D2', '#F57C00', '#388E3C', '#2E7D32', '#7B1FA2', '#C62828'],
        borderColor: ['#0D47A1', '#E65100', '#1B5E20', '#1B5E20', '#4A148C', '#8E0000'],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // ── Seasonal flow chart for selected river ──
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const avgFlow = basin.seasonalFlow.reduce((a, b) => a + b, 0) / 12;

  const seasonalChartData = {
    labels: months,
    datasets: [
      {
        label: '月均流量 (m³/s)',
        data: basin.seasonalFlow,
        backgroundColor: basin.seasonalFlow.map((v) =>
          v > avgFlow ? 'rgba(21,101,192,0.7)' : 'rgba(21,101,192,0.3)'
        ),
        borderColor: '#1565C0',
        borderWidth: 1,
        borderRadius: 2,
      },
    ],
  };

  return (
    <ToolPageLayout title="河流流域交互图" exportRef={exportRef}>
      <Box
        ref={exportRef}
        sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '100%' }}
      >
        {/* ── LEFT: Canvas map ── */}
        <Box sx={{ flex: '0 0 620px' }}>
          <FormControl size="small" sx={{ minWidth: 160, mb: 1 }}>
            <InputLabel>选择流域</InputLabel>
            <Select
              value={basinId}
              label="选择流域"
              onChange={(e) => {
                setBasinId(e.target.value);
                setHoverCity(null);
                setHoverSegment(null);
              }}
            >
              {riverBasins.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onMouseMove={handleCanvasMouseMove}
            onClick={handleCanvasClick}
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'block',
              maxWidth: '100%',
            }}
          />

          <Typography variant="body2" sx={{ color: '#757575', mt: 1, fontSize: 13 }}>
            {basin.description.substring(0, 80)}... · 悬停城市查看详情 · 点击上/中/下游查看分段描述
          </Typography>

          {/* City details on hover */}
          {hoverCity && (
            <Box sx={{ mt: 1, p: 1, bgcolor: '#FFEBEE', borderRadius: 2, border: '1px solid #EF9A9A' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#C62828' }}>
                📍 {hoverCity}
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                {basin.name}沿岸重要城市
              </Typography>
            </Box>
          )}

          {/* Segment detail */}
          {hoverSegment !== null && segmentDescs && (
            <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#E8F5E9', borderRadius: 2, border: '2px solid #2E7D32' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                {hoverSegment === 0 ? '🌄 上游段' : hoverSegment === 1 ? '🏞️ 中游段' : '🌊 下游段'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                {segmentDescs[hoverSegment]}
              </Typography>
            </Box>
          )}
        </Box>

        {/* ── RIGHT: Info panels ── */}
        <Box sx={{ flex: 1, minWidth: 280 }}>
          {/* Annual Discharge Comparison */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            🌍 六大河流年均流量对比
          </Typography>
          <Box sx={{ height: 220, mb: 2 }}>
            <Bar
              data={comparisonChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'x',
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx: any) =>
                        `${ctx.parsed?.y?.toLocaleString() ?? '0'} m³/s`,
                    },
                  },
                },
                scales: {
                  y: {
                    title: { display: true, text: '年均流量 (m³/s)' },
                    ticks: { callback: (v) => Number(v).toLocaleString() },
                  },
                  x: {
                    ticks: { font: { size: 10 } },
                  },
                },
              }}
            />
          </Box>

          {/* Key Geographic Facts */}
          <Box sx={{ p: 1.5, bgcolor: '#F3E5F5', borderRadius: 2, border: '1px solid #CE93D8', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7B1FA2', mb: 1 }}>
              📋 关键地理事实 — {basin.name}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <FactRow label="源头" value={factInfo?.source || '-'} />
              <FactRow label="入海口" value={factInfo?.mouth || '-'} />
              <FactRow label="流经国家" value={factInfo?.countries || '-'} />
              <FactRow label="长度" value={`${basin.length.toLocaleString()} km`} />
              <FactRow label="流域面积" value={`${(basin.area / 10000).toFixed(0)} 万km²`} />
              <FactRow label="年均流量" value={`${Math.round(basin.seasonalFlow.reduce((a, b) => a + b, 0) / 12).toLocaleString()} m³/s`} />
              <FactRow label="主要大坝" value={factInfo?.majorDams || '-'} />
            </Box>
          </Box>

          {/* Flood season info */}
          <Box sx={{ p: 1.5, bgcolor: '#FFF3E0', borderRadius: 2, border: '1px solid #FFE082', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#F57C00' }}>
              🌊 汛期信息
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              汛期：{floodInfo?.months || '数据暂无'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#555', mt: 0.3 }}>
              {floodInfo?.desc || ''}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              <Chip size="small" label={`输沙: ${hInfo?.sedimentLoad || '-'}`} sx={{ fontSize: 11 }} />
            </Box>
          </Box>

          {/* Seasonal Flow Regime */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            📊 {basin.name} · 季节流量变化
          </Typography>
          <Box sx={{ height: 200, mb: 1 }}>
            <Bar
              data={seasonalChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx: any) =>
                        `${ctx.parsed?.y?.toLocaleString() ?? '0'} m³/s`,
                    },
                  },
                },
                scales: {
                  y: {
                    title: { display: true, text: '流量 (m³/s)' },
                    ticks: { callback: (v) => Number(v).toLocaleString() },
                  },
                },
              }}
            />
          </Box>

          {/* Seasonal explanation */}
          <Box sx={{ p: 1.5, bgcolor: '#E3F2FD', borderRadius: 2, border: '1px solid #90CAF9', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0' }}>
              🔄 季节性流量规律
            </Typography>
            <Typography variant="body2" sx={{ color: '#555', mt: 0.5, lineHeight: 1.6 }}>
              {seasonDesc}
            </Typography>
          </Box>

          {/* Watershed divide explanation */}
          <Box sx={{ p: 1.5, bgcolor: '#EFEBE9', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              📐 分水岭
            </Typography>
            <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.6 }}>
              分水岭是相邻流域之间的界线，通常沿山脊线分布。图中橙色虚线表示流域边界（分水岭），
              所有降水在边界内汇入该河流。分水岭两侧的水流向不同的河流系统。
            </Typography>
          </Box>

          {/* 河流水文特征对比表 */}
          <Box sx={{ p: 1.5, mt: 1, bgcolor: '#E3F2FD', borderRadius: 2, border: '1px solid #90CAF9' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0', mb: 1 }}>
              📊 六大河流水文特征对比表（高考必背）
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#bbdefb' }}>
                    <th style={{ border: '1px solid #90caf9', padding: '2px 4px', textAlign: 'center' }}>河流</th>
                    <th style={{ border: '1px solid #90caf9', padding: '2px 4px', textAlign: 'center' }}>流量</th>
                    <th style={{ border: '1px solid #90caf9', padding: '2px 4px', textAlign: 'center' }}>水位变化</th>
                    <th style={{ border: '1px solid #90caf9', padding: '2px 4px', textAlign: 'center' }}>含沙量</th>
                    <th style={{ border: '1px solid #90caf9', padding: '2px 4px', textAlign: 'center' }}>结冰期</th>
                    <th style={{ border: '1px solid #90caf9', padding: '2px 4px', textAlign: 'center' }}>流速/水能</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}><b>长江</b></td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>极大（世界第三）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>夏丰冬枯，6-9月汛期</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>较大（中游荆江段淤积）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>无（亚热带，最冷月&gt;0°C）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>上游急（峡谷多），中下游缓</td>
                  </tr>
                  <tr style={{ backgroundColor: '#e3f2fd' }}>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}><b>黄河</b></td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>较小（仅为长江1/20）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>夏丰冬枯，7-10月汛期；春有凌汛</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}><b>极大（世界之最）</b></td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>有（1-2月封冻，上游最长）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>上游急（多峡谷），下游缓（地上河）</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}><b>珠江</b></td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>大（仅次于长江）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>汛期长（4-9月），受台风影响大</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>较小（植被覆盖好）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>无（亚热带/热带）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>上游急（云贵高原），三角洲平缓</td>
                  </tr>
                  <tr style={{ backgroundColor: '#e3f2fd' }}>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}><b>亚马孙河</b></td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}><b>极大（世界第一）</b></td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>全年丰水，5-6月洪峰</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>较大（热带雨林侵蚀）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>无（热带，终年高温）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>上游急（安第斯山），中下游极缓</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}><b>尼罗河</b></td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>较小（流经沙漠）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>7-10月汛期（青尼罗河洪水），白尼罗河稳定</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>上游大、下游小（阿斯旺坝拦截）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>无（热带/亚热带）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>上游急（高原），下游平缓</td>
                  </tr>
                  <tr style={{ backgroundColor: '#e3f2fd' }}>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}><b>密西西比河</b></td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>大（北美第一）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>双汛期：春汛（融雪3-6月）+夏汛（暴雨）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>中等</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>中上游有（冬季封冻）</td>
                    <td style={{ border: '1px solid #90caf9', padding: '2px 4px' }}>中上游较急，下游平缓</td>
                  </tr>
                </tbody>
              </table>
            </Box>
            <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.65rem', mt: 0.5 }}>
              💡 水文特征五要素：流量（大小及季节变化）、水位变化（汛期/枯水期）、含沙量、结冰期（有无及长短）、流速/水能（落差大小）。
            </Typography>
          </Box>

          {/* 河流阶地、河漫滩、三角洲形成过程 */}
          <Box sx={{ p: 1.5, mt: 1, bgcolor: '#fce4ec', borderRadius: 2, border: '1px solid #f48fb1' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#880e4f', mb: 1 }}>
              🏞️ 河流阶地·河漫滩·三角洲形成过程简述（高考地貌核心）
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.5 }}>
              <b>1. 河流阶地（River Terrace）：</b>地壳抬升（或侵蚀基准面下降）→ 河流下切侵蚀加强 → 原河漫滩抬升脱离洪水影响 → 形成阶地。阶地级数反映地壳抬升次数：一级阶地最年轻（最低），越高级数越古老。河岸两侧阶地对称分布，是研究<b>新构造运动</b>的重要证据。高考常考：「阶地级数=地壳抬升次数」、「阶地越高越古老」。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.5 }}>
              <b>2. 河漫滩（Floodplain）：</b>河流侧蚀拓宽河谷 → 凸岸泥沙淤积形成边滩 → 洪水期泛滥，泥沙在两岸堆积 → 枯水期出露形成河漫滩。河漫滩由<b>河床相（下部粗粒）</b>与<b>河漫滩相（上部细粒）</b>二元结构组成。河漫滩土质肥沃、地势平坦，是重要的农业区（如长江中下游平原）。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
              <b>3. 三角洲（Delta）：</b>河流挟带大量泥沙入海（湖） → 流速骤减、泥沙沉积 → 形成扇形堆积体 → 河道分汊入海。形成条件：①河流含沙量大（如黄河、尼罗河）；②河口处海水较浅、潮汐弱（海水顶托利于沉积）；③河流流量较为稳定。三角洲是<b>流水堆积地貌</b>的典型代表，也是人口密集区和重要农业区（如长三角、珠三角、尼罗河三角洲）。
            </Typography>
          </Box>

          {/* 河流侵蚀与堆积地貌对比 */}
          <Box sx={{ p: 1.5, mt: 1, bgcolor: '#e8eaf6', borderRadius: 2, border: '1px solid #9fa8da' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#283593', mb: 1 }}>
              ⚡ 河流侵蚀与堆积地貌对比（高考必考）
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#c5cae9' }}>
                    <th style={{ border: '1px solid #9fa8da', padding: '2px 3px', textAlign: 'center' }}>地貌类型</th>
                    <th style={{ border: '1px solid #9fa8da', padding: '2px 3px', textAlign: 'center' }}>成因</th>
                    <th style={{ border: '1px solid #9fa8da', padding: '2px 3px', textAlign: 'center' }}>形态特征</th>
                    <th style={{ border: '1px solid #9fa8da', padding: '2px 3px', textAlign: 'center' }}>分布位置</th>
                    <th style={{ border: '1px solid #9fa8da', padding: '2px 3px', textAlign: 'center' }}>人类活动</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px', fontWeight: 600 }}>峡谷（V形谷）</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>河流下切侵蚀（下蚀为主）</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>谷壁陡峭、谷底狭窄，呈V字形</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>上游山区（长江三峡、科罗拉多大峡谷）</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>建水电站（落差大）、旅游</td>
                  </tr>
                  <tr style={{ backgroundColor: '#e8eaf6' }}>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px', fontWeight: 600 }}>曲流（河曲）</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>河流侧蚀为主，凹岸侵蚀、凸岸堆积</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>河道弯曲呈S形，凸岸有边滩</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>中下游平原（荆江"九曲回肠"）</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>凸岸建聚落/港口（水流缓）、凹岸需护岸</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px', fontWeight: 600 }}>冲积扇</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>河流出山口，流速骤减，泥沙堆积</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>扇形堆积体，自扇顶→扇缘粒径由粗变细</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>山前地带（太行山东麓、祁连山北麓）</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>扇缘地下水丰富→绿洲（河西走廊）</td>
                  </tr>
                  <tr style={{ backgroundColor: '#e8eaf6' }}>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px', fontWeight: 600 }}>三角洲</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>河口泥沙沉积，河道分汊入海</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>扇形或鸟足状（密西西比），地势低平</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>河流入海口（长三角、珠三角、尼罗河三角洲）</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>人口密集、经济发达、农业高产</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px', fontWeight: 600 }}>河流阶地</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>地壳抬升+河流下切，原河漫滩抬升</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>阶梯状台地，多级阶地平行排列</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>河谷两侧（黄河中游、长江上游）</td>
                    <td style={{ border: '1px solid #9fa8da', padding: '2px 3px' }}>聚落选址（防洪、取水便利）、古人类遗址</td>
                  </tr>
                </tbody>
              </table>
            </Box>
            <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.65rem', mt: 0.5 }}>
              💡 核心区分：侵蚀地貌（峡谷、曲流）由河流侵蚀作用主导；堆积地貌（冲积扇、三角洲、河漫滩）由河流堆积作用主导。阶地是侵蚀+构造抬升的复合产物。
            </Typography>
          </Box>

          {/* 河流补给类型说明 */}
          <Box sx={{ p: 1.5, mt: 1, bgcolor: '#E8F5E9', borderRadius: 2, border: '1px solid #A5D6A7' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2E7D32', mb: 1 }}>
              💧 河流补给类型说明（高考高频考点）
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              <b>1. 雨水补给（最主要）：</b>降水形成地表径流汇入河流。流量随降雨季节变化——季风区夏丰冬枯，地中海气候区冬丰夏枯。我国东部季风区河流以雨水补给为主（占70%-90%）。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              <b>2. 季节性积雪融水补给：</b>春季气温回升，冬季积雪融化补给河流，形成<b>春汛</b>（凌汛）。我国东北地区河流（松花江、黑龙江）有典型春汛（4-5月）。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              <b>3. 冰川/永久积雪融水补给：</b>夏季高温时冰川融化补给，流量与气温正相关——气温越高、融水越多。我国西北内陆河流（塔里木河、伊犁河）主要依赖冰川融水，夏季为汛期。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
              <b>4. 湖泊/沼泽补给：</b>湖泊（如洞庭湖、鄱阳湖对长江的调节）和沼泽对河流有削峰补枯作用——汛期蓄水、枯水期放水，使河流流量趋于均匀。
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
              <b>5. 地下水补给：</b>地下水稳定补给河流（常年性补给），是河流最可靠的补给来源。枯水期地下水位高于河水位时补给河流，是河流基流的主要来源。流量小而稳定。
            </Typography>
          </Box>

          {/* 河流水文特征五要素详解 */}
          <Box sx={{ p: 1.5, mt: 1, bgcolor: '#E0F7FA', borderRadius: 2, border: '1px solid #80DEEA' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#00695C' }}>
              🌊 河流水文特征五要素详解（高考必背）
            </Typography>

            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#00838F' }}>
                ① 流量（Discharge）
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
                流量大小取决于流域的降水量、集水面积和蒸发量。流量大→降水丰富、流域面积大（如长江年均流量约31,000m³/s，亚马孙河约209,000m³/s为世界第一）；流量小→干旱/半干旱地区（如黄河年均流量仅约1,800m³/s）。高考常考：流量大小比较及成因分析（气候类型+流域特征）。
              </Typography>
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#00838F' }}>
                ② 水位变化（Water Level Variation / 汛期与枯水期）
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
                水位季节性变化由补给类型决定：雨水补给→汛期与雨季一致（如季风区夏汛、地中海气候区冬汛）；冰雪融水补给→夏季高温时汛期（如塔里木河7-8月汛期）；积雪融水补给→春汛（如东北河流4-5月春汛/凌汛）。水位变化大→季风/大陆性气候；变化小→海洋性气候或湖泊/地下水调节显著的河流。
              </Typography>
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#00838F' }}>
                ③ 含沙量（Sediment Load）
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
                含沙量取决于流域的植被覆盖率、土质和降水强度。含沙量大→植被稀疏、土质疏松、降水集中（如黄河中游流经黄土高原，含沙量世界之最，年输沙约16亿吨）；含沙量小→植被茂密、土质坚硬、降水均匀（如珠江含沙量小、亚马孙河虽大但因雨林覆盖含沙量相对可控）。影响因素口诀：「植被多→沙少；黄土松→沙多；暴雨强→沙增」。含沙量大影响：①水库淤积缩短寿命；②河床抬升（地上河）；③三角洲快速向海推进。
              </Typography>
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#00838F' }}>
                ④ 结冰期（Freeze-up Period）
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
                结冰期取决于最冷月均温是否低于0°C。有结冰期→最冷月&lt;0°C（温带/寒带河流，如黄河1-2月封冻、松花江12-3月冰期长达4个月）；无结冰期→最冷月&gt;0°C（亚热带/热带河流，如长江、珠江全年不封冻）。由低纬流向高纬的河段易发生<b>凌汛</b>（冰坝壅水，如黄河宁夏-内蒙古段和山东段）。高考常考：结冰期有无及长短→反映纬度/气候带；凌汛条件：①有结冰期 ②低纬→高纬流向。
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#00838F' }}>
                ⑤ 流速 / 水能（Flow Velocity &amp; Hydropower）
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
                流速取决于河床落差（坡度）和河道形态。流速大→上游山区、峡谷多、落差大（水能丰富→适合建水电站，如长江三峡、黄河龙羊峡）；流速小→中下游平原、河道宽、坡度缓（利于航运和灌溉，如长江中下游"黄金水道"）。水能资源丰富条件：①水量大 ②落差大。世界水能最丰富河流：刚果河（水量大+落差大）。
              </Typography>
            </Box>

            <Box sx={{ mt: 1, p: 1, bgcolor: '#fff', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#00695C', fontWeight: 700, textAlign: 'center' }}>
                💡 速记口诀：「流量水位沙冰速，五要素记清楚。流量看降水，水位看补给，含沙看植被，结冰看温度，流速看落差。」
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ToolPageLayout>
  );
};

// ── Helper: Fact row ──
const FactRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <Typography variant="body2" sx={{ fontWeight: 600, color: '#4A148C', minWidth: 72, flexShrink: 0 }}>
      {label}：
    </Typography>
    <Typography variant="body2" sx={{ color: '#333' }}>
      {value}
    </Typography>
  </Box>
);

export default RiverBasin;
