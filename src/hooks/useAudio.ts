import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  sfxDeliverSuccess, sfxDeliverMiss, sfxCoin, sfxHit, sfxPowerup,
  sfxCharge, sfxMenuClick, sfxVictory, sfxGameOver,
  startBGM, stopBGM, setBGMVolume,
} from '@/utils/audio';

export type SfxName =
  | 'deliverSuccess' | 'deliverMiss' | 'coin' | 'hit'
  | 'powerup' | 'charge' | 'menu' | 'victory' | 'gameover';

export function useAudio() {
  const settings = useGameStore(s => s.saveData.settings);
  const bgmStartedRef = useRef(false);

  useEffect(() => {
    if (settings.musicEnabled) {
      if (!bgmStartedRef.current) {
        startBGM(settings.musicVolume);
        bgmStartedRef.current = true;
      } else {
        setBGMVolume(settings.musicVolume);
      }
    } else {
      stopBGM();
      bgmStartedRef.current = false;
    }
    return () => { stopBGM(); bgmStartedRef.current = false; };
  }, [settings.musicEnabled, settings.musicVolume]);

  const playSfx = (name: SfxName) => {
    if (!settings.sfxEnabled) return;
    const v = settings.sfxVolume;
    switch (name) {
      case 'deliverSuccess': sfxDeliverSuccess(v); break;
      case 'deliverMiss': sfxDeliverMiss(v); break;
      case 'coin': sfxCoin(v); break;
      case 'hit': sfxHit(v); break;
      case 'powerup': sfxPowerup(v); break;
      case 'charge': sfxCharge(v); break;
      case 'menu': sfxMenuClick(v); break;
      case 'victory': sfxVictory(v); break;
      case 'gameover': sfxGameOver(v); break;
    }
  };

  return { playSfx };
}
