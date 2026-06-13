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

export interface LevelHistory {
  score: number;
  stars: 0 | 1 | 2 | 3;
  character: string;
  bike: string;
  paper: string;
  deliveries: number;
  coinsCollected: number;
  comboMax: number;
  damageTaken: number;
  timeLeft: number;
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
  levelHistory: Record<string, LevelHistory>;
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
  settings: defaultSettings,
};

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultSaveData, persistentStats: { ...defaultPersistentStats }, levelHistory: {} };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...defaultSaveData,
      ...parsed,
      persistentStats: { ...defaultPersistentStats, ...(parsed.persistentStats || {}) },
      levelHistory: parsed.levelHistory || {},
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
    };
  } catch {
    return { ...defaultSaveData, persistentStats: { ...defaultPersistentStats }, levelHistory: {} };
  }
}

export function saveSaveData(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.warn('Failed to save game data');
  }
}
