export interface Level {
  id: string;
  name: string;
  description: string;
  timeLimit: number;
  targetDeliveries: number;
  startPapers: number;
  startLives: number;
  mapWidth: number;
  mapHeight: number;
  tileSize: number;
  startX: number;
  startY: number;
  houses: Array<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    hasMailbox: boolean;
    mailboxX: number;
    mailboxY: number;
    doorX: number;
    doorY: number;
    color: string;
    roofColor: string;
  }>;
  obstacles: Array<{
    type: 'puddle' | 'dog' | 'barricade' | 'car';
    x: number;
    y: number;
    w: number;
    h: number;
    patrol?: { minX: number; maxX: number; speed: number };
  }>;
  pickups: Array<{
    type: 'coin' | 'clock' | 'shield';
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
  decorations: Array<{
    type: 'tree' | 'flower' | 'lamp' | 'hydrant';
    x: number;
    y: number;
    color?: string;
  }>;
  starConditions: {
    one: { desc: string; check: (r: LevelResult) => boolean };
    two: { desc: string; check: (r: LevelResult) => boolean };
    three: { desc: string; check: (r: LevelResult) => boolean };
  };
  unlockRequirement: string | null;
}

export interface LevelResult {
  score: number;
  deliveries: number;
  targetDeliveries: number;
  comboMax: number;
  coinsCollected: number;
  totalCoins: number;
  timeLeft: number;
  timeLimit: number;
  damageTaken: number;
  livesUsed: number;
  startLives: number;
  papersMissed: number;
}

export const TILE_SIZE = 32;
export const MAP_W = 30;
export const MAP_H = 20;

const streetY1 = 7;
const streetY2 = 13;

function buildHouses(rows: Array<{ y: number; count: number; startX: number; spacing: number }>) {
  const palette = [
    { wall: '#DEB887', roof: '#8B4513' },
    { wall: '#F5DEB3', roof: '#A52A2A' },
    { wall: '#E6CFA1', roof: '#556B2F' },
    { wall: '#FFEFD5', roof: '#4682B4' },
    { wall: '#FAEBD7', roof: '#CD853F' },
    { wall: '#FFE4B5', roof: '#2F4F4F' },
  ];
  const houses: Level['houses'] = [];
  let id = 0;
  rows.forEach((row, ri) => {
    for (let i = 0; i < row.count; i++) {
      const x = row.startX + i * row.spacing;
      const p = palette[(ri + i) % palette.length];
      const hx = x * TILE_SIZE;
      const hy = row.y * TILE_SIZE;
      const hw = 3 * TILE_SIZE - 8;
      const hh = 2 * TILE_SIZE - 8;
      const isTop = row.y < streetY1;
      houses.push({
        id: `house-${id++}`,
        x: hx + 4,
        y: hy + 4,
        w: hw,
        h: hh,
        hasMailbox: i % 2 === 0,
        mailboxX: isTop ? hx + 4 : hx + hw - 12,
        mailboxY: isTop ? hy + hh + 4 : hy + hh - 20,
        doorX: hx + hw / 2 - 6,
        doorY: isTop ? hy + hh - 18 : hy + 4,
        color: p.wall,
        roofColor: p.roof,
      });
    }
  });
  return houses;
}

function scatterPickups(count: number, avoidRects: { x: number; y: number; w: number; h: number }[]) {
  const pickups: Level['pickups'] = [];
  const types: Level['pickups'][number]['type'][] = ['coin', 'coin', 'coin', 'coin', 'coin', 'clock', 'shield'];
  let attempts = 0;
  while (pickups.length < count && attempts < count * 50) {
    attempts++;
    const type = types[Math.floor(Math.random() * types.length)];
    const tx = 1 + Math.floor(Math.random() * (MAP_W - 2));
    const ty = Math.floor(Math.random() * MAP_H);
    const x = tx * TILE_SIZE + 8;
    const y = ty * TILE_SIZE + 8;
    const w = 16;
    const h = 16;
    const collides = avoidRects.some(r =>
      x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y
    );
    if (collides) continue;
    if (ty === streetY1 || ty === streetY1 + 1 || ty === streetY2 || ty === streetY2 + 1) continue;
    pickups.push({ type, x, y, w, h });
  }
  return pickups;
}

