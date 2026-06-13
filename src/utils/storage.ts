const STORAGE_KEY = 'pixel-paperboy-save-v1';

export interface GameSettings {
  crtFilter: boolean;
  scanlines: boolean;
  colorShift: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}

export interface PersistentStats {
  deliveriesCount: number;
  comboMax: number;
  noDamageCount: number;
  threeStars: number;
}

export interface LevelHistoryEntry {
  id: string;
  timestamp: number;
  score: number;
  stars: 0 | 1 | 2 | 3;
  victory: boolean;
  character: string;
  bike: string;
  paper: string;
  deliveries: number;
  targetDeliveries: number;
  coinsCollected: number;
  totalCoins: number;
  comboMax: number;
  damageTaken: number;
  timeLeft: number;
  timeLimit: number;
  livesUsed: number;
  papersMissed: number;
}

export interface CharacterProgress {
  characterId: string;
  playCount: number;
  totalDeliveries: number;
  noDamageRuns: number;
  threeStars: number;
  totalScore: number;
}

export interface SaveData {
  highScores: Record<string, number>;
  starProgress: Record<string, 0 | 1 | 2 | 3>;
  unlockedBikes: string[];
  unlockedPapers: string[];
  unlockedCharacters: string[];
  selectedBike: string;
  selectedPaper: string;
  selectedCharacter: string;
  totalCoins: number;
  totalDeliveries: number;
  persistentStats: PersistentStats;
  levelHistory: Record<string, LevelHistoryEntry[]>;
  characterProgress: Record<string, CharacterProgress>;
  settings: GameSettings;
}

export const defaultSettings: GameSettings = {
  crtFilter: true,
  scanlines: true,
  colorShift: false,
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.4,
  sfxVolume: 0.6,
};

export const defaultPersistentStats: PersistentStats = {
  deliveriesCount: 0,
  comboMax: 0,
  noDamageCount: 0,
  threeStars: 0,
};

export function makeCharacterProgress(characterId: string): CharacterProgress {
  return {
    characterId,
    playCount: 0,
    totalDeliveries: 0,
    noDamageRuns: 0,
    threeStars: 0,
    totalScore: 0,
  };
}

export const characterTitles: Array<{ threshold: number; title: string; desc: string }> = [
  { threshold: 0, title: '新人送报员', desc: '刚刚踏上送报之路的小小勇士' },
  { threshold: 5, title: '街区熟手', desc: '已经熟悉了街区每一条小巷' },
  { threshold: 15, title: '投递达人', desc: '飞一般的投递速度令人惊叹' },
  { threshold: 30, title: '金牌信使', desc: '报纸永远准时到达门口' },
  { threshold: 60, title: '传奇车神', desc: '整个城市都传颂着你的名字' },
  { threshold: 100, title: '送报之星', desc: '登上送报界的巅峰！' },
];

export function getCharacterTitle(progress: CharacterProgress): { title: string; desc: string; index: number } {
  let idx = 0;
  for (let i = 0; i < characterTitles.length; i++) {
    if (progress.playCount >= characterTitles[i].threshold) idx = i;
  }
  const t = characterTitles[idx];
  return { title: t.title, desc: t.desc, index: idx };
}

export function getNextTitle(progress: CharacterProgress): { title: string; threshold: number; need: number } | null {
  const current = getCharacterTitle(progress);
  const nextIdx = current.index + 1;
  if (nextIdx >= characterTitles.length) return null;
  const next = characterTitles[nextIdx];
  return { title: next.title, threshold: next.threshold, need: next.threshold - progress.playCount };
}

export const defaultSaveData: SaveData = {
  highScores: {},
  starProgress: {},
  unlockedBikes: ['bike-classic'],
  unlockedPapers: ['paper-daily'],
  unlockedCharacters: ['char-tommy'],
  selectedBike: 'bike-classic',
  selectedPaper: 'paper-daily',
  selectedCharacter: 'char-tommy',
  totalCoins: 0,
  totalDeliveries: 0,
  persistentStats: { ...defaultPersistentStats },
  levelHistory: {},
  characterProgress: { 'char-tommy': makeCharacterProgress('char-tommy') },
  settings: defaultSettings,
};

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepClone(defaultSaveData);
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const cp: Record<string, CharacterProgress> = {};
    if (parsed.unlockedCharacters) {
      parsed.unlockedCharacters.forEach(id => {
        cp[id] = parsed.characterProgress?.[id] || makeCharacterProgress(id);
      });
    }
    const existingCP = parsed.characterProgress || {};
    Object.keys(existingCP).forEach(id => {
      if (!cp[id]) cp[id] = makeCharacterProgress(id);
    });
    return {
      ...defaultSaveData,
      ...parsed,
      persistentStats: { ...defaultPersistentStats, ...(parsed.persistentStats || {}) },
      levelHistory: parsed.levelHistory || {},
      characterProgress: cp,
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
    };
  } catch {
    return deepClone(defaultSaveData);
  }
}

function deepClone<T>(o: T): T { return JSON.parse(JSON.stringify(o)); }

export function saveSaveData(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.warn('Failed to save game data');
  }
}
