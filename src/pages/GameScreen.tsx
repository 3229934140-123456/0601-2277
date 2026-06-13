import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PixelButton from '@/components/PixelButton';
import PixelStars from '@/components/PixelStars';
import ScanlineOverlay from '@/components/ScanlineOverlay';
import HudBar from '@/components/HudBar';
import ChargeBar from '@/components/ChargeBar';
import { useGameStore } from '@/store/useGameStore';
import { useAudio } from '@/hooks/useAudio';
import { useKeyboard } from '@/hooks/useKeyboard';
import { GameEngine, EngineCallbacks } from '@/game/GameEngine';
import { HitEffect } from '@/game/Renderer';
import { getBikeById } from '@/data/bikes';
import { getPaperById } from '@/data/papers';
import { getCharacterById } from '@/data/characters';
import { Play, Pause, ArrowLeft, RotateCcw, Home } from 'lucide-react';

const CANVAS_W = 960;
const CANVAS_H = 640;

export default function GameScreen() {
  const { levelId = '' } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rafRef = useRef(0);
  const renderRafRef = useRef(0);
  const { playSfx } = useAudio();
  const { keyState, consumeJustPressed, resetAction } = useKeyboard();
  const [showPause, setShowPause] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(3);
  const endedRef = useRef(false);
  const countdownRef = useRef<number | null>(3);

  const comboRef = useRef(0);
  const isPausedRef = useRef(false);
  const isGameOverRef = useRef(false);
  const isVictoryRef = useRef(false);
  const showPauseRef = useRef(false);
  const engineCreatedRef = useRef(false);

  const currentLevel = useGameStore(s => s.currentLevel);
  const selectedBikeId = useGameStore(s => s.saveData.selectedBike);
  const selectedPaperId = useGameStore(s => s.saveData.selectedPaper);
  const selectedCharacterId = useGameStore(s => s.saveData.selectedCharacter);
  const startLevel = useGameStore(s => s.startLevel);
  const setPaused = useGameStore(s => s.setPaused);
  const isPaused = useGameStore(s => s.isPaused);
  const isGameOver = useGameStore(s => s.isGameOver);
  const isVictory = useGameStore(s => s.isVictory);
  const combo = useGameStore(s => s.combo);
  const tickTime = useGameStore(s => s.tickTime);
  const endGame = useGameStore(s => s.endGame);

  useEffect(() => { countdownRef.current = countdown; }, [countdown]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);
  useEffect(() => { isVictoryRef.current = isVictory; }, [isVictory]);
  useEffect(() => { showPauseRef.current = showPause; }, [showPause]);

  useEffect(() => {
    if (!currentLevel || currentLevel.id !== levelId) {
      engineCreatedRef.current = false;
      startLevel(levelId);
    }
  }, [levelId, currentLevel, startLevel]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => (c === null ? c : c - 1)), 800);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setCountdown(null);
        playSfx('powerup');
      }, 600);
      return () => clearTimeout(t);
    }
  }, [countdown, playSfx]);

  const createEngine = useCallback(() => {
    if (!currentLevel || !canvasRef.current || engineCreatedRef.current) return;
    engineCreatedRef.current = true;

    const bike = getBikeById(selectedBikeId);
    const paper = getPaperById(selectedPaperId);
    const character = getCharacterById(selectedCharacterId);
    const lvl = currentLevel;

    const cb: EngineCallbacks = {
      onScore: (delta) => {
        const s = useGameStore.getState();
        const bonus = 1 + Math.min(2, s.combo * 0.1);
        const total = Math.round(delta * bonus);
        s.updateScore(total);
        if (comboRef.current >= 3 && engineRef.current) {
          engineRef.current.addEffect({
            type: 'text',
            x: engineRef.current.player.x,
            y: engineRef.current.player.y - 30,
            life: 0.8,
            maxLife: 0.8,
            text: `x${s.combo + 1}`,
            color: '#FFD93D'
          });
        }
      },
      onCombo: () => useGameStore.getState().addCombo(),
      onComboReset: () => useGameStore.getState().resetCombo(),
      onDamage: (amount) => {
        useGameStore.getState().takeDamage(amount);
        playSfx('hit');
      },
      onCoin: () => {
        useGameStore.getState().collectCoin();
        playSfx('coin');
      },
      onTimeAdd: (s) => {
        useGameStore.getState().addTime(s);
        playSfx('powerup');
      },
      onPaperThrown: (success) => {
        useGameStore.getState().deliverPaper(success);
        playSfx(success ? 'deliverSuccess' : 'deliverMiss');
      },
      onVictory: () => {},
      onGameOver: () => {},
      onEffect: (_e: HitEffect) => {},
      usePaper: () => useGameStore.getState().usePaper(),
    };

    const engine = new GameEngine(lvl, bike, paper, character, cb);
    engineRef.current = engine;
    engine.start();

    const render = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && engineRef.current) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        engineRef.current.render(ctx);
        ctx.restore();
      }
      renderRafRef.current = requestAnimationFrame(render);
    };
    renderRafRef.current = requestAnimationFrame(render);
  }, [currentLevel, selectedBikeId, selectedPaperId, selectedCharacterId, playSfx]);

  useEffect(() => {
    if (!currentLevel) return;
    createEngine();
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
      cancelAnimationFrame(renderRafRef.current);
      engineCreatedRef.current = false;
    };
  }, [currentLevel, createEngine]);

  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      try {
        if (!engineRef.current || countdownRef.current !== null) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }
        const engine = engineRef.current;
        const paused = isPausedRef.current || showPauseRef.current;
        engine.setPaused(paused);

        if (!paused) {
          let dx = 0, dy = 0;
          if (keyState.current.left) dx -= 1;
          if (keyState.current.right) dx += 1;
          if (keyState.current.up) dy -= 1;
          if (keyState.current.down) dy += 1;

          const onPuddle = engine.onPuddle();
          engine.movePlayer(dx, dy, onPuddle);
          tickTime(1 / 60);

          const playerTop = engine.player.y < CANVAS_H / 2;
          const baseAngle = playerTop ? Math.PI / 2 : -Math.PI / 2;
          const offset = dx === 0 ? 0 : dx > 0 ? -Math.PI / 5 : Math.PI / 5;
          engine.setAimAngle(baseAngle + offset);

          if (consumeJustPressed('action') && !engine.charging) {
            engine.beginCharge();
            playSfx('charge');
          }
          if (!keyState.current.action && engine.charging) {
            engine.releaseCharge();
            resetAction();
          }
          if (consumeJustPressed('pause')) {
            setShowPause(p => {
              const np = !p;
              showPauseRef.current = np;
              return np;
            });
            playSfx('menu');
          }
        }

        if (isGameOverRef.current && !endedRef.current) {
          endedRef.current = true;
          const victory = isVictoryRef.current;
          setTimeout(() => {
            const result = endGame(victory);
            if (result) navigate(`/result/${levelId}`, { state: { victory } });
          }, 1200);
        }
      } catch (_e) { /* noop */ }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [levelId, keyState, consumeJustPressed, resetAction, tickTime, playSfx, endGame]);

  const handleRestart = () => {
    playSfx('menu');
    endedRef.current = false;
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }
    cancelAnimationFrame(renderRafRef.current);
    engineCreatedRef.current = false;
    setShowPause(false);
    showPauseRef.current = false;
    setCountdown(3);
    countdownRef.current = 3;
    startLevel(levelId);
  };

  if (!currentLevel) return null;

  return (
    <div className="min-h-screen w-full bg-pixel-bg flex flex-col items-center justify-center p-2 md:p-4 relative">
      <ScanlineOverlay />

      <div className="w-full max-w-[980px]">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="font-pixel text-sm md:text-base text-pixel-yellow pixel-text-shadow-sm flex items-center gap-2">
            📍 {currentLevel.name}
          </div>
          <div className="flex gap-2">
            <PixelButton variant="outline" size="sm" icon={showPause ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              onClick={() => { setShowPause(p => !p); playSfx('menu'); }}>
              {showPause ? '继续' : '暂停'}
            </PixelButton>
            <PixelButton variant="outline" size="sm" icon={<Home className="w-3 h-3" />}
              onClick={() => { playSfx('menu'); navigate('/levels'); }}>
              退出
            </PixelButton>
          </div>
        </div>

        <div className="pixel-border bg-pixel-brown p-0 relative overflow-hidden">
          <HudBar />
          <div className="relative bg-black" style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}`, maxHeight: '70vh' }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="w-full h-full block game-canvas"
              style={{ imageRendering: 'pixelated' }}
            />

            {countdown !== null && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-pixel text-[120px] md:text-[160px] text-pixel-yellow pixel-text-shadow animate-pixel-float">
                    {countdown > 0 ? countdown : 'GO!'}
                  </div>
                  <div className="font-pixel text-2xl text-pixel-green mt-4">
                    {countdown > 0 ? '准备出发!' : '冲啊!'}
                  </div>
                </div>
              </div>
            )}

            {showPause && countdown === null && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="pixel-border bg-pixel-brown p-8 text-center max-w-sm">
                  <div className="font-pixel text-3xl text-pixel-yellow pixel-text-shadow mb-6">游戏暂停</div>
                  <div className="space-y-3">
                    <PixelButton variant="default" block icon={<Play className="w-4 h-4" />}
                      onClick={() => { setShowPause(false); playSfx('menu'); }}>
                      继续游戏
                    </PixelButton>
                    <PixelButton variant="yellow" block icon={<RotateCcw className="w-4 h-4" />}
                      onClick={handleRestart}>
                      重新开始
                    </PixelButton>
                    <PixelButton variant="red" block icon={<ArrowLeft className="w-4 h-4" />}
                      onClick={() => { playSfx('menu'); navigate('/levels'); }}>
                      返回关卡选择
                    </PixelButton>
                  </div>
                </div>
              </div>
            )}

            {isGameOver && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center">
                  <div className={`font-pixel text-5xl md:text-6xl pixel-text-shadow mb-4 ${isVictory ? 'text-pixel-green' : 'text-pixel-red'}`}>
                    {isVictory ? '🎉 胜利!' : '💥 失败'}
                  </div>
                  {!isVictory && <PixelStars stars={0} size="lg" />}
                  <div className="font-retro text-2xl text-pixel-paper mt-4 animate-pixel-blink">结算中...</div>
                </div>
              </div>
            )}
          </div>
          <ChargeBar />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 font-retro text-sm text-pixel-paper/70">
          <div className="pixel-border-sm bg-pixel-brown p-2 text-center">WASD/↑↓←→ 移动</div>
          <div className="pixel-border-sm bg-pixel-brown p-2 text-center">空格 蓄力投递</div>
          <div className="pixel-border-sm bg-pixel-brown p-2 text-center">ESC 暂停</div>
        </div>
      </div>
    </div>
  );
}