function makeObstacles(density: number) {
  const obs: Level['obstacles'] = [];
  const roadTiles = [streetY1, streetY1 + 1, streetY2, streetY2 + 1];

  for (let i = 0; i < Math.floor(2 + density * 2); i++) {
    const tx = 4 + Math.floor(Math.random() * (MAP_W - 8));
    const ty = roadTiles[Math.floor(Math.random() * roadTiles.length)];
    obs.push({
      type: 'puddle',
      x: tx * TILE_SIZE + 4,
      y: ty * TILE_SIZE + 4,
      w: TILE_SIZE - 8,
      h: TILE_SIZE - 8,
    });
  }

  for (let i = 0; i < Math.floor(1 + density * 2); i++) {
    const tx = 4 + Math.floor(Math.random() * (MAP_W - 10));
    const side = Math.random() > 0.5;
    const ty = side ? streetY1 - 2 : streetY2 + 2;
    const x = tx * TILE_SIZE;
    obs.push({
      type: 'dog',
      x,
      y: ty * TILE_SIZE + 8,
      w: 24,
      h: 20,
      patrol: { minX: Math.max(TILE_SIZE, x - 3 * TILE_SIZE), maxX: x + 3 * TILE_SIZE, speed: 1 + Math.random() * 0.5 },
    });
  }

  for (let i = 0; i < Math.floor(2 + density * 2); i++) {
    const tx = 5 + Math.floor(Math.random() * (MAP_W - 10));
    const ty = roadTiles[Math.floor(Math.random() * roadTiles.length)];
    obs.push({
      type: 'barricade',
      x: tx * TILE_SIZE + 4,
      y: ty * TILE_SIZE + 8,
      w: 24,
      h: 20,
    });
  }

  for (let i = 0; i < Math.floor(1 + density); i++) {
    const fromLeft = Math.random() > 0.5;
    const ty = roadTiles[i % roadTiles.length];
    const x = fromLeft ? -64 : MAP_W * TILE_SIZE;
    obs.push({
      type: 'car',
      x,
      y: ty * TILE_SIZE + 4,
      w: 56,
      h: 24,
      patrol: {
        minX: -80,
        maxX: MAP_W * TILE_SIZE + 80,
        speed: (fromLeft ? 1 : -1) * (2.5 + Math.random() * 1.5),
      },
    });
  }

  return obs;
}

function makeDecorations() {
  const decs: Level['decorations'] = [];
  const treeColors = ['#228B22', '#2E8B57', '#3CB371', '#006400'];
  for (let i = 0; i < 12; i++) {
    const tx = 1 + Math.floor(Math.random() * (MAP_W - 2));
    const row = Math.random() > 0.5;
    const ty = row ? streetY1 - 1 : streetY2 + 1;
    decs.push({ type: 'tree', x: tx * TILE_SIZE + 8, y: ty * TILE_SIZE + 8, color: treeColors[i % treeColors.length] });
  }
  for (let i = 0; i < 10; i++) {
    const tx = 2 + Math.floor(Math.random() * (MAP_W - 4));
    const row = Math.random() > 0.5;
    const ty = row ? streetY1 - 1 : streetY2 + 1;
    decs.push({ type: 'flower', x: tx * TILE_SIZE + 16, y: ty * TILE_SIZE + 20 });
  }
  for (let i = 0; i < 6; i++) {
    const tx = 4 + i * 4;
    const row = i % 2;
    const ty = row ? streetY1 - 1 : streetY2 + 1;
    decs.push({ type: 'lamp', x: tx * TILE_SIZE + 12, y: ty * TILE_SIZE + 4 });
  }
  return decs;
}

