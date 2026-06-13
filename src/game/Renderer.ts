import { Level, MAP_W, MAP_H, TILE_SIZE } from '@/data/levels';
import { drawPixelRect, drawPixelBorder, drawPixelText } from '@/utils/pixel';
import { BikeSkin } from '@/data/bikes';
import { PaperSkin } from '@/data/papers';
import { CharacterSkin } from '@/data/characters';

const STREET_START = 7;
const STREET_END = 15;

export interface PlayerRenderState {
  x: number;
  y: number;
  facing: number; // -1 left, 1 right
  hasShield: boolean;
  invincibleFlash: number;
  wobble: number;
}

export interface PaperRenderState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  active: boolean;
}

export interface ObstacleRuntime {
  type: 'puddle' | 'dog' | 'barricade' | 'car';
  x: number;
  y: number;
  w: number;
  h: number;
  facing: number;
  animFrame: number;
  splashFrame: number;
  patrol?: { minX: number; maxX: number; speed: number };
}

export interface PickupRuntime {
  type: 'coin' | 'clock' | 'shield';
  x: number;
  y: number;
  w: number;
  h: number;
  collected: boolean;
  bobPhase: number;
}

export interface HitEffect {
  type: 'hit' | 'coin' | 'success' | 'miss' | 'text';
  x: number;
  y: number;
  life: number;
  maxLife: number;
  text?: string;
  color?: string;
}

export interface GameRenderData {
  level: Level;
  player: PlayerRenderState;
  papers: PaperRenderState[];
  obstacles: ObstacleRuntime[];
  pickups: PickupRuntime[];
  effects: HitEffect[];
  houseDelivered: Record<string, boolean>;
  time: number;
  charge: number;
  charging: boolean;
  aimAngle: number;
}

