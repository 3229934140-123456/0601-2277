import { Level } from '@/data/levels';
import {
  PlayerRenderState, PaperRenderState, ObstacleRuntime, PickupRuntime, HitEffect,
  drawBackground, drawDecorations, drawHouses, drawPlayer, drawPaper,
  drawObstacles, drawPickups, drawEffects, drawAimIndicator, drawMinimap,
} from './Renderer';
import { aabbOverlap, clamp } from '@/utils/pixel';
import { BikeSkin } from '@/data/bikes';
import { PaperSkin } from '@/data/papers';

export interface EngineCallbacks {
  onScore: (delta: number) => void;
  onCombo: () => void;
  onComboReset: () => void;
  onDamage: (amount: number) => void;
  onCoin: () => void;
  onTimeAdd: (seconds: number) => void;
  onPaperThrown: (success: boolean) => void;
  onVictory: () => void;
  onGameOver: () => void;
  onEffect: (e: HitEffect) => void;
  usePaper: () => boolean;
}

export class GameEngine {
  level: Level;
  bike: BikeSkin;
  paper: PaperSkin;
  player: PlayerRenderState;
  papers: PaperRenderState[] = [];
  obstacles: ObstacleRuntime[] = [];
  pickups: PickupRuntime[] = [];
  effects: HitEffect[] = [];
  houseDelivered: Record<string, boolean> = {};
  houseHit: Record<string, boolean> = {};
  time = 0;
  charge = 0;
  charging = false;
  aimAngle = 0;
  hasShield = false;
  shieldTime = 0;
  lastHitTime = 0;
  private rafId = 0;
  private lastFrame = 0;
  private paused = false;
  private over = false;
  callbacks: EngineCallbacks;
  paperPool: PaperRenderState[] = [];

  constructor(level: Level, bike: BikeSkin, paper: PaperSkin, cb: EngineCallbacks) {
    this.level = level;
    this.bike = bike;
    this.paper = paper;
    this.callbacks = cb;
    this.player = {
      x: level.startX,
      y: level.startY,
      facing: 1,
      hasShield: false,
      invincibleFlash: 0,
      wobble: 0,
    };
    this.obstacles = level.obstacles.map(o => ({
      ...o,
      facing: (o.patrol?.speed || 1) >= 0 ? 1 : -1,
      animFrame: 0,
      splashFrame: 0,
    }));
    this.pickups = level.pickups.map(p => ({
      ...p,
      collected: false,
      bobPhase: Math.random() * Math.PI * 2,
    }));
    for (let i = 0; i < 10; i++) {
      this.paperPool.push({ x: 0, y: 0, vx: 0, vy: 0, rotation: 0, active: false });
    }
  }

