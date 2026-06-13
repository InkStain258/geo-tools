import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import ToolPageLayout from '@/components/shared/ToolPageLayout';
import AnimationControls from '@/components/shared/AnimationControls';
import { oceanCurrents } from '@/data/terrainPresets';
import { getCanvasCoords } from '@/utils/canvasHelper';

// ─── Canvas dimensions ───
const W = 760;
const H = 450;
const PAD = 30;
const MAP_W = W - 2 * PAD; // 700
const MAP_H = H - 2 * PAD; // 390

// ─── Geo ↔ pixel conversion ───
/** Convert longitude (-180..180) to canvas x pixel */
function geoX(lon: number): number {
  return PAD + (lon + 180) / 360 * MAP_W;
}
/** Convert latitude (-90..90) to canvas y pixel */
function geoY(lat: number): number {
  return PAD + (90 - lat) / 180 * MAP_H;
}
/** Convert [lon, lat] to canvas [x, y] pixel pair */
function geoToPixel(lon: number, lat: number): [number, number] {
  return [geoX(lon), geoY(lat)];
}
/** Convert a full geo path to pixel path array */
function pathToPixels(path: [number, number][]): [number, number][] {
  return path.map(([lon, lat]) => geoToPixel(lon, lat));
}

// ─── Particle interface ───
interface Particle {
  pathIdx: number;
  t: number;
  speed: number;
}

// ══════════════════════════════════════════════════════════════
// CONTINENT OUTLINES — detailed simplified world map in [lon, lat]
// ══════════════════════════════════════════════════════════════