function createLevel(
  id: string,
  name: string,
  description: string,
  opts: {
    timeLimit: number;
    targetDeliveries: number;
    startPapers: number;
    density: number;
    unlockRequirement: string | null;
  }
): Level {
  const rows = [
    { y: 1, count: 7, startX: 1, spacing: 4 },
    { y: 4, count: 7, startX: 1, spacing: 4 },
    { y: 15, count: 7, startX: 1, spacing: 4 },
    { y: 18, count: 7, startX: 1, spacing: 4 },
  ];
  const houses = buildHouses(rows);
  const avoidRects = houses.map(h => ({ x: h.x - 4, y: h.y - 4, w: h.w + 8, h: h.h + 12 }));
  const obstacles = makeObstacles(opts.density);
  const pickups = scatterPickups(Math.floor(12 + opts.density * 6), avoidRects);
  const decorations = makeDecorations();

  return {
    id,
    name,
    description,
    timeLimit: opts.timeLimit,
    targetDeliveries: opts.targetDeliveries,
    startPapers: opts.startPapers,
    startLives: 3,
    mapWidth: MAP_W * TILE_SIZE,
    mapHeight: MAP_H * TILE_SIZE,
    tileSize: TILE_SIZE,
    startX: 3 * TILE_SIZE,
    startY: (streetY1 + 0.5) * TILE_SIZE,
    houses,
    obstacles,
    pickups,
    decorations,
    starConditions: {
      one: {
        desc: `完成至少 ${Math.ceil(opts.targetDeliveries * 0.6)} 次投递`,
        check: (r) => r.deliveries >= Math.ceil(r.targetDeliveries * 0.6),
      },
      two: {
        desc: `完成全部投递且得分 >= ${800}`,
        check: (r) => r.deliveries >= r.targetDeliveries && r.score >= 800,
      },
      three: {
        desc: `无伤通关 + 全投递 + 收集所有金币 + 剩余时间 >= 25%`,
        check: (r) =>
          r.damageTaken === 0 &&
          r.deliveries >= r.targetDeliveries &&
          r.coinsCollected >= r.totalCoins &&
          r.timeLeft >= r.timeLimit * 0.25,
      },
    },
    unlockRequirement: opts.unlockRequirement,
  };
}

export const LEVELS: Level[] = [
  createLevel('level-1', '榆树街', '阳光明媚的郊区街道，送报生涯的起点。', {
    timeLimit: 90,
    targetDeliveries: 18,
    startPapers: 25,
    density: 0.6,
    unlockRequirement: null,
  }),
  createLevel('level-2', '枫树大道', '道路稍宽，注意躲避街头的小狗。', {
    timeLimit: 100,
    targetDeliveries: 22,
    startPapers: 30,
    density: 0.9,
    unlockRequirement: '榆树街 1 星',
  }),
  createLevel('level-3', '橡树住宅区', '车辆增多，投递点分布更分散。', {
    timeLimit: 110,
    targetDeliveries: 26,
    startPapers: 35,
    density: 1.2,
    unlockRequirement: '枫树大道 1 星',
  }),
  createLevel('level-4', '雪松巷', '路况复杂，考验蓄力投送的精准度。', {
    timeLimit: 115,
    targetDeliveries: 28,
    startPapers: 38,
    density: 1.5,
    unlockRequirement: '橡树住宅区 2 星',
  }),
  createLevel('level-5', '市中心', '车水马龙的市中心街道，终极挑战。', {
    timeLimit: 120,
    targetDeliveries: 30,
    startPapers: 40,
    density: 1.9,
    unlockRequirement: '雪松巷 2 星',
  }),
];

export function getLevelById(id: string): Level | undefined {
  return LEVELS.find(l => l.id === id);
}

export function isLevelUnlocked(levelId: string, starProgress: Record<string, 0 | 1 | 2 | 3>): boolean {
  const idx = LEVELS.findIndex(l => l.id === levelId);
  if (idx <= 0) return true;
  const prev = LEVELS[idx - 1];
  const current = LEVELS[idx];
  if (!current.unlockRequirement) return true;
  const prevStars = starProgress[prev.id] || 0;
  if (current.unlockRequirement.includes('2 星')) return prevStars >= 2;
  return prevStars >= 1;
}
