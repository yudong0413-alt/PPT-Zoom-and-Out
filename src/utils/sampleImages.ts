/**
 * High-detail procedural sample images created via HTML5 Canvas.
 * Provides immediate out-of-the-box test images with fine details
 * (perfect for demonstrating zoom-out from a micro focal point).
 */

export interface SampleImagePreset {
  id: string;
  name: string;
  description: string;
  focalPoint: { x: number; y: number }; // normalized 0..1
  initialZoom: number; // e.g. 5x
  generator: () => string; // returns data URL
}

// Cache generated data URLs to avoid regenerating
const sampleCache: Record<string, string> = {};

export function getSampleArtCanvas(): string {
  if (sampleCache['art']) return sampleCache['art'];

  const width = 1920;
  const height = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Background deep gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(0.5, '#131e32');
  bgGrad.addColorStop(1, '#0b1220');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Geometric grid patterns & decorative landscape
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Nebula / mountain shapes
  const mountainGrad = ctx.createLinearGradient(0, 400, 0, height);
  mountainGrad.addColorStop(0, '#1e1b4b');
  mountainGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = mountainGrad;
  ctx.beginPath();
  ctx.moveTo(0, 750);
  ctx.bezierCurveTo(400, 550, 700, 850, 1100, 600);
  ctx.bezierCurveTo(1400, 450, 1700, 700, width, 650);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fill();

  // Floating architecture / metropolis silhouette
  for (let i = 0; i < 40; i++) {
    const bx = 100 + i * 44;
    const bh = 150 + Math.sin(i * 1.3) * 180 + Math.cos(i * 2.1) * 80;
    const bw = 32 + (i % 3) * 8;
    const by = height - bh - 100;

    const bGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
    bGrad.addColorStop(0, '#312e81');
    bGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bGrad;
    ctx.fillRect(bx, by, bw, bh);

    // Glowing windows
    ctx.fillStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.7)' : 'rgba(147, 197, 253, 0.7)';
    for (let wy = by + 12; wy < by + bh - 20; wy += 16) {
      for (let wx = bx + 6; wx < bx + bw - 6; wx += 10) {
        if ((wx + wy) % 5 === 0) {
          ctx.fillRect(wx, wy, 4, 6);
        }
      }
    }
  }

  // Giant glowing moon/ring in background
  const moonX = 1450;
  const moonY = 320;
  const moonR = 180;
  const moonGrad = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, moonR);
  moonGrad.addColorStop(0, '#fef08a');
  moonGrad.addColorStop(0.4, '#f59e0b');
  moonGrad.addColorStop(0.8, '#d97706');
  moonGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();

  // THE SECRET FOCAL POINT: A miniature glowing crystal observatory on a peak (at x: 450, y: 580)
  const fx = 450;
  const fy = 580;

  // Crystal tower pedestal
  ctx.fillStyle = '#4338ca';
  ctx.fillRect(fx - 24, fy - 10, 48, 50);

  // Intricate glowing core
  const coreGrad = ctx.createRadialGradient(fx, fy - 35, 2, fx, fy - 35, 25);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.3, '#38bdf8');
  coreGrad.addColorStop(0.7, '#6366f1');
  coreGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(fx, fy - 35, 25, 0, Math.PI * 2);
  ctx.fill();

  // Fine detail: Tiny astronomer figure with telescope!
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(fx + 8, fy - 30, 4, 14); // body
  ctx.beginPath();
  ctx.arc(fx + 10, fy - 33, 3, 0, Math.PI * 2); // head
  ctx.fill();

  // Telescope pointing up-right
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(fx + 10, fy - 26);
  ctx.lineTo(fx + 24, fy - 40);
  ctx.stroke();

  // Tiny beacon beam
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(fx + 24, fy - 40);
  ctx.lineTo(moonX, moonY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Title / caption at bottom left for realism
  ctx.font = '600 24px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText('Project Starlight: Deep Observatory Horizon', 60, height - 50);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  sampleCache['art'] = dataUrl;
  return dataUrl;
}

export function getSampleNatureCanvas(): string {
  if (sampleCache['nature']) return sampleCache['nature'];

  const width = 1920;
  const height = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Soft lush garden backdrop
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, '#064e3b');
  bg.addColorStop(0.5, '#065f46');
  bg.addColorStop(1, '#022c22');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Soft bokeh circles
  for (let i = 0; i < 45; i++) {
    const bx = Math.sin(i * 19) * 900 + 960;
    const by = Math.cos(i * 31) * 500 + 540;
    const br = 40 + (i % 7) * 25;
    const bGrad = ctx.createRadialGradient(bx, by, 5, bx, by, br);
    bGrad.addColorStop(0, 'rgba(167, 243, 208, 0.25)');
    bGrad.addColorStop(1, 'rgba(167, 243, 208, 0)');
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  // Branch sweeping across
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 26;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(100, 850);
  ctx.quadraticCurveTo(600, 700, 1100, 480);
  ctx.quadraticCurveTo(1500, 350, 1850, 400);
  ctx.stroke();

  // Sub-branch
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(950, 520);
  ctx.quadraticCurveTo(1150, 620, 1400, 660);
  ctx.stroke();

  // Blossom flowers
  const flowerPositions = [
    { x: 500, y: 720 },
    { x: 750, y: 610 },
    { x: 1050, y: 490 },
    { x: 1350, y: 390 },
    { x: 1600, y: 370 },
  ];

  flowerPositions.forEach((pos, idx) => {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    const petals = 6;
    for (let p = 0; p < petals; p++) {
      ctx.rotate((Math.PI * 2) / petals);
      ctx.fillStyle = idx % 2 === 0 ? '#fbcfe8' : '#f472b6';
      ctx.beginPath();
      ctx.ellipse(0, 32, 14, 28, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Flower center
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // FOCAL POINT: A detailed tiny Ladybug / Beetle resting on the flower at (1050, 490)
  const lx = 1045;
  const ly = 465;

  // Ladybug body
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.ellipse(lx, ly, 18, 14, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(lx - 16, ly - 3, 7, 0, Math.PI * 2);
  ctx.fill();

  // Wing divide line
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(lx - 12, ly - 2);
  ctx.lineTo(lx + 18, ly + 2);
  ctx.stroke();

  // Distinct black spots
  ctx.fillStyle = '#0f172a';
  const spots = [
    { x: lx - 5, y: ly - 6 },
    { x: lx + 7, y: ly - 5 },
    { x: lx - 3, y: ly + 6 },
    { x: lx + 8, y: ly + 5 },
  ];
  spots.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Tiny glint of light on the shell
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(lx - 2, ly - 7, 2, 0, Math.PI * 2);
  ctx.fill();

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  sampleCache['nature'] = dataUrl;
  return dataUrl;
}

export const SAMPLE_PRESETS: SampleImagePreset[] = [
  {
    id: 'starlight',
    name: '천문대와 비밀의 신호',
    description: '광활한 미래 도시와 산맥 위 작은 천문대 망원경에서 줌아웃',
    focalPoint: { x: 450 / 1920, y: 580 / 1080 }, // approx (0.234, 0.537)
    initialZoom: 5.5,
    generator: getSampleArtCanvas,
  },
  {
    id: 'nature',
    name: '봄꽃과 무당벌레의 비밀',
    description: '꽃잎 위 작은 무당벌레의 디테일에서 전체 봄 정원으로 줌아웃',
    focalPoint: { x: 1045 / 1920, y: 465 / 1080 }, // approx (0.544, 0.430)
    initialZoom: 6.0,
    generator: getSampleNatureCanvas,
  },
];