const continents: [number, number][][] = [
  // North America (mainland including Central America)
  [[-168, 64], [-162, 60], [-150, 60], [-140, 60], [-130, 55], [-123, 49],
   [-121, 37], [-117, 33], [-110, 25], [-100, 20], [-95, 18], [-88, 16],
   [-85, 12], [-83, 8], [-80, 7], [-78, 9], [-80, 15], [-82, 18], [-80, 25],
   [-75, 29], [-70, 35], [-67, 42], [-65, 45], [-60, 47], [-55, 50],
   [-60, 55], [-65, 58], [-72, 62], [-80, 58], [-85, 62], [-90, 65],
   [-97, 68], [-105, 70], [-115, 72], [-125, 70], [-135, 70], [-148, 68],
   [-158, 66], [-168, 64]],

  // South America
  [[-80, 10], [-75, 12], [-70, 8], [-62, 2], [-55, 0], [-50, -2],
   [-40, -5], [-35, -10], [-35, -20], [-38, -25], [-48, -28], [-55, -32],
   [-60, -40], [-65, -48], [-68, -53], [-72, -50], [-75, -45], [-75, -30],
   [-78, -15], [-80, -5], [-80, 10]],

  // Europe
  [[-10, 36], [-6, 37], [1, 43], [3, 42], [7, 44], [10, 44], [14, 40],
   [18, 40], [22, 42], [25, 37], [28, 42], [30, 46], [33, 44], [38, 50],
   [32, 55], [28, 58], [22, 60], [16, 62], [10, 60], [5, 58], [0, 53],
   [-5, 51], [-8, 50], [-10, 48], [-10, 36]],

  // Africa
  [[-17, 21], [-15, 25], [-10, 32], [-5, 36], [10, 37], [25, 33],
   [32, 30], [38, 25], [45, 15], [50, 10], [48, 5], [45, 0], [40, -5],
   [38, -10], [35, -17], [33, -22], [28, -30], [25, -34], [20, -35],
   [15, -30], [12, -20], [8, -5], [5, 5], [-5, 5], [-10, 5], [-15, 8],
   [-18, 15], [-17, 21]],

  // Asia (mainland)
  [[26, 41], [35, 42], [40, 48], [45, 50], [50, 52], [55, 52], [60, 55],
   [65, 55], [70, 55], [75, 55], [80, 53], [85, 50], [90, 45], [95, 40],
   [105, 35], [110, 30], [115, 25], [120, 22], [122, 28], [120, 35],
   [125, 40], [130, 43], [135, 45], [140, 48], [145, 50], [150, 52],
   [155, 55], [160, 60], [165, 65], [170, 68], [175, 70], [180, 68],
   [175, 62], [160, 60], [145, 60], [130, 62], [115, 65], [100, 67],
   [85, 70], [70, 70], [55, 72], [45, 70], [35, 65], [30, 60], [28, 52],
   [26, 41]],

  // India
  [[68, 24], [72, 18], [77, 12], [80, 8], [84, 14], [88, 22],
   [90, 25], [86, 28], [80, 28], [74, 26], [68, 24]],

  // Arabian Peninsula
  [[35, 28], [40, 25], [45, 18], [50, 15], [55, 18], [58, 22],
   [56, 28], [52, 30], [48, 28], [42, 30], [36, 28], [35, 28]],

  // Southeast Asia + Indonesia
  [[98, 18], [102, 14], [106, 10], [110, 2], [108, -2], [104, -4],
   [100, -2], [96, 5], [95, 12], [98, 18]],

  // Japan
  [[130, 31], [131, 33], [135, 35], [138, 37], [140, 40], [141, 43],
   [143, 44], [145, 42], [144, 38], [142, 35], [140, 33], [137, 31],
   [132, 31]],

  // Australia
  [[115, -20], [120, -15], [128, -13], [135, -15], [142, -15],
   [148, -22], [152, -25], [153, -28], [150, -33], [145, -35],
   [140, -36], [135, -34], [130, -32], [125, -27], [115, -24],
   [113, -26], [115, -20]],

  // New Zealand
  [[166, -35], [170, -37], [173, -40], [175, -43], [174, -45],
   [172, -43], [170, -40], [168, -37], [166, -35]],

  // Greenland
  [[-55, 60], [-48, 63], [-35, 67], [-22, 70], [-18, 72], [-20, 76],
   [-28, 80], [-38, 82], [-48, 80], [-55, 76], [-58, 70], [-56, 64]],

  // Antarctica (visible upper edge)
  [[-180, -66], [-120, -68], [-60, -65], [0, -68], [60, -65],
   [120, -68], [180, -66], [180, -85], [60, -85], [0, -85],
   [-60, -85], [-120, -85], [-180, -85]],

  // UK / Ireland
  [[-10, 50], [-6, 51], [-2, 52], [0, 54], [2, 56], [0, 58],
   [-2, 56], [-5, 58], [-8, 56], [-10, 54], [-10, 50]],

  // Madagascar
  [[44, -13], [48, -16], [50, -20], [50, -25], [46, -25],
   [44, -22], [43, -18], [44, -13]],

  // Philippines
  [[120, 13], [122, 10], [124, 8], [125, 12], [124, 16],
   [122, 18], [120, 16], [118, 14], [120, 13]],

  // Sri Lanka
  [[80, 6], [82, 6], [82, 8], [81, 9.5], [80, 9], [79, 8], [80, 6]],

  // Cuba
  [[-85, 20], [-83, 20], [-80, 21], [-78, 22], [-76, 22],
   [-74, 20], [-75, 19], [-78, 20], [-82, 19], [-85, 20]],

  // Iceland
  [[-24, 63], [-22, 64], [-18, 65], [-14, 66], [-13, 64],
   [-15, 63], [-20, 63], [-24, 63]],

  // Tasmania
  [[145, -41], [147, -40], [148, -42], [148, -44],
   [146, -44], [144, -43], [145, -41]],

  // Hainan
  [[109, 18], [110, 18], [111, 19], [111, 20],
   [110, 20], [109, 19], [109, 18]],

  // Taiwan
  [[120, 22], [121, 22], [122, 23], [122, 25],
   [121, 25], [120, 24], [120, 22]],

  // Korean Peninsula
  [[125, 35], [127, 34], [129, 35], [130, 38],
   [129, 41], [127, 42], [125, 40]],
];

// ═══════════════════════════════════════════
// GRID & SPECIAL LINES
// ═══════════════════════════════════════════

const LAT_GRID = [80, 60, 40, 20, 0, -20, -40, -60, -80];
const LON_GRID = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];

const EQUATOR = 0;
const TROPIC_CANCER = 23.5;
const TROPIC_CAPRICORN = -23.5;
const ARCTIC_CIRCLE = 66.5;
const ANTARCTIC_CIRCLE = -66.5;

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

