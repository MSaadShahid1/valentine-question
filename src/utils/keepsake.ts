import { heartPath2D } from './heart';
import { seeded } from './random';

const WIDTH = 1080;
const HEIGHT = 1350;

export interface KeepsakeContent {
  eyebrow: string;
  status: string;
  headline: string;
  subheading: string;
  names: string;
  /** The live teddy SVG, drawn onto the card when the browser allows it. */
  teddy: SVGSVGElement | null;
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, font: (size: number) => string, start: number, maxWidth: number) {
  let size = start;
  ctx.font = font(size);
  while (ctx.measureText(text).width > maxWidth && size > 24) {
    size -= 2;
    ctx.font = font(size);
  }
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(size / 100, size / 100);
  ctx.fill(heartPath2D());
  ctx.restore();
}

async function loadTeddy(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', '400');
  clone.setAttribute('height', '460');
  const markup = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    // Revoke after the image has decoded; the decoded bitmap stays usable.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

function paint(ctx: CanvasRenderingContext2D, content: KeepsakeContent, teddy: HTMLImageElement | null) {
  // Sunrise sky.
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, '#FFC5D6');
  sky.addColorStop(0.35, '#FFA3C4');
  sky.addColorStop(0.7, '#FFB5A2');
  sky.addColorStop(1, '#FFE2A6');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const sun = ctx.createRadialGradient(540, 520, 0, 540, 520, 620);
  sun.addColorStop(0, 'rgba(255, 248, 245, 0.95)');
  sun.addColorStop(0.45, 'rgba(255, 229, 160, 0.35)');
  sun.addColorStop(1, 'rgba(255, 229, 160, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Soft light rays.
  ctx.save();
  ctx.translate(540, 520);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  for (let i = 0; i < 24; i += 1) {
    ctx.rotate((Math.PI * 2) / 24);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-40, -900);
    ctx.lineTo(40, -900);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Scattered hearts.
  const random = seeded(2024);
  const colors = ['#F04468', '#FF82B2', '#FFF8F5', '#E0306A', '#C9A7FF'];
  for (let i = 0; i < 46; i += 1) {
    ctx.globalAlpha = 0.25 + random() * 0.5;
    ctx.fillStyle = colors[i % colors.length];
    drawHeart(ctx, random() * WIDTH, random() * HEIGHT, 18 + random() * 46, (random() - 0.5) * 0.8);
  }
  ctx.globalAlpha = 1;

  // Glowing heart halo + the teddy (or a big heart if the teddy can't be drawn).
  ctx.save();
  ctx.shadowColor = 'rgba(240, 68, 104, 0.6)';
  ctx.shadowBlur = 80;
  ctx.fillStyle = 'rgba(255, 130, 178, 0.55)';
  drawHeart(ctx, 540, 560, 560);
  ctx.restore();

  if (teddy) {
    ctx.drawImage(teddy, 540 - 230, 300, 460, 529);
  } else {
    const fill = ctx.createLinearGradient(380, 400, 700, 720);
    fill.addColorStop(0, '#FFB3CF');
    fill.addColorStop(1, '#D81F5A');
    ctx.fillStyle = fill;
    drawHeart(ctx, 540, 570, 380);
  }

  // Frame.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(36, 36, WIDTH - 72, HEIGHT - 72, 36);
  ctx.stroke();

  // Text.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#8E1538';
  ctx.font = '800 28px "Manrope Variable", "Segoe UI", sans-serif';
  ctx.letterSpacing = '8px';
  ctx.fillText(content.eyebrow.toUpperCase(), 540, 150);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#5C102D';
  fitFont(ctx, content.status, (s) => `italic 600 ${s}px "Fraunces Variable", Georgia, serif`, 64, 900);
  ctx.fillText(content.status, 540, 238);

  fitFont(ctx, content.headline, (s) => `700 ${s}px "Fraunces Variable", Georgia, serif`, 92, 940);
  ctx.fillText(content.headline, 540, 960);

  ctx.fillStyle = '#8E1538';
  fitFont(ctx, content.subheading, (s) => `italic 500 ${s}px "Fraunces Variable", Georgia, serif`, 48, 900);
  ctx.fillText(content.subheading, 540, 1040);

  if (content.names) {
    ctx.fillStyle = '#5C102D';
    fitFont(ctx, content.names, (s) => `700 ${s}px "Manrope Variable", "Segoe UI", sans-serif`, 40, 900);
    ctx.fillText(content.names, 540, 1130);
  }

  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.fillStyle = 'rgba(92, 16, 45, 0.75)';
  ctx.font = '700 26px "Manrope Variable", "Segoe UI", sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText(date.toUpperCase(), 540, 1245);
  ctx.letterSpacing = '0px';
}

function toBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))), 'image/png');
  });
}

/** Draws the keepsake card. Falls back to a version without the teddy if the browser refuses to export it. */
export async function createKeepsake(content: KeepsakeContent): Promise<Blob> {
  try {
    await Promise.all([
      document.fonts.load('italic 600 64px "Fraunces Variable"'),
      document.fonts.load('700 64px "Fraunces Variable"'),
      document.fonts.load('700 28px "Manrope Variable"'),
    ]);
  } catch {
    // Fallback fonts are fine.
  }

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  let teddy: HTMLImageElement | null = null;
  if (content.teddy) {
    try {
      teddy = await loadTeddy(content.teddy);
    } catch {
      teddy = null;
    }
  }

  paint(ctx, content, teddy);
  try {
    return await toBlob(canvas);
  } catch (error) {
    if (!teddy) throw error;
    paint(ctx, content, null);
    return toBlob(canvas);
  }
}

/** Starts a browser download for a blob. Returns false if the browser blocks it. */
export function downloadBlob(blob: Blob, filename: string) {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return true;
  } catch {
    return false;
  }
}
