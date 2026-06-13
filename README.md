# GeoTools - 高中地理交互工具网站

一套服务于高中地理学习的交互式工具网站，涵盖自然地理、大气与气候、天文与地球运动、人文地理四大模块，纯静态部署，零后端依赖。

## 功能列表

### 自然地理
- **地形剖面生成器** — 等高线图上绘制剖面线，实时生成地形剖面，支持导出 PNG
- **河流流域交互图** — 点击流域展示分水岭/干支流信息，含流量季节变化柱状图
- **洋流动态模拟** — 全球寒暖流粒子动画，60fps，点击查看影响说明

### 大气与气候
- **气候类型判断器** — 输入12月气温降水数据，逐步推理判断气候类型
- **大气环流可视化** — 三圈环流+气压带风带动画，季节滑块查看偏移
- **锋面天气模拟** — 冷锋/暖锋/准静止锋过境动画，云系+温度变化

### 天文与地球运动
- **日照图计算器** — 拖动日期实时渲染晨昏线/太阳直射点/昼夜长短
- **时区与地方时计算器** — 输入经度时刻自动计算，支持区时/地方时切换
- **正午太阳高度角计算器** — 输入纬度+日期计算高度角，动态示意图

### 人文地理
- **工业区位分析工具** — 工业类型选择，区位因素权重雷达图
- **农业区位图解** — 农业类型+区域案例，自然/人文因素交互图
- **城市等级服务圈** — 中心地理论可视化，城市等级嵌套关系

### 辅助学习工具
- **图表判读训练** — 气候统计图/等值线图步骤化判读引导
- **地理计算公式速查** — 分类公式展示，交互例题即时计算

## 技术栈

| 技术 | 用途 |
|------|------|
| Vite 8 | 构建工具 |
| React 19 + TypeScript 6 | 前端框架 |
| Tailwind CSS 3 | 工具类样式 |
| MUI 9 | UI 组件库 |
| Chart.js 4 | 柱状图/雷达图 |
| Framer Motion 12 | 页面动效 |
| html2canvas | PNG 导出 |
| Canvas API | 地理可视化动画 |

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## GitHub Pages 部署

### 方式一：使用 GitHub Actions 自动部署（推荐）

推送 `main` 分支后，GitHub Actions 自动构建并部署到 Pages。访问：
`https://inkstain258.github.io/geo-tools/`

### 方式二：手动部署 dist 目录

1. 运行 `npm run build` 生成 `dist/` 目录
2. 将 `dist/` 的内容部署到任何静态托管服务

> **注意**：使用 HashRouter，SPA 路由不需要服务端配置。

## 项目结构

```
geo-tools/
├── .github/workflows/       # GitHub Actions 部署配置
│   └── deploy.yml
├── docs/                    # 项目文档
│   └── PRD.md
├── public/                  # 静态资源
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── layout/          # 全局布局
│   │   │   └── AppLayout.tsx
│   │   └── shared/          # 共享组件
│   │       ├── AnimationControls.tsx
│   │       ├── ClimateChart.tsx
│   │       ├── ExportButton.tsx
│   │       ├── RadarChart.tsx
│   │       └── ToolPageLayout.tsx
│   ├── data/                # 静态数据
│   │   ├── climateData.ts
│   │   ├── geoFormulas.ts
│   │   ├── terrainPresets.ts
│   │   └── tools.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── tools/           # 14个工具页面
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   ├── climateJudge.ts
│   │   ├── exportImage.ts
│   │   └── geoCalculations.ts
│   ├── App.tsx              # 路由配置
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── dist/                    # 构建产物（部署包）
├── .gitignore
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
└── tsconfig.node.json
```

## License

MIT
