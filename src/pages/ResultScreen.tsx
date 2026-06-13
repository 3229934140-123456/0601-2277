import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PixelButton from '@/components/PixelButton';
import PixelStars from '@/components/PixelStars';
import ScanlineOverlay from '@/components/ScanlineOverlay';
import { useGameStore } from '@/store/useGameStore';
import { useAudio } from '@/hooks/useAudio';
import { getLevelById, LevelResult } from '@/data/levels';
import { BIKES, getBikeById } from '@/data/bikes';
import { PAPERS, getPaperById } from '@/data/papers';
import { ArrowLeft, RotateCcw, Home, Award, Check, X } from 'lucide-react';

interface LocState {
  victory?: boolean;
}

export default function ResultScreen() {
  const { levelId = '' } = useParams();
  const navigate = useNavigate();
  const loc = useLocation();
  const locState = loc.state as LocState | null;
  const { playSfx } = useAudio();
  const level = getLevelById(levelId);
  const checkAllUnlocks = useGameStore(s => s.checkAllUnlocks);
  const starProgress = useGameStore(s => s.saveData.starProgress);
  const highScores = useGameStore(s => s.saveData.highScores);
  const prevStars = starProgress[levelId] || 0;
  const prevHigh = highScores[levelId] || 0;

  const score = useGameStore(s => s.score);
  const comboMax = useGameStore(s => s.comboMax);
  const deliveries = useGameStore(s => s.deliveries);
  const coinsCollected = useGameStore(s => s.coinsCollected);
  const totalCoins = useGameStore(s => s.totalCoins);
  const timeLeft = useGameStore(s => s.timeLeft);
  const timeLimit = level?.timeLimit || 90;
  const damageTaken = useGameStore(s => s.damageTaken);
  const papersMissed = useGameStore(s => s.papersMissed);
  const livesUsed = (level?.startLives || 3) - useGameStore(s => s.lives);
  const target = level?.targetDeliveries || 0;

  const [stars, setStars] = useState<0 | 1 | 2 | 3>(0);
  const [newRecord, setNewRecord] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<{ bikes: string[]; papers: string[] }>({ bikes: [], papers: [] });
  const victory = locState?.victory ?? true;

  useEffect(() => {
    if (!level) return;
    const r: LevelResult = {
      score, deliveries, targetDeliveries: target, comboMax,
      coinsCollected, totalCoins, timeLeft, timeLimit,
      damageTaken, livesUsed, startLives: level.startLives, papersMissed,
    };
    let s: 0 | 1 | 2 | 3 = 0;
    if (level.starConditions.three.check(r)) s = 3;
    else if (level.starConditions.two.check(r)) s = 2;
    else if (level.starConditions.one.check(r)) s = 1;
    setStars(s);
    setNewRecord(score > prevHigh);
    setTimeout(() => setShowStars(true), 600);

    const { newlyUnlockedBikes, newlyUnlockedPapers } = checkAllUnlocks();
    setNewlyUnlocked({ bikes: newlyUnlockedBikes, papers: newlyUnlockedPapers });

    setTimeout(() => playSfx(s >= 2 ? 'victory' : 'menu'), 300);
  }, [level]);

  if (!level) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-pixel-bg">
        <div className="text-pixel-yellow font-pixel">关卡不存在</div>
      </div>
    );
  }

  const conditions = [
    { key: '1', label: level.starConditions.one.desc, got: stars >= 1, color: '#CD7F32' },
    { key: '2', label: level.starConditions.two.desc, got: stars >= 2, color: '#C0C0C0' },
    { key: '3', label: level.starConditions.three.desc, got: stars >= 3, color: '#FFD700' },
  ];

  return (
    <div className="min-h-screen w-full bg-pixel-bg p-4 md:p-8 relative overflow-hidden flex items-center justify-center">
      <ScanlineOverlay />

      <div className="w-full max-w-3xl relative">
        <div className="pixel-border bg-pixel-brown p-6 md:p-10">
          <div className="text-center mb-6">
            <div className={`font-pixel text-2xl md:text-4xl pixel-text-shadow mb-3 ${victory ? 'text-pixel-green' : 'text-pixel-red'}`}>
              {victory ? '🏆 任务完成!' : '😢 再接再厉'}
            </div>
            <div className="font-pixel text-base md:text-xl text-pixel-yellow pixel-text-shadow-sm mb-4">
              {level.name}
            </div>
            <div className="flex justify-center mb-2">
              {showStars ? (
                <PixelStars stars={stars} size="xl" animate />
              ) : (
                <PixelStars stars={0} size="xl" animate={false} />
              )}
            </div>
            {stars > prevStars && (
              <div className="font-retro text-pixel-yellow text-lg mt-2 animate-pulse">
                🌟 新纪录星级! +{stars - prevStars} 星
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="最终得分" value={score.toString()} highlight main newRecord={newRecord} />
            <StatCard label="投递成功" value={`${deliveries}/${target}`} sub={`失误 ${papersMissed}`} />
            <StatCard label="最高连击" value={`x${comboMax}`} />
            <StatCard label="金币收集" value={`${coinsCollected}/${totalCoins}`} />
            <StatCard label="剩余时间" value={`${Math.ceil(timeLeft)}s`} />
            <StatCard label="受伤次数" value={damageTaken.toString()} accent={damageTaken > 0 ? 'red' : 'green'} />
            <StatCard label="生命损失" value={`${livesUsed}/${level.startLives}`} accent={livesUsed > 0 ? 'red' : 'green'} />
            <StatCard label="历史最高" value={Math.max(score, prevHigh).toString()} />
          </div>

          <div className="pixel-border-sm bg-pixel-bg p-4 mb-6">
            <div className="font-pixel text-xs text-pixel-yellow mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" /> 三星条件达成情况
            </div>
            <div className="space-y-2">
              {conditions.map(c => (
                <div key={c.key} className="flex items-center gap-3 font-retro text-base">
                  <div className="w-6 h-6 shrink-0 flex items-center justify-center"
                    style={{ background: c.got ? c.color : 'transparent', border: `3px solid ${c.color}` }}>
                    {c.got && <Check className="w-4 h-4 text-pixel-bg" strokeWidth={4} />}
                  </div>
                  <div className={c.got ? 'text-pixel-paper' : 'text-pixel-paper/50'}>
                    <span className="font-pixel text-[10px] mr-2" style={{ color: c.color }}>{c.key}★</span>
                    {c.label}
                  </div>
                  <div className="ml-auto">
                    {c.got ? <Check className="w-4 h-4 text-pixel-green" /> : <X className="w-4 h-4 text-pixel-red" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(newlyUnlocked.bikes.length > 0 || newlyUnlocked.papers.length > 0) && (
            <div className="pixel-border-sm bg-gradient-to-r from-purple-900/60 to-indigo-900/60 p-4 mb-6 border-purple-400" style={{ borderColor: '#9F7AEA' }}>
              <div className="font-pixel text-xs text-purple-300 mb-3 animate-pulse">
                🎁 解锁新物品!
              </div>
              <div className="space-y-2">
                {newlyUnlocked.bikes.map(id => {
                  const b = getBikeById(id);
                  return (
                    <div key={id} className="flex items-center gap-3 font-retro text-base">
                      <div className="w-10 h-10 bg-pixel-bg border-2 border-purple-400 flex items-center justify-center">🚲</div>
                      <div>
                        <span className="text-pixel-yellow font-pixel text-xs">自行车 </span>
                        <span className="text-pixel-paper">{b.name}</span>
                      </div>
                    </div>
                  );
                })}
                {newlyUnlocked.papers.map(id => {
                  const p = getPaperById(id);
                  return (
                    <div key={id} className="flex items-center gap-3 font-retro text-base">
                      <div className="w-10 h-10 bg-pixel-bg border-2 border-purple-400 flex items-center justify-center">📰</div>
                      <div>
                        <span className="text-pixel-yellow font-pixel text-xs">报纸 </span>
                        <span className="text-pixel-paper">{p.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <PixelButton variant="yellow" icon={<RotateCcw className="w-4 h-4" />} block
              onClick={() => {
                playSfx('menu');
                useGameStore.getState().startLevel(levelId);
                navigate(`/game/${levelId}`);
              }}>
              再来一次
            </PixelButton>
            <PixelButton variant="blue" icon={<ArrowLeft className="w-4 h-4" />} block
              onClick={() => { playSfx('menu'); navigate('/levels'); }}>
              关卡选择
            </PixelButton>
            <PixelButton variant="default" icon={<Home className="w-4 h-4" />} block
              onClick={() => { playSfx('menu'); navigate('/'); }}>
              返回主页
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, highlight, main, newRecord, accent }: {
  label: string; value: string; sub?: string; highlight?: boolean; main?: boolean; newRecord?: boolean;
  accent?: 'red' | 'green';
}) {
  const color = accent === 'red' ? 'text-pixel-red' : accent === 'green' ? 'text-pixel-green' : highlight ? 'text-pixel-yellow' : 'text-pixel-paper';
  return (
    <div className={`pixel-border-sm p-3 text-center relative ${main ? 'bg-pixel-yellow/10' : 'bg-pixel-bg'}`}>
      <div className="font-pixel text-[9px] text-pixel-paper/60 mb-1">{label}</div>
      <div className={`font-pixel ${main ? 'text-xl' : 'text-lg'} pixel-text-shadow-sm tabular-nums ${color}`}>
        {value}
      </div>
      {sub && <div className="font-retro text-xs text-pixel-paper/50 mt-1">{sub}</div>}
      {newRecord && (
        <div className="absolute -top-2 -right-2 bg-pixel-red text-white font-pixel text-[8px] px-2 py-1 animate-pixel-float">
          NEW!
        </div>
      )}
    </div>
  );
}
