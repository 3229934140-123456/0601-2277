import { create } from 'zustand';
import {
  loadSaveData, saveSaveData, defaultSaveData, SaveData, GameSettings, PersistentStats,
  LevelHistoryEntry, CharacterProgress, makeCharacterProgress,
} from '@/utils/storage';
import { LEVELS, getLevelById, Level, LevelResult } from '@/data/levels';
import { BIKES } from '@/data/bikes';
import { PAPERS } from '@/data/papers';
import { CHARACTERS } from '@/data/characters';

interface GameState {
  saveData: SaveData;
  currentLevel: Level | null;
  score: number;
  combo: number;
  comboMax: number;
  lives: number;
  timeLeft: number;
  papersLeft: number;
  deliveries: number;
  coinsCollected: number;
  totalCoins: number;
  damageTaken: number;
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  charge: number;
  charging: boolean;
  noDamageRun: boolean;
  papersMissed: number;
  loadSave: () => void;
  saveGame: () => void;
  startLevel: (levelId: string) => void;
  updateScore: (delta: number) => void;
  addCombo: () => void;
  resetCombo: () => void;
  takeDamage: (amount: number) => void;
  deliverPaper: (success: boolean) => void;
  collectCoin: () => void;
  addTime: (seconds: number) => void;
  tickTime: (delta: number) => void;
  endGame: (victory: boolean) => LevelResult | null;
  updateSettings: (settings: Partial<GameSettings>) => void;
  unlockItem: (type: 'bike' | 'paper' | 'character', id: string) => { newlyUnlocked: string[] };
  selectSkin: (type: 'bike' | 'paper' | 'character', id: string) => void;
  setCharge: (v: number) => void;
  setCharging: (v: boolean) => void;
  setPaused: (v: boolean) => void;
  usePaper: () => boolean;
  checkAllUnlocks: () => { newlyUnlockedBikes: string[]; newlyUnlockedPapers: string[]; newlyUnlockedCharacters: string[] };
}

