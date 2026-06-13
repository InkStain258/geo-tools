import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Button, Slider, Tabs, Tab, Card, CardContent } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import { terrainPresets } from '@/data/terrainPresets';
import { getCanvasCoords } from '@/utils/canvasHelper';

const W = 440, H = 400;
const PW = 440, PH = 260;

/* ============ 真实地形高度场 ============ */
function gauss(dx: number, dy: number, sx: number, sy: number): number {
  return Math.exp(-((dx*dx)/(2*sx*sx) + (dy*dy)/(2*sy*sy)));
}

function getHeight(x: number, y: number, presetId: string): number {
  const cx = W / 2, cy = H / 2;
  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  switch (presetId) {
    case 'mountain': {
      // 单峰: 中心最高，向四周递减（等高线闭合同心圆）
      const r = dist / (W * 0.4);
      return 800 * Math.max(0, 1 - r * r);
    }
    case 'basin': {
      // 盆地: 边缘高，中心低（内低外高闭合圆）
      const r = dist / (W * 0.45);
      return 800 * Math.min(1, r);
    }
    case 'valley': {
      // 山谷: 左右两山脊，中间凹陷（等高线向高值凸出）
      const ridgeL = 700 * gauss(dx + 70, dy, 70, 180);
      const ridgeR = 700 * gauss(dx - 70, dy, 70, 180);
      const ridge = Math.max(ridgeL, ridgeR);
      // V形谷底切入
      const valleyDepth = 350 * Math.max(0, 1 - Math.abs(dy) / 50) * Math.max(0, 1 - Math.abs(dx) / 60);
      return Math.max(0, ridge - valleyDepth);
    }
    case 'ridge': {
      // 山脊: 沿中心线高，两侧低（等高线向低值凸出）
      // Ridgeline is along y-axis through center
      const distToRidge = Math.abs(dx);
      const alongRidge = dy;
      // Height decreases away from ridge, and also toward top/bottom
      const h = 750 * Math.max(0, 1 - distToRidge / 80) * Math.max(0, 1 - Math.abs(alongRidge) / 210);
      return h;
    }
    case 'saddle': {
      // 鞍部: 两个山峰之间低洼处
      // Two peaks on left and right, saddle in between
      const peakL = 650 * gauss(dx + 70, dy, 75, 100);
      const peakR = 650 * gauss(dx - 70, dy, 75, 100);
      return Math.max(0, Math.max(peakL, peakR));
    }
    case 'plateau': {
      // 高原: 顶部平坦（等高线稀疏），边缘陡峭（密集）
      const r = dist / (W * 0.35);
      // Smooth step: flat top (r<0.6), steep slope (0.6<r<1.0), then flat bottom
      const t = (r - 0.6) / 0.4;
      const sigmoid = 1 / (1 + Math.exp((t - 0.5) * 12));
      return 500 * (1 - sigmoid) + 50;
    }
    case 'escarpment': {
      // 陡崖: 一侧为平顶，一侧急剧下降（多条等高线重合）
      // Right side (x > cx): high plateau, left side: cliff drop
      const cliffX = cx;
      const t = (x - cliffX) / 30; // transition zone width
      const cliff = 1 / (1 + Math.exp(-t * 3));
      return 400 * (0.2 + 0.8 * cliff) * Math.max(0, 1 - Math.abs(dy) / 220);
    }
    default:
      return 0;
  }
}