const OceanCurrent: React.FC = () => {
  const exportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [selectedCurrent, setSelectedCurrent] = useState<string | null>(null);

  const particlesRef = useRef<Particle[]>([]);
  const progressRef = useRef(0);
  const playingRef = useRef(true);
  const speedRef = useRef(1);
  const selectedRef = useRef<string | null>(null);

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { selectedRef.current = selectedCurrent; }, [selectedCurrent]);

  // ── Initialize particles ──
  useEffect(() => {
    const particles: Particle[] = [];
    oceanCurrents.forEach((_, idx) => {
      for (let i = 0; i < 18; i++) {
        particles.push({
          pathIdx: idx,
          t: Math.random(),
          speed: 0.0015 + Math.random() * 0.002,
        });
      }
    });
    particlesRef.current = particles;
  }, []);

  // ── Animation loop ──
  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) { animRef.current = requestAnimationFrame(animate); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(animate); return; }

      ctx.clearRect(0, 0, W, H);

      // ────── Ocean background gradient ──────
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, H);
      oceanGrad.addColorStop(0, '#b3e5fc');
      oceanGrad.addColorStop(0.3, '#e1f5fe');
      oceanGrad.addColorStop(0.7, '#e1f5fe');
      oceanGrad.addColorStop(1, '#b3e5fc');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, W, H);

      // ────── Latitude grid lines + labels ──────
      ctx.strokeStyle = 'rgba(180,180,180,0.45)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(90,90,90,0.7)';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (const lat of LAT_GRID) {
        const y = geoY(lat);
        ctx.beginPath();
        ctx.moveTo(PAD, y);
        ctx.lineTo(W - PAD, y);
        ctx.stroke();
        const label = lat === 0 ? '0°' : lat > 0 ? `${lat}°N` : `${-lat}°S`;
        ctx.fillText(label, PAD - 4, y);
      }

      // ────── Longitude grid lines + labels ──────
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (const lon of LON_GRID) {
        const x = geoX(lon);
        ctx.beginPath();
        ctx.moveTo(x, PAD);
        ctx.lineTo(x, H - PAD);
        ctx.stroke();
        const label = lon === 0 ? '0°' : lon > 0 ? `${lon}°E` : `${-lon}°W`;
        ctx.fillText(label, x, H - PAD + 4);
      }

      // ────── Equator — solid red ──────
      const eqY = geoY(EQUATOR);
      ctx.strokeStyle = '#E53935';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(PAD, eqY);
      ctx.lineTo(W - PAD, eqY);
      ctx.stroke();
      ctx.fillStyle = '#E53935';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('赤道 0°', W - PAD - 70, eqY - 6);

      // ────── Tropics — dashed orange ──────
      ctx.strokeStyle = 'rgba(245,124,0,0.55)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      const cancerY = geoY(TROPIC_CANCER);
      ctx.beginPath();
      ctx.moveTo(PAD, cancerY);
      ctx.lineTo(W - PAD, cancerY);
      ctx.stroke();
      ctx.fillStyle = '#F57C00';
      ctx.font = '9px sans-serif';
      ctx.fillText('北回归线 23.5°N', W - PAD - 115, cancerY - 3);

      const capricornY = geoY(TROPIC_CAPRICORN);
      ctx.beginPath();
      ctx.moveTo(PAD, capricornY);
      ctx.lineTo(W - PAD, capricornY);
      ctx.stroke();
      ctx.fillText('南回归线 23.5°S', W - PAD - 115, capricornY + 12);

      // ────── Arctic / Antarctic Circles — dashed blue ──────
      ctx.strokeStyle = 'rgba(66,165,245,0.50)';
      ctx.setLineDash([4, 6]);
      const arcticY = geoY(ARCTIC_CIRCLE);
      ctx.beginPath();
      ctx.moveTo(PAD, arcticY);
      ctx.lineTo(W - PAD, arcticY);
      ctx.stroke();
      ctx.fillStyle = '#1565C0';
      ctx.fillText('北极圈 66.5°N', W - PAD - 110, arcticY - 3);

      const antarcticY = geoY(ANTARCTIC_CIRCLE);
      ctx.beginPath();
      ctx.moveTo(PAD, antarcticY);
      ctx.lineTo(W - PAD, antarcticY);
      ctx.stroke();
      ctx.fillText('南极圈 66.5°S', W - PAD - 110, antarcticY + 12);
      ctx.setLineDash([]);

      // ────── Continents — fill + stroke ──────
      continents.forEach((geoPts) => {
        ctx.beginPath();
        const [sx, sy] = geoToPixel(geoPts[0][0], geoPts[0][1]);
        ctx.moveTo(sx, sy);
        for (let i = 1; i < geoPts.length; i++) {
          const [px, py] = geoToPixel(geoPts[i][0], geoPts[i][1]);
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = '#c8e6c9';
        ctx.fill();
        ctx.strokeStyle = '#81c784';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // ────── Continent labels ──────
      ctx.fillStyle = '#2E7D32';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('亚洲', geoX(95), geoY(50));
      ctx.fillText('非洲', geoX(20), geoY(5));
      ctx.fillText('北美', geoX(-105), geoY(48));
      ctx.fillText('南美', geoX(-60), geoY(-15));
      ctx.fillText('欧洲', geoX(10), geoY(52));
      ctx.fillText('大洋洲', geoX(135), geoY(-25));
      ctx.fillText('南极洲', geoX(0), geoY(-80));

      // ────── Draw current paths, arrows, name tags ──────
      oceanCurrents.forEach((current) => {
        const pxPath = pathToPixels(current.path);
        const color = current.type === 'warm' ? '#ef5350' : '#42A5F5';

        // Dashed current path
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(pxPath[0][0], pxPath[0][1]);
        for (let i = 1; i < pxPath.length; i++) {
          ctx.lineTo(pxPath[i][0], pxPath[i][1]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow at end of path
        const last = pxPath[pxPath.length - 1];
        const prev = pxPath[Math.max(0, pxPath.length - 2)];
        const angle = Math.atan2(last[1] - prev[1], last[0] - prev[0]);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(last[0], last[1]);
        ctx.lineTo(
          last[0] - 10 * Math.cos(angle - 0.5),
          last[1] - 10 * Math.sin(angle - 0.5)
        );
        ctx.lineTo(
          last[0] - 10 * Math.cos(angle + 0.5),
          last[1] - 10 * Math.sin(angle + 0.5)
        );
        ctx.closePath();
        ctx.fill();

        // Name tag near midpoint
        const mid = pxPath[Math.floor(pxPath.length / 2)];
        ctx.fillStyle = current.type === 'warm' ? '#c62828' : '#0D47A1';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        const shortName = current.name
          .replace(/（.*?）/, '')
          .replace(/\(.*?\)/, '');
        ctx.fillText(shortName, mid[0], mid[1] - 8);
      });

      // ────── Animated particles ──────
      if (playingRef.current) {
        particlesRef.current.forEach((p) => {
          p.t += p.speed * speedRef.current;
          if (p.t > 1) p.t -= 1;
          const current = oceanCurrents[p.pathIdx];
          const pxPath = pathToPixels(current.path);
          const totalSegs = pxPath.length - 1;
          if (totalSegs <= 0) return;
          const segIdx = Math.min(Math.floor(p.t * totalSegs), totalSegs - 1);
          const segT = (p.t * totalSegs) - segIdx;

          const px =
            pxPath[segIdx][0] +
            (pxPath[segIdx + 1][0] - pxPath[segIdx][0]) * segT;
          const py =
            pxPath[segIdx][1] +
            (pxPath[segIdx + 1][1] - pxPath[segIdx][1]) * segT;

          const baseColor =
            current.type === 'warm' ? [239, 83, 80] : [66, 165, 245];
          ctx.fillStyle = `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},${
            0.4 + segT * 0.6
          })`;
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
        progressRef.current =
          (progressRef.current + 0.08 * speedRef.current) % 100;
      }

      // ────── Highlight selected current ──────
      if (selectedRef.current) {
        const sc = oceanCurrents.find((c) => c.id === selectedRef.current);
        if (sc) {
          const pxPath = pathToPixels(sc.path);
          ctx.strokeStyle = sc.type === 'warm' ? '#b71c1c' : '#0D47A1';
          ctx.lineWidth = 4;
          ctx.shadowColor =
            sc.type === 'warm' ? '#ff8a80' : '#82b1ff';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(pxPath[0][0], pxPath[0][1]);
          for (let i = 1; i < pxPath.length; i++) {
            ctx.lineTo(pxPath[i][0], pxPath[i][1]);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // ────── Legend ──────
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(W - 140, 5, 135, 45);
      ctx.strokeStyle = '#bbb';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(W - 140, 5, 135, 45);

      ctx.fillStyle = '#c62828';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('● 暖流 (向高纬)', W - 135, 10);
      ctx.fillStyle = '#0D47A1';
      ctx.fillText('● 寒流 (向低纬)', W - 135, 30);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // ── Progress sync ──
  useEffect(() => {
    if (!playing) {
      setProgress(progressRef.current);
      return;
    }
    const sync = setInterval(() => setProgress(progressRef.current), 100);
    return () => clearInterval(sync);
  }, [playing]);

  // ── Click-to-select: find nearest current path ──
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x: mx, y: my } = getCanvasCoords(e.currentTarget, e);
      let found: string | null = null;
      let minDist = Infinity;
      oceanCurrents.forEach((c) => {
        const pxPath = pathToPixels(c.path);
        pxPath.forEach(([px, py]) => {
          const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);
          if (dist < 35 && dist < minDist) {
            minDist = dist;
            found = c.id;
          }
        });
      });
      setSelectedCurrent(found);
    },
    []
  );

  // ── Selected current info ──
  const sc = selectedCurrent
    ? oceanCurrents.find((c) => c.id === selectedCurrent)
    : null;

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════
  return (
    <ToolPageLayout title="洋流动态模拟" exportRef={exportRef}>
      <Box
        ref={exportRef}
        sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onClick={handleCanvasClick}
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            maxWidth: '100%',
            cursor: 'pointer',
          }}
        />
        <AnimationControls
          playing={playing}
          speed={speed}
          progress={progress}
          onPlayPause={() => setPlaying(!playing)}
          onSpeedChange={setSpeed}
          onProgressChange={setProgress}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
          <Typography variant="body2" sx={{ color: '#c62828', fontWeight: 600 }}>
            ● 暖流（赤道→高纬，增温增湿）
          </Typography>
          <Typography variant="body2" sx={{ color: '#0D47A1', fontWeight: 600 }}>
            ● 寒流（高纬/深海→低纬，降温减湿）
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {oceanCurrents.map((c) => (
            <Box
              key={c.id}
              onClick={() =>
                setSelectedCurrent(c.id === selectedCurrent ? null : c.id)
              }
              sx={{
                px: 1,
                py: 0.3,
                borderRadius: 1,
                cursor: 'pointer',
                fontSize: 11,
                bgcolor:
                  c.id === selectedCurrent
                    ? c.type === 'warm'
                      ? '#ffebee'
                      : '#e3f2fd'
                    : '#f5f5f5',
                border: '1px solid',
                borderColor:
                  c.id === selectedCurrent
                    ? c.type === 'warm'
                      ? '#ef5350'
                      : '#42A5F5'
                    : '#e0e0e0',
                fontWeight: c.id === selectedCurrent ? 700 : 400,
              }}
            >
              {c.name.replace(/（.*?）/, '')}
            </Box>
          ))}
        </Box>
        {sc && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: sc.type === 'warm' ? '#ffebee' : '#e3f2fd',
              border: '2px solid',
              borderColor: sc.type === 'warm' ? '#ef5350' : '#42A5F5',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: sc.type === 'warm' ? '#c62828' : '#0D47A1',
              }}
            >
              {sc.name} {sc.type === 'warm' ? '【暖流】' : '【寒流】'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.8 }}>
              {sc.description}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1, color: '#666', fontStyle: 'italic' }}
            >
              💡 洋流性质：
              {sc.type === 'warm'
                ? '暖流从低纬度流向高纬度，水温高于所经海区，对沿岸气候起增温增湿作用。'
                : '寒流从高纬度流向低纬度（或深层冷水上泛），水温低于所经海区，对沿岸气候起降温减湿作用。'}
            </Typography>
          </Box>
        )}
      </Box>
    </ToolPageLayout>
  );
};

export default OceanCurrent;
