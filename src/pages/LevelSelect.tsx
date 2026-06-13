import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from '@/components/PixelButton';
import PixelStars from '@/components/PixelStars';
import ScanlineOverlay from '@/components/ScanlineOverlay';
import { useGameStore } from '@/store/useGameStore';
import { useAudio } from '@/hooks/useAudio';
import { LEVELS, isLevelUnlocked, Level, LevelResult } from '@/data/levels';
import { getBikeById } from '@/data/bikes';
import { getPaperById } from '@/data/papers';
import { getCharacterById } from '@/data/characters';
import { LevelHistoryEntry } from '@/utils/storage';
import { getStarOneGap, getStarTwoGap, getStarThreeGap } from '@/utils/gap';
import {
  ArrowLeft, Lock, Trophy, Clock, Target, Shield, Coins, ChevronDown, ChevronUp, Check,
  Zap, Calendar, Crown, Flame,
} from 'lucide-react';
import clsx from 'clsx';

type ViewMode = 'best' | 'star' | 'recent';

export default function LevelSelect() {
  const navigate = useNavigate();
  const { playSfx } = useAudio();
  const starProgress = useGameStore(s => s.saveData.starProgress);
  const highScores = useGameStore(s => s.saveData.highScores);
  const levelHistory = useGameStore(s => s.saveData.levelHistory);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('best');

  const handleStart = (level: Level) => {
    if (!isLevelUnlocked(level.id, starProgress)) return;
    playSfx('menu');
    useGameStore.getState().startLevel(level.id);
    navigate(`/game/${level.id}`);
  };

  const toggleExpand = (levelId: string) => {
    setExpandedLevel(prev => prev === levelId ? null : levelId);
    if (expandedLevel !== levelId) setViewMode('best');
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

        <div className="space-y-4">
          {LEVELS.map((level, idx) => {
            const unlocked = isLevelUnlocked(level.id, starProgress);
            const stars = starProgress[level.id] || 0;
            const high = highScores[level.id] || 0;
            const history = levelHistory[level.id] || [];
            const expanded = expandedLevel === level.id;

            const bestEntry = useMemo(() => [...history].sort((a, b) => b.score - a.score)[0], [history]);
            const starEntry = useMemo(() => [...history].sort((a, b) => b.stars - a.stars || b.score - a.score)[0], [history]);
            const recentEntry = useMemo(() => history[0], [history]);

            const displayEntry: LevelHistoryEntry | undefined =
              viewMode === 'best' ? bestEntry : viewMode === 'star' ? starEntry : recentEntry;

            return (
              <div key={level.id} className={clsx('pixel-border transition-all', unlocked ? 'bg-pixel-brown' : 'bg-pixel-brown/60')}>
                <div className="flex items-stretch">
                  <button
                    disabled={!unlocked}
                    onClick={() => handleStart(level)}
                    className="flex-1 text-left p-4 md:p-5 flex items-center gap-4 disabled:cursor-not-allowed"
                  >
                    <div className="w-16 h-12 shrink-0">
                      <LevelThumbnail level={level} />
                      {!unlocked && (
                        <div className="relative -mt-12 h-12 bg-black/70 flex items-center justify-center">
                          <Lock className="w-8 h-8 text-pixel-yellow" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-pixel text-sm text-pixel-yellow pixel-text-shadow-sm">第{idx + 1}关</span>
                        {!unlocked && (
                          <span className="bg-pixel-red text-white px-2 py-0.5 font-pixel text-[8px] flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> 锁定
                          </span>
                        )}
                      </div>
                      <div className="font-pixel text-base text-pixel-paper pixel-text-shadow-sm">{level.name}</div>
                      <div className="font-retro text-sm text-pixel-paper/70 mt-0.5">{level.description}</div>
                    </div>

                    <div className="shrink-0 text-right">
                      <PixelStars stars={stars} size="sm" animate={false} />
                      <div className="font-pixel text-[10px] text-pixel-gold tabular-nums mt-1">
                        {high.toString().padStart(5, '0')}
                      </div>
                    </div>
                  </button>

                  {unlocked && (
                    <button
                      onClick={() => toggleExpand(level.id)}
                      className="px-3 border-l-4 border-pixel-yellow/30 hover:bg-pixel-brownLight transition-colors flex items-center"
                    >
                      {expanded ? <ChevronUp className="w-5 h-5 text-pixel-yellow" /> : <ChevronDown className="w-5 h-5 text-pixel-yellow" />}
                    </button>
                  )}
                </div>

                {expanded && unlocked && (
                  <div className="border-t-4 border-pixel-yellow/20 p-4 md:p-5 bg-pixel-brown/80">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <ViewTab mode="best" active={viewMode === 'best'} onClick={() => setViewMode('best')} label="最高分" icon={<Crown className="w-3 h-3" />} />
                      <ViewTab mode="star" active={viewMode === 'star'} onClick={() => setViewMode('star')} label="最佳星级" icon={<Trophy className="w-3 h-3" />} />
                      <ViewTab mode="recent" active={viewMode === 'recent'} onClick={() => setViewMode('recent')} label="最近一次" icon={<Calendar className="w-3 h-3" />} />
                      <div className="ml-auto font-pixel text-[8px] text-pixel-paper/40">
                        共 {history.length} 次战绩
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-pixel text-[10px] text-pixel-yellow mb-3 flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> 三星挑战进度
                        </div>
                        <div className="space-y-3">
                          <StarProgressBlock color="#CD7F32" text={level.starConditions.one.desc} level={level} entry={displayEntry} gapFn={getStarOneGap} star={1} />
                          <StarProgressBlock color="#C0C0C0" text={level.starConditions.two.desc} level={level} entry={displayEntry} gapFn={getStarTwoGap} star={2} />
                          <StarProgressBlock color="#FFD700" text={level.starConditions.three.desc} level={level} entry={displayEntry} gapFn={getStarThreeGap} star={3} />
                        </div>
                      </div>

                      <div>
                        <div className="font-pixel text-[10px] text-pixel-yellow mb-3">
                          {displayEntry
                            ? `${viewMode === 'best' ? '最高分' : viewMode === 'star' ? '最佳星级' : '最近一次'}战绩`
                            : '历史记录'}
                        </div>
                        {displayEntry ? (
                          <div className="space-y-1.5 font-retro text-sm">
                            <div className="flex items-center justify-between mb-1 pixel-border-sm bg-pixel-bg p-2">
                              <PixelStars stars={displayEntry.stars} size="xs" animate={false} />
                              <span className="font-pixel text-base text-pixel-yellow tabular-nums">{displayEntry.score}</span>
                            </div>
                            <BestRow icon={<Target className="w-3 h-3 text-pixel-green" />} label="投递" value={`${displayEntry.deliveries}/${displayEntry.targetDeliveries}份`} />
                            <BestRow icon={<Coins className="w-3 h-3 text-pixel-yellow" />} label="金币" value={`${displayEntry.coinsCollected}/${displayEntry.totalCoins}枚`} />
                            <BestRow icon={<Flame className="w-3 h-3 text-orange-400" />} label="连击" value={`x${displayEntry.comboMax}`} />
                            <BestRow icon={<Shield className="w-3 h-3 text-pixel-blue" />} label="受伤"
                              value={displayEntry.damageTaken === 0 ? '无伤!' : `${displayEntry.damageTaken}次`}
                              accent={displayEntry.damageTaken === 0}
                            />
                            <BestRow icon={<Clock className="w-3 h-3 text-pixel-blue" />} label="余时" value={`${Math.ceil(displayEntry.timeLeft)}s`} />
                            <div className="border-t-2 border-pixel-yellow/20 pt-1.5 mt-1.5">
                              <div className="font-pixel text-[8px] text-pixel-paper/50 mb-1">使用配置</div>
                              <div className="flex flex-wrap gap-2">
                                <ConfigTag label="角色" name={getCharacterById(displayEntry.character)?.name || '-'} />
                                <ConfigTag label="自行车" name={getBikeById(displayEntry.bike)?.name || '-'} />
                                <ConfigTag label="报纸" name={getPaperById(displayEntry.paper)?.name || '-'} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="font-retro text-sm text-pixel-paper/50 italic space-y-2">
                            <div>尚未通关</div>
                            <BestRow icon={<Target className="w-3 h-3 text-pixel-green" />} label="目标" value={`${level.targetDeliveries}份投递`} />
                            <BestRow icon={<Clock className="w-3 h-3 text-pixel-blue" />} label="限时" value={`${level.timeLimit}s`} />
                            <BestRow icon={<Zap className="w-3 h-3 text-pixel-yellow" />} label="金币" value={`${level.pickups.filter(p => p.type === 'coin').length}枚`} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <PixelButton variant="yellow" size="sm"
                        onClick={() => handleStart(level)}>
                        开始挑战
                      </PixelButton>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ViewTab({ mode, active, onClick, label, icon }: { mode: ViewMode; active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'pixel-btn flex items-center gap-1 font-pixel text-[10px] px-3 py-1.5 transition-all',
        active ? 'pixel-btn-yellow' : 'pixel-btn-outline opacity-60 hover:opacity-100'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StarProgressBlock({ color, text, level, entry, gapFn, star }: {
  color: string; text: string; level: Level;
  entry: LevelHistoryEntry | undefined;
  gapFn: (r: LevelResult) => { done: boolean; gaps: string[] };
  star: number;
}) {
  const prevStars = (useGameStore.getState().saveData.starProgress[level.id] || 0);
  const starDone = prevStars >= star;

  let gapResult: { done: boolean; gaps: string[] } = { done: starDone, gaps: starDone ? ['已达成'] : ['未通关过，来一局看看吧'] };
  if (entry) {
    const r: LevelResult = {
      score: entry.score,
      deliveries: entry.deliveries,
      targetDeliveries: entry.targetDeliveries,
      comboMax: entry.comboMax,
      coinsCollected: entry.coinsCollected,
      totalCoins: entry.totalCoins,
      timeLeft: entry.timeLeft,
      timeLimit: entry.timeLimit,
      damageTaken: entry.damageTaken,
      livesUsed: entry.livesUsed,
      startLives: 3,
      papersMissed: entry.papersMissed,
    };
    gapResult = gapFn(r);
  }
  const finalDone = starDone;

  return (
    <div className="pixel-border-sm bg-pixel-bg p-2.5">
      <div className={`flex items-center gap-2 font-retro text-sm ${finalDone ? '' : 'opacity-80'}`}>
        <div className="w-5 h-5 shrink-0 flex items-center justify-center"
          style={{ background: finalDone ? color : 'transparent', border: `2px solid ${color}` }}>
          {finalDone && <Check className="w-3 h-3 text-pixel-bg" strokeWidth={3} />}
        </div>
        <span className={finalDone ? 'text-pixel-paper font-semibold' : 'text-pixel-paper/70'}>
          <span className="font-pixel text-[9px] mr-1.5" style={{ color }}>{star}★</span>
          {text}
        </span>
      </div>
      <div className="mt-2 space-y-1 pl-7">
        {gapResult.gaps.map((g, i) => (
          <div key={i} className={clsx(
            'font-retro text-xs',
            finalDone ? 'text-pixel-green' : 'text-pixel-red/90'
          )}>
            {finalDone ? '✓ ' : '↳ '}{g}
          </div>
        ))}
      </div>
    </div>
  );
}

function BestRow({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-pixel-paper/60 w-12 shrink-0">{label}</span>
      <span className={accent ? 'text-pixel-green font-pixel text-xs' : 'text-pixel-paper'}>{value}</span>
    </div>
  );
}

function ConfigTag({ label, name }: { label: string; name: string }) {
  return (
    <div className="pixel-border-sm bg-pixel-brown px-1.5 py-0.5">
      <span className="font-pixel text-[7px] text-pixel-paper/50">{label}</span>
      <span className="font-retro text-xs text-pixel-paper ml-1">{name}</span>
    </div>
  );
}

function LevelThumbnail({ level }: { level: Level }) {
  return (
    <div className="aspect-[4/3] bg-pixel-bg overflow-hidden relative border-2 border-pixel-yellow/40 w-full">
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