export const useGameStore = create<GameState>((set, get) => ({
  saveData: {
    ...defaultSaveData,
    persistentStats: { ...defaultSaveData.persistentStats },
    levelHistory: {},
    characterProgress: { ...defaultSaveData.characterProgress },
  },
  currentLevel: null,
  score: 0,
  combo: 0,
  comboMax: 0,
  lives: 3,
  timeLeft: 90,
  papersLeft: 25,
  deliveries: 0,
  coinsCollected: 0,
  totalCoins: 0,
  damageTaken: 0,
  isPaused: false,
  isGameOver: false,
  isVictory: false,
  charge: 0,
  charging: false,
  noDamageRun: true,
  papersMissed: 0,

  loadSave() {
    const data = loadSaveData();
    set({ saveData: data });
  },

  saveGame() {
    saveSaveData(get().saveData);
  },

  startLevel(levelId: string) {
    const level = getLevelById(levelId);
    if (!level) return;
    set({
      currentLevel: level,
      score: 0,
      combo: 0,
      comboMax: 0,
      lives: level.startLives,
      timeLeft: level.timeLimit,
      papersLeft: level.startPapers,
      deliveries: 0,
      coinsCollected: 0,
      totalCoins: level.pickups.filter(p => p.type === 'coin').length,
      damageTaken: 0,
      isPaused: false,
      isGameOver: false,
      isVictory: false,
      charge: 0,
      charging: false,
      noDamageRun: true,
      papersMissed: 0,
    });
  },

  updateScore(delta) {
    set(s => ({ score: Math.max(0, s.score + delta) }));
  },

  addCombo() {
    set(s => {
      const newCombo = s.combo + 1;
      return { combo: newCombo, comboMax: Math.max(s.comboMax, newCombo) };
    });
  },

  resetCombo() {
    set({ combo: 0 });
  },

  takeDamage(amount) {
    set(s => {
      const newLives = Math.max(0, s.lives - amount);
      return {
        lives: newLives,
        damageTaken: s.damageTaken + amount,
        noDamageRun: false,
        combo: 0,
        isGameOver: newLives <= 0,
      };
    });
  },

  deliverPaper(success) {
    const state = get();
    if (success) {
      const newDeliveries = state.deliveries + 1;
      set(s => ({
        deliveries: newDeliveries,
        combo: s.combo + 1,
        comboMax: Math.max(s.comboMax, s.combo + 1),
      }));
      if (state.currentLevel && newDeliveries >= state.currentLevel.targetDeliveries) {
        setTimeout(() => get().endGame(true), 600);
      }
    } else {
      set(s => ({ papersMissed: s.papersMissed + 1, combo: 0 }));
    }
  },

  collectCoin() {
    set(s => ({ coinsCollected: s.coinsCollected + 1, score: s.score + 50 }));
  },

  addTime(seconds) {
    set(s => ({ timeLeft: s.timeLeft + seconds }));
  },

  tickTime(delta) {
    const s = get();
    if (s.isPaused || s.isGameOver) return;
    const newTime = s.timeLeft - delta;
    if (newTime <= 0) {
      set({ timeLeft: 0, isGameOver: true, isVictory: false });
    } else {
      set({ timeLeft: newTime });
    }
  },

  usePaper() {
    const s = get();
    if (s.papersLeft <= 0) return false;
    set({ papersLeft: s.papersLeft - 1 });
    return true;
  },

  endGame(victory) {
    const s = get();
    if (!s.currentLevel) return null;
    set({ isGameOver: true, isVictory: victory, isPaused: false });

    const result: LevelResult = {
      score: s.score,
      deliveries: s.deliveries,
      targetDeliveries: s.currentLevel.targetDeliveries,
      comboMax: s.comboMax,
      coinsCollected: s.coinsCollected,
      totalCoins: s.totalCoins,
      timeLeft: s.timeLeft,
      timeLimit: s.currentLevel.timeLimit,
      damageTaken: s.damageTaken,
      livesUsed: s.currentLevel.startLives - s.lives,
      startLives: s.currentLevel.startLives,
      papersMissed: s.papersMissed,
    };

    const level = s.currentLevel;
    const conds = level.starConditions;
    let stars: 0 | 1 | 2 | 3 = 0;
    if (conds.three.check(result)) stars = 3;
    else if (conds.two.check(result)) stars = 2;
    else if (conds.one.check(result)) stars = 1;

    const prevStars = s.saveData.starProgress[level.id] || 0;
    const prevHigh = s.saveData.highScores[level.id] || 0;

    const entry: LevelHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      score: s.score,
      stars,
      victory,
      character: s.saveData.selectedCharacter,
      bike: s.saveData.selectedBike,
      paper: s.saveData.selectedPaper,
      deliveries: s.deliveries,
      targetDeliveries: s.currentLevel.targetDeliveries,
      coinsCollected: s.coinsCollected,
      totalCoins: s.totalCoins,
      comboMax: s.comboMax,
      damageTaken: s.damageTaken,
      timeLeft: s.timeLeft,
      timeLimit: s.currentLevel.timeLimit,
      livesUsed: result.livesUsed,
      papersMissed: s.papersMissed,
    };

    const prevHistory = s.saveData.levelHistory[level.id] || [];
    const newHistory = [entry, ...prevHistory].slice(0, 30);

    const ps: PersistentStats = { ...s.saveData.persistentStats };
    ps.deliveriesCount += s.deliveries;
    ps.comboMax = Math.max(ps.comboMax, s.comboMax);
    if (s.noDamageRun && victory) ps.noDamageCount += 1;
    if (stars === 3) ps.threeStars += 1;

    const characterId = s.saveData.selectedCharacter;
    const cp: Record<string, CharacterProgress> = { ...s.saveData.characterProgress };
    if (!cp[characterId]) cp[characterId] = makeCharacterProgress(characterId);
    const cur = { ...cp[characterId] };
    cur.playCount += 1;
    cur.totalDeliveries += s.deliveries;
    cur.totalScore += s.score;
    if (s.noDamageRun && victory) cur.noDamageRuns += 1;
    if (stars === 3) cur.threeStars += 1;
    cp[characterId] = cur;

    const newSave: SaveData = {
      ...s.saveData,
      highScores: { ...s.saveData.highScores, [level.id]: Math.max(prevHigh, s.score) },
      starProgress: { ...s.saveData.starProgress, [level.id]: Math.max(prevStars, stars) as 0 | 1 | 2 | 3 },
      totalCoins: s.saveData.totalCoins + s.coinsCollected,
      totalDeliveries: s.saveData.totalDeliveries + s.deliveries,
      persistentStats: ps,
      levelHistory: { ...s.saveData.levelHistory, [level.id]: newHistory },
      characterProgress: cp,
    };
    set({ saveData: newSave });
    saveSaveData(newSave);

    return result;
  },

  updateSettings(settings) {
    set(s => {
      const newSave = {
        ...s.saveData,
        settings: { ...s.saveData.settings, ...settings },
      };
      saveSaveData(newSave);
      return { saveData: newSave };
    });
  },

  unlockItem(type, id) {
    const s = get();
    let key: 'unlockedBikes' | 'unlockedPapers' | 'unlockedCharacters';
    if (type === 'bike') key = 'unlockedBikes';
    else if (type === 'paper') key = 'unlockedPapers';
    else key = 'unlockedCharacters';
    const list = s.saveData[key];
    if (list.includes(id)) return { newlyUnlocked: [] };
    const cp = { ...s.saveData.characterProgress };
    if (type === 'character' && !cp[id]) cp[id] = makeCharacterProgress(id);
    const newSave = { ...s.saveData, [key]: [...list, id], characterProgress: cp };
    set({ saveData: newSave });
    saveSaveData(newSave);
    return { newlyUnlocked: [id] };
  },

  selectSkin(type, id) {
    const s = get();
    let key: 'selectedBike' | 'selectedPaper' | 'selectedCharacter';
    let unlockKey: 'unlockedBikes' | 'unlockedPapers' | 'unlockedCharacters';
    if (type === 'bike') { key = 'selectedBike'; unlockKey = 'unlockedBikes'; }
    else if (type === 'paper') { key = 'selectedPaper'; unlockKey = 'unlockedPapers'; }
    else { key = 'selectedCharacter'; unlockKey = 'unlockedCharacters'; }
    if (!s.saveData[unlockKey].includes(id)) return;
    const newSave = { ...s.saveData, [key]: id };
    set({ saveData: newSave });
    saveSaveData(newSave);
  },

  setCharge(v) { set({ charge: v }); },
  setCharging(v) { set({ charging: v }); },
  setPaused(v) { set({ isPaused: v }); },

  checkAllUnlocks() {
    const s = get();
    const newlyUnlockedBikes: string[] = [];
    const newlyUnlockedPapers: string[] = [];
    const newlyUnlockedCharacters: string[] = [];
    const ps = s.saveData.persistentStats;

    BIKES.forEach(b => {
      if (s.saveData.unlockedBikes.includes(b.id)) return;
      let unlock = false;
      switch (b.id) {
        case 'bike-classic': unlock = true; break;
        case 'bike-redracer': unlock = s.saveData.totalDeliveries >= b.unlockValue; break;
        case 'bike-bluecruiser': unlock = s.saveData.totalCoins >= b.unlockValue; break;
        case 'bike-yellowbmx': unlock = Object.values(s.saveData.starProgress).some(v => v >= 3); break;
        case 'bike-purplemountain': {
          const allOneStar = LEVELS.every(l => (s.saveData.starProgress[l.id] || 0) >= 1);
          unlock = allOneStar;
          break;
        }
        case 'bike-fixie': unlock = ps.noDamageCount >= b.unlockValue; break;
        case 'bike-steampunk': {
          const totalScore = Object.values(s.saveData.highScores).reduce((a, b) => a + b, 0);
          unlock = totalScore >= b.unlockValue;
          break;
        }
        case 'bike-neonfuture': unlock = ps.threeStars >= b.unlockValue; break;
      }
      if (unlock) {
        const res = s.unlockItem('bike', b.id);
        newlyUnlockedBikes.push(...res.newlyUnlocked);
      }
    });

    PAPERS.forEach(p => {
      if (s.saveData.unlockedPapers.includes(p.id)) return;
      let unlock = false;
      switch (p.id) {
        case 'paper-daily': unlock = true; break;
        case 'paper-morning': unlock = s.saveData.totalDeliveries >= p.unlockValue; break;
        case 'paper-sports': unlock = ps.comboMax >= p.unlockValue; break;
        case 'paper-finance': unlock = s.saveData.totalCoins >= p.unlockValue; break;
        case 'paper-comic': {
          const anyOver = Object.values(s.saveData.highScores).some(v => v >= p.unlockValue);
          unlock = anyOver;
          break;
        }
        case 'paper-midnight': unlock = ps.noDamageCount >= p.unlockValue; break;
      }
      if (unlock) {
        const res = s.unlockItem('paper', p.id);
        newlyUnlockedPapers.push(...res.newlyUnlocked);
      }
    });

    CHARACTERS.forEach(c => {
      if (s.saveData.unlockedCharacters.includes(c.id)) return;
      let unlock = false;
      switch (c.id) {
        case 'char-tommy': unlock = true; break;
        case 'char-jenny': unlock = s.saveData.totalDeliveries >= c.unlockValue; break;
        case 'char-rocky': unlock = s.saveData.totalCoins >= c.unlockValue; break;
        case 'char-miki': unlock = ps.comboMax >= c.unlockValue; break;
        case 'char-arthur': unlock = ps.noDamageCount >= c.unlockValue; break;
        case 'char-neo': {
          const totalScore = Object.values(s.saveData.highScores).reduce((a, b) => a + b, 0);
          unlock = totalScore >= c.unlockValue;
          break;
        }
        case 'char-pete': {
          const allOneStar = LEVELS.every(l => (s.saveData.starProgress[l.id] || 0) >= 1);
          unlock = allOneStar;
          break;
        }
        case 'char-zara': unlock = ps.threeStars >= c.unlockValue; break;
      }
      if (unlock) {
        const res = s.unlockItem('character', c.id);
        newlyUnlockedCharacters.push(...res.newlyUnlocked);
      }
    });

    return { newlyUnlockedBikes, newlyUnlockedPapers, newlyUnlockedCharacters };
  },
}));
