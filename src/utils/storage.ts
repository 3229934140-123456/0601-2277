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
  settings: defaultSettings,
};

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultSaveData };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...defaultSaveData,
      ...parsed,
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
    };
  } catch {
    return { ...defaultSaveData };
  }
}

export function saveSaveData(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.warn('Failed to save game data');
  }
}