/* ============ 等高线绘制 ============ */
function drawContourMap(ctx: CanvasRenderingContext2D, presetId: string) {
  const step = 3; // sampling step

  // Hypsometric background
  const imgData = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const h = getHeight(x, y, presetId);
      const r = h / 800; // 0..1
      // Green→Yellow→Brown→White gradient
      const idx = (y * W + x) * 4;
      if (r < 0.15) {
        imgData.data[idx] = 34 + r * 800; imgData.data[idx+1] = 139 - r * 200; imgData.data[idx+2] = 34;
      } else if (r < 0.4) {
        const t = (r - 0.15) / 0.25;
        imgData.data[idx] = 154 + t * 60; imgData.data[idx+1] = 205 - t * 30; imgData.data[idx+2] = 50 + t * 100;
      } else if (r < 0.7) {
        const t = (r - 0.4) / 0.3;
        imgData.data[idx] = 214 - t * 40; imgData.data[idx+1] = 175 - t * 30; imgData.data[idx+2] = 50 + t * 100;
      } else {
        imgData.data[idx] = 174 + r * 80; imgData.data[idx+1] = 145 + r * 100; imgData.data[idx+2] = 150 + r * 100;
      }
      imgData.data[idx+3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Contour lines (Marching Squares)
  const intervals = [100, 200, 300, 400, 500, 600, 700, 800];
  intervals.forEach(interval => {
    ctx.strokeStyle = interval % 200 === 0 ? 'rgba(50,30,0,0.6)' : 'rgba(80,60,30,0.35)';
    ctx.lineWidth = interval % 200 === 0 ? 1.2 : 0.6;
    ctx.beginPath();

    for (let y = 0; y < H - step; y += step) {
      for (let x = 0; x < W - step; x += step) {
        const h00 = getHeight(x, y, presetId);
        const h10 = getHeight(x + step, y, presetId);
        const h01 = getHeight(x, y + step, presetId);
        const h11 = getHeight(x + step, y + step, presetId);

        // Check 4 edges
        const drawEdge = (ax: number, ay: number, ah: number, bx: number, by: number, bh: number) => {
          if ((ah < interval && bh >= interval) || (ah >= interval && bh < interval)) {
            const t = (interval - ah) / (bh - ah);
            ctx.moveTo(ax + (bx-ax)*t, ay + (by-ay)*t);
            ctx.lineTo(ax + (bx-ax)*t + 1, ay + (by-ay)*t + 1);
          }
        };
        drawEdge(x, y, h00, x+step, y, h10);       // top
        drawEdge(x, y, h00, x, y+step, h01);       // left
        drawEdge(x+step, y, h10, x+step, y+step, h11); // right
        drawEdge(x, y+step, h01, x+step, y+step, h11); // bottom
      }
    }
    ctx.stroke();
  });

  // Peak label
  let peakH = 0, px = 0, py = 0;
  for (let y = 20; y < H - 20; y += 5) {
    for (let x = 20; x < W - 20; x += 5) {
      const h = getHeight(x, y, presetId);
      if (h > peakH) { peakH = h; px = x; py = y; }
    }
  }
  ctx.fillStyle = '#333';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(`▲ ${Math.round(peakH)}m`, px + 6, py - 4);
}

/* ============ 地形信息 ============ */
const terrainInfo: Record<string, { name: string; desc: string; tips: string[] }> = {
  mountain: {
    name: '山地 (Mountain)',
    desc: '中间高四周低，等高线呈闭合圆形，数值内高外低。等高线密集处坡度陡，稀疏处坡度缓。',
    tips: ['等高线密集→陡坡', '等高线稀疏→缓坡', '闭合圆内高外低→山峰'],
  },
  basin: {
    name: '盆地 (Basin)',
    desc: '四周高中间低，等高线闭合，数值外高内低。如四川盆地、塔里木盆地。',
    tips: ['闭合圆外高内低→盆地', '边缘陡峭，底部平坦', '常为人口密集区'],
  },
  valley: {
    name: '山谷 (Valley)',
    desc: '两山之间低洼地带，等高线向高值凸出（凸高为谷）。常有河流发育，是集水区。',
    tips: ['凸高为谷→可能有河流', '等高线向大数弯曲', '山谷线=集水线'],
  },
  ridge: {
    name: '山脊 (Ridge)',
    desc: '等高线向低值凸出（凸低为脊）。山脊是分水岭，两侧水流相背而流。',
    tips: ['凸低为脊→分水岭', '等高线向小数弯曲', '山脊线=分水线'],
  },
  saddle: {
    name: '鞍部 (Saddle)',
    desc: '两山顶之间相对低洼处，形似马鞍。是翻越山脊的最佳通道，常有道路经过。',
    tips: ['两峰之间最低处', '翻山通道', '等高线呈8字形'],
  },
  plateau: {
    name: '高原 (Plateau)',
    desc: '顶部平坦广阔（等高线稀疏），边缘陡峭下降（等高线密集）。如青藏高原。',
    tips: ['顶部等高线稀疏→平坦', '边缘等高线密集→陡崖', '海拔高但起伏小'],
  },
  escarpment: {
    name: '陡崖 (Escarpment)',
    desc: '多条等高线重叠或密集排列，表示近垂直的陡坡。陡崖处适宜攀岩、瀑布发育。',
    tips: ['等高线重叠→陡崖', '可用公式算相对高度', '(n-1)d≤H<(n+1)d'],
  },
};

/* ============ 高考考点数据 ============ */
const gaokaoPoints = [
  '等高线密集→陡坡；稀疏→缓坡',
  '凸高为谷（向高值凸）→河流；凸低为脊（向低值凸）→分水岭',
  '闭合内高外低→山峰；内低外高→盆地',
  '两峰间低洼→鞍部（通道）',
  '多条等高线重叠→陡崖，相对高度(n-1)d≤H<(n+1)d',
  '等高距=高差÷(等高线条数-1)',
  '气温垂直递减率：0.6°C/100m',
];

const TerrainProfile: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const contourRef = useRef<HTMLCanvasElement>(null);
  const profileRef = useRef<HTMLCanvasElement>(null);
  const [presetId, setPresetId] = useState('mountain');
  const [tab, setTab] = useState(0);
  const [ptA, setPtA] = useState<{x:number;y:number}|null>(null);
  const [ptB, setPtB] = useState<{x:number;y:number}|null>(null);
  const [vexag, setVexag] = useState(1);
  const [epoints, setEpoints] = useState<{x:number;y:number;h:number}[]>([]);
  const info = terrainInfo[presetId];

  const redrawContour = useCallback(() => {
    const cvs = contourRef.current; if (!cvs) return;
    const ctx = cvs.getContext('2d'); if (!ctx) return;
    drawContourMap(ctx, presetId);

    // Elevation point markers
    epoints.forEach(ep => {
      ctx.fillStyle = '#FF5722'; ctx.beginPath(); ctx.arc(ep.x, ep.y, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#FFF'; ctx.font = 'bold 8px sans-serif';
      ctx.fillText(`${Math.round(ep.h)}`, ep.x-10, ep.y-6);
    });

    // Profile line A-B
    if (ptA && ptB) {
      ctx.strokeStyle = '#F57C00'; ctx.lineWidth = 2.5; ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(ptA.x, ptA.y); ctx.lineTo(ptB.x, ptB.y); ctx.stroke();
      ctx.setLineDash([]);
      [{p:ptA,l:'A',c:'#F57C00'},{p:ptB,l:'B',c:'#1565C0'}].forEach(({p,l,c}) => {
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#FFF'; ctx.font = 'bold 12px sans-serif';
        ctx.fillText(l, p.x-4, p.y-9);
      });
    }
  }, [presetId, ptA, ptB, epoints]);

  const redrawProfile = useCallback(() => {
    const cvs = profileRef.current; if (!cvs) return;
    const ctx = cvs.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, PW, PH);
    ctx.fillStyle = '#fafafa'; ctx.fillRect(0, 0, PW, PH);

    // Axes
    const mx = 40, my = PH - 30, cw = PW - 60, ch = PH - 60;
    ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(PW-10, my); ctx.moveTo(mx, my); ctx.lineTo(mx, 10); ctx.stroke();
    ctx.fillStyle = '#555'; ctx.font = '10px sans-serif';
    ctx.fillText('距离 →', PW-45, my-5); ctx.fillText('海拔(m)', 2, 18);

    if (!ptA || !ptB) {
      ctx.fillStyle = '#999'; ctx.font = '13px sans-serif';
      ctx.fillText('🖱️ 在左侧等高线图上点击两点', 50, PH/2-6);
      return;
    }

    const dx = ptB.x - ptA.x, dy = ptB.y - ptA.y;
    const totalDist = Math.sqrt(dx*dx + dy*dy);
    if (totalDist < 5) return;

    const pts: {x:number;h:number}[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = i/100;
      pts.push({x: mx + t*cw, h: getHeight(ptA.x+dx*t, ptA.y+dy*t, presetId)});
    }
    const maxH = Math.max(...pts.map(p=>p.h), 100);
    const vs = vexag;

    // Fill
    ctx.beginPath(); ctx.moveTo(mx, my);
    pts.forEach(p => ctx.lineTo(p.x, my - (p.h/maxH)*ch*vs));
    ctx.lineTo(mx + cw, my); ctx.closePath();
    const grad = ctx.createLinearGradient(0,0,0,PH);
    grad.addColorStop(0, 'rgba(46,125,50,0.65)'); grad.addColorStop(1, 'rgba(46,125,50,0.08)');
    ctx.fillStyle = grad; ctx.fill();

    // Line
    ctx.beginPath();
    pts.forEach((p,i) => {
      const y = my - (p.h/maxH)*ch*vs;
      i===0 ? ctx.moveTo(p.x, y) : ctx.lineTo(p.x, y);
    });
    ctx.strokeStyle = '#2E7D32'; ctx.lineWidth = 2.5; ctx.stroke();

    // Y labels + grid
    ctx.fillStyle = '#555'; ctx.font = '9px sans-serif';
    for (let i = 0; i <= 4; i++) {
      const val = Math.round(maxH*i/4);
      const y = my - (val/maxH)*ch*vs;
      ctx.fillText(`${val}`, 4, y+3);
      ctx.strokeStyle = '#eee'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(mx, y); ctx.lineTo(PW-10, y); ctx.stroke();
    }

    // Distance markers
    ctx.fillStyle = '#999'; ctx.font = '8px sans-serif';
    for (let i = 0; i <= 4; i++) {
      const dist = Math.round(totalDist*i/4);
      const x = mx + cw*i/4;
      ctx.fillText(`${dist}`, x-10, my+14);
    }

    if (vs !== 1) {
      ctx.fillStyle = '#F57C00'; ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`垂直夸大 ×${vs.toFixed(1)}`, PW-120, 16);
    }
  }, [ptA, ptB, presetId, vexag]);

  useEffect(() => { redrawContour(); }, [redrawContour]);
  useEffect(() => { redrawProfile(); }, [redrawProfile]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const {x, y} = getCanvasCoords(e.currentTarget, e);
    const h = getHeight(x, y, presetId);
    if (ptA && ptB) { setEpoints(prev => [...prev.slice(-10), {x,y,h}]); return; }
    if (!ptA || (ptA && ptB)) { setPtA({x,y}); setPtB(null); setEpoints([]); }
    else { setPtB({x,y}); }
  };

  return (
    <ToolPageLayout title="地形剖面生成器" exportRef={exportRef}>
      {/* ======== 上: 地图 (2列) ======== */}
      <Box ref={exportRef} sx={{display:'flex',flexDirection:{xs:'column',md:'row'},gap:2,width:'100%'}}>
        <Box sx={{flex:'1 1 460px'}}>
          <Box sx={{display:'flex',alignItems:'center',gap:1,mb:1,flexWrap:'wrap'}}>
            <FormControl size="small" sx={{minWidth:140}}>
              <InputLabel>地形</InputLabel>
              <Select value={presetId} label="地形" onChange={e=>{setPresetId(e.target.value);setPtA(null);setPtB(null);setEpoints([]);}}>
                {terrainPresets.map(p=><MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="outlined" size="small" onClick={()=>{setPtA(null);setPtB(null);setEpoints([]);}}>重置</Button>
            <Button variant="outlined" size="small" color="warning" onClick={()=>setEpoints([])}>清除标注</Button>
          </Box>
          <Typography variant="caption" sx={{color:'#666',display:'block',mb:0.5}}>
            🖱️ 点第1次=A · 点第2次=B · 之后点击标注高程
          </Typography>
          <canvas ref={contourRef} width={W} height={H} onClick={handleClick}
            style={{border:'1px solid #ddd',borderRadius:8,cursor:'crosshair',maxWidth:'100%'}} />
        </Box>

        <Box sx={{flex:'1 1 460px',display:'flex',flexDirection:'column',gap:1}}>
          <Typography variant="subtitle2" sx={{fontWeight:700}}>地形剖面图</Typography>
          <canvas ref={profileRef} width={PW} height={PH}
            style={{border:'1px solid #ddd',borderRadius:8,maxWidth:'100%',background:'#fafafa'}} />
          <Typography variant="subtitle2" sx={{fontWeight:600,fontSize:13}}>📐 垂直夸大系数</Typography>
          <Slider value={vexag} onChange={(_,v)=>setVexag(v as number)} min={0.5} max={3} step={0.25}
            size="small" marks={[{value:1,label:'×1'},{value:2,label:'×2'},{value:3,label:'×3'}]} valueLabelDisplay="auto" />

          {/* 地形说明 + 技巧 */}
          <Card sx={{bgcolor:'#e8f5e9',border:'1px solid #a5d6a7'}}>
            <CardContent sx={{p:1.5,'&:last-child':{pb:1.5}}}>
              <Typography variant="subtitle2" sx={{fontWeight:700,color:'#2E7D32'}}>{info.name}</Typography>
              <Typography variant="body2" sx={{fontSize:12.5,mt:0.3}}>{info.desc}</Typography>
              <Box sx={{display:'flex',flexWrap:'wrap',gap:0.5,mt:0.5}}>
                {info.tips.map((t,i)=><Box key={i} sx={{fontSize:11,color:'#555',bgcolor:'#fff',px:1,py:0.3,borderRadius:1}}>💡 {t}</Box>)}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* ======== 下: 知识区(标签切换) ======== */}
      <Box sx={{mt:3,width:'100%'}}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{mb:2,'& .MuiTab-root':{minWidth:80,fontSize:13,fontWeight:600,textTransform:'none'}}}>
          <Tab label="🎓 高考考点"/>
          <Tab label="📖 判读步骤"/>
          <Tab label="📐 坡度计算"/>
          <Tab label="🗺️ 地形速查"/>
        </Tabs>

        {tab === 0 && (
          <Card sx={{bgcolor:'#E3F2FD',border:'1px solid #90CAF9'}}>
            <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
              <Typography variant="subtitle1" sx={{fontWeight:700,color:'#1565C0',mb:1}}>🎓 高考考点：等高线判读</Typography>
              {gaokaoPoints.map((t,i)=>(
                <Typography key={i} variant="body2" sx={{fontSize:13,mb:0.4,pl:1,borderLeft:'3px solid #1565C0'}}>{t}</Typography>
              ))}
            </CardContent>
          </Card>
        )}

        {tab === 1 && (
          <Card sx={{bgcolor:'#FFF3E0',border:'1px solid #FFE082'}}>
            <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
              <Typography variant="subtitle1" sx={{fontWeight:700,color:'#E65100',mb:1}}>📖 等高线地图判读五步法</Typography>
              {[
                {s:'1',t:'看图名和图例',d:'了解地图类型，明确图例符号含义（等高线、河流、居民点等）。'},
                {s:'2',t:'看等高距',d:'确定相邻等高线高程差。中国1:5万地形图等高距通常为10m或20m。'},
                {s:'3',t:'判读地形部位',d:'识别山峰/山脊/山谷/鞍部/陡崖/盆地等地形部位。口诀：凸高为谷，凸低为脊。'},
                {s:'4',t:'计算高差',d:'相对高度=最高点-最低点。陡崖：(n-1)d≤H<(n+1)d（n=重叠等高线条数）。'},
                {s:'5',t:'确定方向',d:'利用指向标或"上北下南"原则，分析地形对河流/聚落/交通的影响。'},
              ].map((st,i)=>(
                <Box key={i} sx={{mb:1}}>
                  <Typography variant="body2" sx={{fontWeight:700,color:'#BF360C',fontSize:13}}>Step {st.s}：{st.t}</Typography>
                  <Typography variant="body2" sx={{fontSize:12.5,color:'#555'}}>{st.d}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        {tab === 2 && (
          <Card sx={{bgcolor:'#E8F5E9',border:'1px solid #A5D6A7'}}>
            <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
              <Typography variant="subtitle1" sx={{fontWeight:700,color:'#2E7D32',mb:1}}>📐 坡度计算</Typography>
              <Typography variant="body2" sx={{fontSize:13,mb:1}}>
                <b>公式：</b>tan α = 高差 ÷ 水平距离。坡度百分比 = (高差/水平距离)×100%。气温递减率 0.6°C/100m。
              </Typography>
              {[
                ['平坡 0-5°','<9%','城建/农耕/交通'],
                ['缓坡 5-15°','9-27%','梯田耕作/低层建筑'],
                ['陡坡 15-25°','27-47%','限制耕作/水土保持'],
                ['急坡 >25°','>47%','退耕还林(法律强制)'],
              ].map((r,i)=>(
                <Box key={i} sx={{display:'flex',gap:2,py:0.5,borderBottom:'1px solid #e8f5e9'}}>
                  <Typography variant="body2" sx={{fontWeight:600,minWidth:90,fontSize:13}}>{r[0]}</Typography>
                  <Typography variant="body2" sx={{minWidth:60,fontSize:13}}>{r[1]}</Typography>
                  <Typography variant="body2" sx={{fontSize:13,color:'#555'}}>{r[2]}</Typography>
                </Box>
              ))}
              <Typography variant="caption" sx={{color:'#757575',mt:1,display:'block',fontSize:12}}>
                💡 《水土保持法》规定25°以上坡耕地须退耕还林还草。陡崖高度：(n-1)×等高距 ≤ H &lt; (n+1)×等高距。
              </Typography>
            </CardContent>
          </Card>
        )}

        {tab === 3 && (
          <Card sx={{bgcolor:'#e0f2f1',border:'1px solid #80cbc4'}}>
            <CardContent sx={{p:2,'&:last-child':{pb:2}}}>
              <Typography variant="subtitle1" sx={{fontWeight:700,color:'#00695c',mb:1}}>🗺️ 五种基本地形特征</Typography>
              <Box sx={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead>
                    <tr style={{backgroundColor:'#b2dfdb'}}>
                      <th style={{border:'1px solid #80cbc4',padding:5}}>类型</th>
                      <th style={{border:'1px solid #80cbc4',padding:5}}>海拔</th>
                      <th style={{border:'1px solid #80cbc4',padding:5}}>等高线</th>
                      <th style={{border:'1px solid #80cbc4',padding:5}}>起伏</th>
                      <th style={{border:'1px solid #80cbc4',padding:5}}>中国代表</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['平原','<200m','稀疏平直','宽广平坦','东北/华北/长江中下游'],
                      ['丘陵','<500m','较密弯曲','起伏和缓','东南丘陵/山东/辽东'],
                      ['山地','>500m','密集','起伏大','秦岭/太行/横断山'],
                      ['高原','>500m','顶部稀疏/边缘密集','顶平边陡','青藏/内蒙古/黄土/云贵'],
                      ['盆地','不定','闭合外高内低','四周高中间低','四川/塔里木/准噶尔'],
                    ].map((r,i)=>(
                      <tr key={i} style={{backgroundColor:i%2===0?'#fff':'#e0f2f1'}}>
                        <td style={{border:'1px solid #ddd',padding:5,fontWeight:600}}>{r[0]}</td>
                        <td style={{border:'1px solid #ddd',padding:5}}>{r[1]}</td>
                        <td style={{border:'1px solid #ddd',padding:5}}>{r[2]}</td>
                        <td style={{border:'1px solid #ddd',padding:5}}>{r[3]}</td>
                        <td style={{border:'1px solid #ddd',padding:5}}>{r[4]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </ToolPageLayout>
  );
};

export default TerrainProfile;
