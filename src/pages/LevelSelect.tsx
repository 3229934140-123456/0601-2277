import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from '@/components/PixelButton';
import PixelStars from '@/components/PixelStars';
import ScanlineOverlay from '@/components/ScanlineOverlay';
import { useGameStore } from '@/store/useGameStore';
import { useAudio } from '@/hooks/useAudio';
import { LEVELS, isLevelUnlocked, Level } from '@/data/levels';
import { ArrowLeft, Lock, Trophy, Clock, Target, Shield, Coins } from 'lucide-react';
import clsx from 'clsx';

export default function LevelSelect() {
  const navigate = useNavigate();
  const { playSfx } = useAudio();
  const starProgress = useGameStore(s => s.saveData.starProgress);
  const highScores = useGameStore(s => s.saveData.highScores);
  const [hoverLevel, setHoverLevel] = useState<Level | null>(null);

  const handleStart = (level: Level) => {
    if (!isLevelUnlocked(level.id, starProgress)) return;
    playSfx('menu');
    useGameStore.getState().startLevel(level.id);
    navigate(`/game/${level.id}`);
  };

  return (
    <div className="min-h-screen w-full bg-pixel-bg p-4 md:p-8 relative overflow-hidden">
      <ScanlineOverlay />

      <div className="max-w-6xl mx-auto relative">
        <div className="flex items-center justify-between mb-6">
          <PixelButton variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => { playSfx('menu'); navigate('/'); }}>
            返回
          </PixelButton>
          <h1 className="font-pixel text-2xl md:text-3xl text-pixel-yellow pixel-text-shadow">
            选择关卡
          </h1>
          <div className="w-[120px]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEVELS.map((level, idx) => {
            const unlocked = isLevelUnlocked(level.id, starProgress);
            const stars = starProgress[level.id] || 0;
            const high = highScores[level.id] || 0;

            return (
              <button
                key={level.id}
                disabled={!unlocked}
                onClick={() => handleStart(level)}
                onMouseEnter={() => setHoverLevel(level)}
                onMouseLeave={() => setHoverLevel(null)}
                className={clsx(
                  'pixel-border text-left p-5 transition-all hover:-translate-y-1 relative',
                  unlocked ? 'bg-pixel-brown hover:bg-pixel-brownLight' : 'bg-pixel-brown/60 cursor-not-allowed',
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="font-pixel text-sm text-pixel-yellow pixel-text-shadow-sm">
                    第{idx + 1}关
                  </div>
                  {!unlocked && (
                    <div className="bg-pixel-red text-white px-2 py-1 rounded-sm flex items-center gap-1 font-pixel text-[10px]">
                      <Lock className="w-3 h-3" /> 锁定
                    </div>
                  )}
                </div>

                <div className="mb-3 relative">
                  <LevelThumbnail level={level} />
                  {!unlocked && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <Lock className="w-12 h-12 text-pixel-yellow" />
                    </div>
                  )}
                </div>

                <div className="font-pixel text-base text-pixel-paper pixel-text-shadow-sm mb-1">
                  {level.name}
                </div>
                <div className="font-retro text-sm text-pixel-paper/70 mb-3 min-h-[2.5rem]">
                  {level.description}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <PixelStars stars={stars} size="sm" animate={false} />
                  <div className="font-pixel text-[10px] text-pixel-gold tabular-nums">
                    最高: {high.toString().padStart(5, '0')}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 font-retro text-xs text-pixel-paper/80">
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-pixel-blue" />{level.timeLimit}s</div>
                  <div className="flex items-center gap-1"><Target className="w-3 h-3 text-pixel-green" />{level.targetDeliveries}份</div>
                </div>

                {hoverLevel?.id === level.id && unlocked && (
                  <div className="absolute left-0 right-0 -bottom-[210px] z-20 pixel-border-sm bg-pixel-bg p-4 mt-2" style={{ borderColor: '#FFD93D' }}>
                    <div className="font-pixel text-[10px] text-pixel-yellow mb-2 flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> 三星条件
                    </div>
                    <div className="space-y-1 font-retro text-sm">
                      <StarLine color="#CD7F32" text={level.starConditions.one.desc} done={stars >= 1} />
                      <StarLine color="#C0C0C0" text={level.starConditions.two.desc} done={stars >= 2} />
                      <StarLine color="#FFD700" text={level.starConditions.three.desc} done={stars >= 3} />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StarLine({ color, text, done }: { color: string; text: string; done: boolean }) {
  return (
    <div className={`flex items-start gap-2 ${done ? '' : 'opacity-60'}`}>
      <div className="w-4 h-4 mt-0.5 shrink-0" style={{ background: done ? color : 'transparent', border: `2px solid ${color}` }} />
      <div className={done ? 'text-pixel-paper' : 'text-pixel-paper/60'}>
        {done && '✅ '}{text}
      </div>
    </div>
  );
}

function LevelThumbnail({ level }: { level: Level }) {
  return (
    <div className="aspect-[3/2] bg-pixel-bg overflow-hidden relative border-2 border-pixel-yellow/40">
      <svg viewBox="0 0 96 64" className="w-full h-full" preserveAspectRatio="none" style={{ imageRendering: 'pixelated' }}>
        <rect x="0" y="0" width="96" height="64" fill="#7EC850" />
        <rect x="0" y="22" width="96" height="26" fill="#555555" />
        <rect x="0" y="22" width="96" height="2" fill="#8B7355" />
        <rect x="0" y="46" width="96" height="2" fill="#8B7355" />
        <rect x="0" y="20" width="96" height="2" fill="#C2B280" />
        <rect x="0" y="48" width="96" height="2" fill="#C2B280" />
        {Array.from({ length: 3 }).map((_, i) => (
          <g key={i}>
            <rect x={6 + i * 30} y={4} width={20} height={14} fill={i % 2 ? '#DEB887' : '#F5DEB3'} />
            <polygon points={`${6 + i * 30},4 ${16 + i * 30},-1 ${26 + i * 30},4`} fill={i % 2 ? '#8B4513' : '#A52A2A'} />
            <rect x={8 + i * 30} y={8} width={4} height={4} fill="#ADD8E6" />
            <rect x={20 + i * 30} y={8} width={4} height={4} fill="#ADD8E6" />

            <rect x={6 + i * 30} y={46} width={20} height={14} fill={i % 2 ? '#E6CFA1' : '#FFEFD5'} />
            <polygon points={`${6 + i * 30},60 ${16 + i * 30},65 ${26 + i * 30},60`} fill={i % 2 ? '#556B2F' : '#4682B4'} />
            <rect x={8 + i * 30} y={50} width={4} height={4} fill="#ADD8E6" />
            <rect x={20 + i * 30} y={50} width={4} height={4} fill="#ADD8E6" />
          </g>
        ))}
        <rect x={28} y={30} width={4} height={6} fill="#4A9E55" />
        <rect x={26} y={28} width={8} height={3} fill="#4A9E55" />
        <rect x={28} y={22} width={4} height={6} fill="#FFD8A8" />
      </svg>
    </div>
  );
}