export function drawBackground(ctx: CanvasRenderingContext2D, level: Level) {
  const W = level.mapWidth;
  const H = level.mapHeight;

  ctx.fillStyle = '#7EC850';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#6BA840';
  for (let y = 0; y < MAP_H; y += 2) {
    for (let x = 0; x < MAP_W; x += 2) {
      if ((x + y) % 4 === 0) {
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  for (let sy = STREET_START; sy < STREET_END; sy++) {
    ctx.fillStyle = sy === STREET_START || sy === STREET_END - 1 ? '#8B7355' : '#555555';
    ctx.fillRect(0, sy * TILE_SIZE, W, TILE_SIZE);
  }

  ctx.fillStyle = '#FFE680';
  for (let sy = STREET_START + 1; sy < STREET_END - 1; sy++) {
    for (let x = 0; x < MAP_W; x += 2) {
      const offset = (sy % 2) * TILE_SIZE;
      ctx.fillRect(x * TILE_SIZE + offset, sy * TILE_SIZE + TILE_SIZE / 2 - 2, TILE_SIZE - 4, 4);
    }
  }

  for (let sy of [STREET_START, STREET_END - 1]) {
    ctx.fillStyle = '#C2B280';
    ctx.fillRect(0, sy * TILE_SIZE, W, 4);
  }

  for (let sy = STREET_START - 1; sy >= 0; sy--) {
    ctx.fillStyle = sy === STREET_START - 1 ? '#B0A090' : '#9C8C7C';
    ctx.fillRect(0, sy * TILE_SIZE, W, TILE_SIZE);
  }
  for (let sy = STREET_END; sy < MAP_H; sy++) {
    ctx.fillStyle = sy === STREET_END ? '#B0A090' : '#9C8C7C';
    ctx.fillRect(0, sy * TILE_SIZE, W, TILE_SIZE);
  }

  ctx.fillStyle = '#8B7A6A';
  for (let x = 0; x < MAP_W; x += 4) {
    ctx.fillRect(x * TILE_SIZE, 0, 2, STREET_START * TILE_SIZE);
    ctx.fillRect(x * TILE_SIZE, STREET_END * TILE_SIZE, 2, (MAP_H - STREET_END) * TILE_SIZE);
  }
}

export function drawDecorations(ctx: CanvasRenderingContext2D, level: Level, time: number) {
  level.decorations.forEach(d => {
    switch (d.type) {
      case 'tree': {
        drawPixelRect(ctx, d.x + 6, d.y + 18, 4, 10, '#6B3A1A');
        const sway = Math.sin(time * 0.002 + d.x) * 2;
        drawPixelRect(ctx, d.x + sway - 4, d.y, 24, 20, d.color || '#228B22');
        drawPixelRect(ctx, d.x + sway, d.y - 4, 16, 6, d.color || '#228B22');
        drawPixelRect(ctx, d.x + sway + 4, d.y + 4, 8, 8, '#3CB371');
        break;
      }
      case 'flower': {
        const colors = ['#FF69B4', '#FFD700', '#FF6347', '#9370DB', '#FF4500'];
        const c = colors[(d.x + d.y) % colors.length];
        drawPixelRect(ctx, d.x, d.y + 4, 2, 8, '#228B22');
        drawPixelRect(ctx, d.x - 2, d.y, 2, 2, c);
        drawPixelRect(ctx, d.x + 2, d.y, 2, 2, c);
        drawPixelRect(ctx, d.x, d.y - 2, 2, 2, c);
        drawPixelRect(ctx, d.x, d.y + 2, 2, 2, c);
        drawPixelRect(ctx, d.x, d.y, 2, 2, '#FFD700');
        break;
      }
      case 'lamp': {
        drawPixelRect(ctx, d.x + 2, d.y + 8, 4, 20, '#333333');
        const flicker = 0.8 + 0.2 * Math.sin(time * 0.005 + d.x);
        ctx.save();
        ctx.globalAlpha = 0.3 * flicker;
        ctx.fillStyle = '#FFF5AA';
        ctx.fillRect(d.x - 6, d.y, 20, 14);
        ctx.restore();
        drawPixelRect(ctx, d.x, d.y, 8, 10, '#222222');
        drawPixelRect(ctx, d.x + 2, d.y + 2, 4, 6, `rgba(255, 245, 170, ${flicker})`);
        break;
      }
    }
  });
}

export function drawHouses(ctx: CanvasRenderingContext2D, level: Level, delivered: Record<string, boolean>) {
  level.houses.forEach(h => {
    const isTop = h.y < STREET_START * TILE_SIZE;

    drawPixelRect(ctx, h.x, h.y + (isTop ? 8 : 0), h.w, h.h - 8, h.color);
    drawPixelBorder(ctx, h.x, h.y + (isTop ? 8 : 0), h.w, h.h - 8, 2,
      shadeColor(h.color, 20), shadeColor(h.color, -25));

    if (isTop) {
      ctx.fillStyle = h.roofColor;
      ctx.beginPath();
      ctx.moveTo(h.x - 4, h.y + 10);
      ctx.lineTo(h.x + h.w / 2, h.y - 6);
      ctx.lineTo(h.x + h.w + 4, h.y + 10);
      ctx.closePath();
      ctx.fill();
      drawPixelRect(ctx, h.x + h.w / 2 - 2, h.y - 14, 4, 10, '#555555');
    } else {
      ctx.fillStyle = h.roofColor;
      ctx.beginPath();
      ctx.moveTo(h.x - 4, h.y + h.h - 10);
      ctx.lineTo(h.x + h.w / 2, h.y + h.h + 6);
      ctx.lineTo(h.x + h.w + 4, h.y + h.h - 10);
      ctx.closePath();
      ctx.fill();
    }

    const winColor = delivered[h.id] ? '#FFEE88' : '#ADD8E6';
    const winSize = 12;
    drawPixelRect(ctx, h.x + 8, h.y + (isTop ? 16 : 8), winSize, winSize, winColor);
    drawPixelRect(ctx, h.x + h.w - 8 - winSize, h.y + (isTop ? 16 : 8), winSize, winSize, winColor);
    drawPixelRect(ctx, h.x + 8, h.y + h.h - 20, winSize, winSize, winColor);
    drawPixelRect(ctx, h.x + h.w - 8 - winSize, h.y + h.h - 20, winSize, winSize, winColor);
    drawPixelRect(ctx, h.x + 8, h.y + (isTop ? 16 : 8), winSize, 2, '#333333');
    drawPixelRect(ctx, h.x + 8, h.y + (isTop ? 16 : 8), 2, winSize, '#333333');

    drawPixelRect(ctx, h.doorX, h.doorY, 12, 18, delivered[h.id] ? '#FFAA44' : '#8B4513');
    drawPixelRect(ctx, h.doorX + 8, h.doorY + 8, 2, 3, '#FFD700');

    if (h.hasMailbox) {
      const mbDelivered = delivered[h.id];
      drawPixelRect(ctx, h.mailboxX - 2, h.mailboxY + 14, 4, 10, '#555555');
      drawPixelRect(ctx, h.mailboxX - 6, h.mailboxY, 16, 16, mbDelivered ? '#4CAF50' : '#228B22');
      drawPixelRect(ctx, h.mailboxX - 6, h.mailboxY, 16, 3, '#1A6B1A');
      drawPixelRect(ctx, h.mailboxX + 6, h.mailboxY + 4, 3, 3, '#000000');
      if (mbDelivered) {
        drawPixelRect(ctx, h.mailboxX - 3, h.mailboxY + 4, 8, 2, '#FFFFFF');
      }
    }
  });
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  p: PlayerRenderState,
  bike: BikeSkin,
  character: CharacterSkin,
  time: number
) {
  const [cFrame, cDark, cLight, tireC, rimC] = bike.colors;
  const [charSkin, charHair, charShirt, charPants, charAccent] = character.colors;
  const flash = p.invincibleFlash > 0 && Math.floor(time / 60) % 2 === 0;
  if (flash) return;

  const cx = p.x;
  const cy = p.y;
  const wobble = Math.sin(p.wobble) * 1.5;
  const dir = p.facing;

  ctx.save();
  ctx.translate(cx, cy);
  if (dir < 0) ctx.scale(-1, 1);

  const wheelSpin = Math.floor(time / 40) % 4;

  drawPixelRect(ctx, -16, 8, 14, 14, tireC);
  drawPixelRect(ctx, -14, 10, 10, 10, rimC);
  drawPixelRect(ctx, -13 + wheelSpin, 10, 2, 10, tireC);

  drawPixelRect(ctx, 6, 8, 14, 14, tireC);
  drawPixelRect(ctx, 8, 10, 10, 10, rimC);
  drawPixelRect(ctx, 9 + wheelSpin, 10, 2, 10, tireC);

  drawPixelRect(ctx, -10, 2, 22, 3, cFrame);
  drawPixelRect(ctx, -6, -3, 3, 8, cFrame);
  drawPixelRect(ctx, -6, -3, 16, 3, cFrame);
  drawPixelRect(ctx, 8, -3, 3, 10, cFrame);
  drawPixelRect(ctx, 0, 2, 3, 9, cDark);
  drawPixelRect(ctx, -10, -3, 5, 2, cDark);

  drawPixelRect(ctx, -2, -10 + wobble, 8, 8, charSkin);
  drawPixelRect(ctx, 0, -12 + wobble, 4, 3, charHair);
  drawPixelRect(ctx, -2, -6 + wobble, 2, 1, '#000000');
  drawPixelRect(ctx, 4, -6 + wobble, 2, 1, '#000000');

  drawPixelRect(ctx, 0, -2 + wobble, 6, 6, charShirt);

  drawPixelRect(ctx, -8, 0, 3, 3, charSkin);
  drawPixelRect(ctx, 8, -5, 3, 3, charSkin);
  drawPixelRect(ctx, -4, -4, 12, 2, '#888888');

  ctx.restore();

  if (p.hasShield) {
    ctx.save();
    ctx.strokeStyle = `rgba(0, 220, 255, ${0.6 + 0.3 * Math.sin(time * 0.01)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawPaper(
  ctx: CanvasRenderingContext2D,
  paper: PaperRenderState,
  skin: PaperSkin
) {
  if (!paper.active) return;
  const [bgC, inkC, accentC] = skin.colors;
  ctx.save();
  ctx.translate(paper.x, paper.y);
  ctx.rotate(paper.rotation);
  drawPixelRect(ctx, -8, -6, 16, 12, bgC);
  drawPixelRect(ctx, -8, -6, 16, 2, accentC);
  drawPixelRect(ctx, -6, -3, 12, 1, inkC);
  drawPixelRect(ctx, -6, -1, 10, 1, inkC);
  drawPixelRect(ctx, -6, 1, 12, 1, inkC);
  drawPixelRect(ctx, -6, 3, 8, 1, inkC);
  drawPixelBorder(ctx, -8, -6, 16, 12, 1, shadeColor(bgC, 20), shadeColor(bgC, -30));
  ctx.restore();
}

export function drawObstacles(ctx: CanvasRenderingContext2D, obstacles: ObstacleRuntime[]) {
  obstacles.forEach(o => {
    switch (o.type) {
      case 'puddle': {
        const wave = Math.sin(o.animFrame * 0.1) * 2;
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.ellipse(o.x + o.w / 2, o.y + o.h / 2 + wave, o.w / 2, o.h / 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#93C5FD';
        ctx.beginPath();
        ctx.ellipse(o.x + o.w / 2 - 4, o.y + o.h / 2 - 2 + wave, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (o.splashFrame > 0) {
          ctx.save();
          ctx.strokeStyle = `rgba(255, 255, 255, ${o.splashFrame / 20})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(o.x + o.w / 2, o.y + o.h / 2, 10 + (20 - o.splashFrame), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        break;
      }
      case 'dog': {
        const dir = o.facing;
        ctx.save();
        ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
        if (dir < 0) ctx.scale(-1, 1);
        const legBob = Math.sin(o.animFrame * 0.3) * 2;
        drawPixelRect(ctx, -10, -4, 18, 10, '#8B4513');
        drawPixelRect(ctx, 4, -10, 8, 8, '#A0522D');
        drawPixelRect(ctx, 10, -12, 2, 4, '#A0522D');
        drawPixelRect(ctx, 6, -8, 2, 2, '#000000');
        drawPixelRect(ctx, 10, -6, 2, 1, '#000000');
        drawPixelRect(ctx, -4, 4, 3, 4 + legBob, '#6B3410');
        drawPixelRect(ctx, 4, 4, 3, 4 - legBob, '#6B3410');
        drawPixelRect(ctx, -11, -2, 4, 2, '#A0522D');
        const wag = Math.sin(o.animFrame * 0.4) * 2;
        drawPixelRect(ctx, -14, -4 + wag, 4, 2, '#8B4513');
        ctx.restore();
        break;
      }
      case 'barricade': {
        drawPixelRect(ctx, o.x, o.y + 4, o.w, 4, '#FF6B35');
        drawPixelRect(ctx, o.x, o.y + 10, o.w, 4, '#FFFFFF');
        drawPixelRect(ctx, o.x, o.y + 4, 4, o.h - 4, '#FF6B35');
        drawPixelRect(ctx, o.x + o.w - 4, o.y + 4, 4, o.h - 4, '#FF6B35');
        drawPixelRect(ctx, o.x + 4, o.y, 4, 6, '#333333');
        drawPixelRect(ctx, o.x + o.w - 8, o.y, 4, 6, '#333333');
        break;
      }
      case 'car': {
        const dir = o.facing;
        ctx.save();
        ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
        if (dir < 0) ctx.scale(-1, 1);
        drawPixelRect(ctx, -28, -8, 56, 16, '#D93A3A');
        drawPixelRect(ctx, -22, -14, 34, 8, '#B02020');
        drawPixelRect(ctx, -20, -12, 14, 6, '#87CEEB');
        drawPixelRect(ctx, -2, -12, 14, 6, '#87CEEB');
        drawPixelBorder(ctx, -28, -8, 56, 16, 2, '#F06060', '#801010');
        drawPixelRect(ctx, 22, -4, 4, 4, '#FFFFA0');
        drawPixelRect(ctx, -28, -4, 4, 4, '#FFA0A0');
        const wheel = Math.floor(o.animFrame / 3) % 2;
        drawPixelRect(ctx, -22, 8, 10, 6, '#111111');
        drawPixelRect(ctx, 12, 8, 10, 6, '#111111');
        drawPixelRect(ctx, -20 + wheel, 9, 2, 4, '#555555');
        drawPixelRect(ctx, 14 + wheel, 9, 2, 4, '#555555');
        ctx.restore();
        break;
      }
    }
  });
}

export function drawPickups(ctx: CanvasRenderingContext2D, pickups: PickupRuntime[], time: number) {
  pickups.forEach(p => {
    if (p.collected) return;
    const bob = Math.sin(time * 0.005 + p.bobPhase) * 3;
    switch (p.type) {
      case 'coin': {
        const spin = Math.abs(Math.sin(time * 0.008 + p.bobPhase));
        const w = Math.max(4, 14 * spin);
        const x = p.x + p.w / 2 - w / 2;
        drawPixelRect(ctx, x, p.y + bob, w, 14, '#FFD700');
        drawPixelRect(ctx, x, p.y + bob, w, 2, '#FFF176');
        drawPixelRect(ctx, x, p.y + bob + 12, w, 2, '#B8860B');
        if (spin > 0.5) {
          drawPixelText(ctx, '$', x + 2, p.y + bob + 11, 8, '#8B4513', false);
        }
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + bob + 7, 10 + bob, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'clock': {
        const glow = 0.5 + 0.5 * Math.sin(time * 0.004);
        ctx.save();
        ctx.globalAlpha = 0.2 + 0.2 * glow;
        ctx.fillStyle = '#00BFFF';
        ctx.beginPath();
        ctx.arc(p.x + 8, p.y + bob + 8, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        drawPixelRect(ctx, p.x, p.y + bob, 16, 16, '#FFFFFF');
        drawPixelBorder(ctx, p.x, p.y + bob, 16, 16, 2, '#B0B0B0', '#505050');
        drawPixelRect(ctx, p.x + 7, p.y + bob + 3, 2, 6, '#000000');
        drawPixelRect(ctx, p.x + 7, p.y + bob + 7, 5, 2, '#000000');
        drawPixelRect(ctx, p.x + 7, p.y + bob + 7, 2, 2, '#FF0000');
        break;
      }
      case 'shield': {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#00CED1';
        ctx.beginPath();
        ctx.arc(p.x + 8, p.y + bob + 8, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        drawPixelRect(ctx, p.x + 2, p.y + bob, 12, 16, '#00CED1');
        drawPixelRect(ctx, p.x, p.y + bob + 2, 16, 12, '#00CED1');
        drawPixelBorder(ctx, p.x + 2, p.y + bob, 12, 16, 2, '#7FFFD4', '#008080');
        drawPixelRect(ctx, p.x + 6, p.y + bob + 4, 2, 8, '#FFFFFF');
        drawPixelRect(ctx, p.x + 4, p.y + bob + 7, 6, 2, '#FFFFFF');
        break;
      }
    }
  });
}

export function drawEffects(ctx: CanvasRenderingContext2D, effects: HitEffect[]) {
  effects.forEach(e => {
    const t = e.life / e.maxLife;
    ctx.save();
    ctx.globalAlpha = t;
    switch (e.type) {
      case 'hit':
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(e.x, e.y, (1 - t) * 40 + 5, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'coin': {
        const bounce = (1 - t) * 20;
        drawPixelText(ctx, '+50', e.x - 10, e.y - bounce, 10, '#FFD700');
        break;
      }
      case 'success': {
        const bounce = (1 - t) * 24;
        drawPixelText(ctx, '命中!', e.x - 16, e.y - bounce, 10, '#6BCB77');
        break;
      }
      case 'miss': {
        const bounce = (1 - t) * 24;
        drawPixelText(ctx, '未中!', e.x - 16, e.y - bounce, 10, '#FF6B6B');
        break;
      }
      case 'text': {
        const bounce = (1 - t) * 24;
        drawPixelText(ctx, e.text || '', e.x - 8, e.y - bounce, 10, e.color || '#FFFFFF');
        break;
      }
    }
    ctx.restore();
  });
}

export function drawAimIndicator(
  ctx: CanvasRenderingContext2D,
  player: PlayerRenderState,
  angle: number,
  charge: number,
  charging: boolean
) {
  if (!charging) return;
  const power = 60 + charge * 160;
  const endX = player.x + Math.cos(angle) * power;
  const endY = player.y + Math.sin(angle) * power;
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = `rgba(255, 217, 61, ${0.4 + 0.5 * charge})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - 4);
  const midX = (player.x + endX) / 2;
  const midY = (player.y + endY) / 2 - 30 * charge;
  ctx.quadraticCurveTo(midX, midY, endX, endY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = `rgba(255, 217, 61, ${0.6 + 0.4 * charge})`;
  ctx.fillRect(endX - 4, endY - 4, 8, 8);
  ctx.restore();
}

function shadeColor(color: string, percent: number): string {
  const f = parseInt(color.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const R = f >> 16;
  const G = (f >> 8) & 0x00FF;
  const B = f & 0x0000FF;
  const r = Math.round((t - R) * p) + R;
  const g = Math.round((t - G) * p) + G;
  const b = Math.round((t - B) * p) + B;
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function drawMinimap(
  ctx: CanvasRenderingContext2D,
  level: Level,
  player: PlayerRenderState,
  delivered: Record<string, boolean>,
  screenX: number,
  screenY: number
) {
  const mw = 160;
  const mh = 100;
  const sx = mw / level.mapWidth;
  const sy = mh / level.mapHeight;

  ctx.save();
  ctx.translate(screenX, screenY);
  drawPixelRect(ctx, -2, -2, mw + 4, mh + 4, '#2D1B0E');
  drawPixelRect(ctx, 0, 0, mw, mh, '#1a0f08');
  drawPixelRect(ctx, 0, STREET_START * TILE_SIZE * sy, mw, (STREET_END - STREET_START) * TILE_SIZE * sy, '#555555');
  level.houses.forEach(h => {
    const c = delivered[h.id] ? '#6BCB77' : '#8B4513';
    drawPixelRect(ctx, h.x * sx, h.y * sy, Math.max(2, h.w * sx), Math.max(2, h.h * sy), c);
  });
  drawPixelRect(ctx, player.x * sx - 2, player.y * sy - 2, 5, 5, '#FFD93D');
  drawPixelRect(ctx, player.x * sx - 1, player.y * sy - 1, 3, 3, '#FF6B6B');
  ctx.restore();
}