  start() {
    this.lastFrame = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - this.lastFrame) / 1000);
      this.lastFrame = t;
      if (!this.paused && !this.over) this.update(dt);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.rafId);
  }

  setPaused(v: boolean) { this.paused = v; }
  setOver(v: boolean) { this.over = v; }

  setAimAngle(angle: number) { this.aimAngle = angle; }

  beginCharge() {
    if (this.charging || this.over || this.paused) return;
    this.charging = true;
    this.charge = 0;
  }

  releaseCharge() {
    if (!this.charging) return;
    const c = this.charge;
    this.charging = false;
    this.charge = 0;
    this.throwPaper(c);
  }

  private throwPaper(power: number) {
    if (!this.callbacks.usePaper()) return;
    const p = this.paperPool.find(p => !p.active);
    if (!p) return;
    const speed = 120 + power * 300;
    const vert = -80 - power * 220;
    p.x = this.player.x;
    p.y = this.player.y - 10;
    p.vx = Math.cos(this.aimAngle) * speed;
    p.vy = Math.sin(this.aimAngle) * speed + vert;
    p.rotation = 0;
    p.active = true;
  }

  update(dt: number) {
    this.time += dt * 1000;
    if (this.charging) this.charge = clamp(this.charge + dt * 1.4, 0, 1);
    if (this.player.invincibleFlash > 0) this.player.invincibleFlash = Math.max(0, this.player.invincibleFlash - dt * 2);
    if (this.shieldTime > 0) {
      this.shieldTime -= dt;
      if (this.shieldTime <= 0) { this.hasShield = false; this.player.hasShield = false; }
    }
    this.player.hasShield = this.hasShield;
    this.player.wobble += dt * 14;

    this.updateObstacles(dt);
    this.updatePapers(dt);
    this.checkPickups();
    this.updateEffects(dt);
  }

  movePlayer(dx: number, dy: number, onPuddle: boolean) {
    if (this.paused || this.over) return;
    const baseSpeed = onPuddle ? 90 : 200;
    const magnitude = Math.hypot(dx, dy);
    if (magnitude > 0) {
      dx /= magnitude;
      dy /= magnitude;
      if (Math.abs(dx) > 0.1) this.player.facing = dx >= 0 ? 1 : -1;
    }
    this.player.x = clamp(this.player.x + dx * baseSpeed * 0.016, 16, this.level.mapWidth - 16);
    this.player.y = clamp(this.player.y + dy * baseSpeed * 0.016, 16, this.level.mapHeight - 16);
    this.checkPlayerCollisions();
  }

  private checkPlayerCollisions() {
    const p: any = { x: this.player.x - 16, y: this.player.y - 12, w: 32, h: 24 };
    const now = this.time;

    this.obstacles.forEach(o => {
      if (o.splashFrame > 0) return;
      const rect = { x: o.x, y: o.y, w: o.w, h: o.h };
      if (!aabbOverlap(p, rect)) return;
      switch (o.type) {
        case 'puddle':
          o.splashFrame = 20;
          break;
        case 'dog':
        case 'barricade':
          if (now - this.lastHitTime > 800) {
            this.doDamage(1, o);
            this.lastHitTime = now;
          }
          break;
        case 'car':
          if (now - this.lastHitTime > 1200) {
            this.doDamage(2, o);
            this.lastHitTime = now;
          }
          break;
      }
    });
  }

  private doDamage(amount: number, src?: ObstacleRuntime) {
    if (this.hasShield) {
      this.hasShield = false;
      this.player.hasShield = false;
      this.shieldTime = 0;
      this.addEffect({ type: 'hit', x: this.player.x, y: this.player.y, life: 0.4, maxLife: 0.4 });
      this.player.invincibleFlash = 1.2;
      return;
    }
    this.callbacks.onDamage(amount);
    this.addEffect({ type: 'hit', x: this.player.x, y: this.player.y, life: 0.5, maxLife: 0.5 });
    this.player.invincibleFlash = 1.5;
  }

  onPuddle(): boolean {
    const p: any = { x: this.player.x - 12, y: this.player.y - 8, w: 24, h: 16 };
    return this.obstacles.some(o =>
      o.type === 'puddle' && aabbOverlap(p, { x: o.x, y: o.y, w: o.w, h: o.h })
    );
  }

  private updateObstacles(dt: number) {
    this.obstacles.forEach(o => {
      o.animFrame += dt * 60;
      if (o.splashFrame > 0) o.splashFrame = Math.max(0, o.splashFrame - dt * 60);
      if (o.patrol) {
        o.x += o.patrol.speed;
        if (o.patrol.speed > 0) {
          if (o.x > o.patrol.maxX) {
            if (o.type === 'car') o.x = o.patrol.minX;
            else { o.x = o.patrol.maxX; o.patrol.speed = -o.patrol.speed; o.facing = -1; }
          }
        } else {
          if (o.x < o.patrol.minX) {
            if (o.type === 'car') o.x = o.patrol.maxX;
            else { o.x = o.patrol.minX; o.patrol.speed = -o.patrol.speed; o.facing = 1; }
          }
        }
      }
    });
  }

  private updatePapers(dt: number) {
    this.papers = this.paperPool.filter(p => p.active);
    this.papers.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 520 * dt;
      p.rotation += dt * 10 * (p.vx > 0 ? 1 : -1);
      if (p.y > this.level.mapHeight + 30 || p.x < -30 || p.x > this.level.mapWidth + 30) {
        p.active = false;
        this.callbacks.onPaperThrown(false);
        this.addEffect({ type: 'miss', x: clamp(p.x, 20, this.level.mapWidth - 20), y: Math.min(p.y, this.level.mapHeight - 20), life: 0.8, maxLife: 0.8 });
        return;
      }
      const r: any = { x: p.x - 6, y: p.y - 5, w: 12, h: 10 };
      let hit = false;
      this.level.houses.forEach(h => {
        if (this.houseDelivered[h.id]) return;
        const door: any = { x: h.doorX - 2, y: h.doorY - 2, w: 16, h: 20 };
        let mb: any = null;
        if (h.hasMailbox) mb = { x: h.mailboxX - 6, y: h.mailboxY - 2, w: 16, h: 18 };
        if (aabbOverlap(r, door) || (mb && aabbOverlap(r, mb))) {
          hit = true;
          this.houseDelivered[h.id] = true;
          p.active = false;
          this.callbacks.onPaperThrown(true);
          const baseScore = 100;
          this.callbacks.onScore(baseScore);
          this.addEffect({ type: 'success', x: h.x + h.w / 2, y: h.y, life: 1, maxLife: 1 });
        }
      });
      if (!hit && p.y > this.level.mapHeight - 8) {
        p.active = false;
        this.callbacks.onPaperThrown(false);
        this.addEffect({ type: 'miss', x: p.x, y: this.level.mapHeight - 20, life: 0.8, maxLife: 0.8 });
      }
    });
  }

  private checkPickups() {
    const p: any = { x: this.player.x - 14, y: this.player.y - 10, w: 28, h: 20 };
    this.pickups.forEach(pk => {
      if (pk.collected) return;
      const r: any = { x: pk.x, y: pk.y, w: pk.w, h: pk.h };
      if (!aabbOverlap(p, r)) return;
      pk.collected = true;
      switch (pk.type) {
        case 'coin':
          this.callbacks.onCoin();
          this.addEffect({ type: 'coin', x: pk.x + 8, y: pk.y + 8, life: 0.8, maxLife: 0.8 });
          break;
        case 'clock':
          this.callbacks.onTimeAdd(8);
          this.addEffect({ type: 'text', x: pk.x + 8, y: pk.y + 8, life: 1, maxLife: 1, text: '+8秒', color: '#00BFFF' });
          break;
        case 'shield':
          this.hasShield = true;
          this.shieldTime = 10;
          this.addEffect({ type: 'text', x: pk.x + 8, y: pk.y + 8, life: 1, maxLife: 1, text: '护盾!', color: '#00CED1' });
          break;
      }
    });
  }

  private updateEffects(dt: number) {
    this.effects = this.effects.filter(e => {
      e.life -= dt;
      return e.life > 0;
    });
  }

  addEffect(e: HitEffect) {
    this.callbacks.onEffect(e);
    this.effects.push(e);
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.imageSmoothingEnabled = false;
    drawBackground(ctx, this.level);
    drawDecorations(ctx, this.level, this.time);
    drawHouses(ctx, this.level, this.houseDelivered);
    drawPickups(ctx, this.pickups, this.time);
    drawObstacles(ctx, this.obstacles);
    drawAimIndicator(ctx, this.player, this.aimAngle, this.charge, this.charging);
    this.paperPool.forEach(p => drawPaper(ctx, p, this.paper));
    drawPlayer(ctx, this.player, this.bike, this.time);
    drawEffects(ctx, this.effects);
    drawMinimap(ctx, this.level, this.player, this.houseDelivered, 12, 12);
  }
}
