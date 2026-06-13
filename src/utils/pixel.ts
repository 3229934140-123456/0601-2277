export interface PixelRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
}

export function drawPixelBorder(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  border: number,
  lightColor: string, darkColor: string
): void {
  drawPixelRect(ctx, x, y, w, border, lightColor);
  drawPixelRect(ctx, x, y + h - border, w, border, darkColor);
  drawPixelRect(ctx, x, y, border, h, lightColor);
  drawPixelRect(ctx, x + w - border, y, border, h, darkColor);
}

export function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  size: number = 8,
  color: string = '#F5F5DC',
  shadow: boolean = true
): void {
  ctx.save();
  ctx.font = `${size}px "Press Start 2P", VT323, monospace`;
  if (shadow) {
    ctx.fillStyle = '#000000';
    ctx.fillText(text, x + 2, y + 2);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function aabbOverlap(a: PixelRect, b: PixelRect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function distance(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}
