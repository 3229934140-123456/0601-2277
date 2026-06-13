import { useGameStore } from '@/store/useGameStore';
import { Heart, Clock, FileText, Coins, Flame } from 'lucide-react';

interface Props {}

export default function HudBar({}: Props) {
  const score = useGameStore(s => s.score);
  const combo = useGameStore(s => s.combo);
  const lives = useGameStore(s => s.lives);
  const timeLeft = useGameStore(s => s.timeLeft);
  const papersLeft = useGameStore(s => s.papersLeft);
  const deliveries = useGameStore(s => s.deliveries);
  const target = useGameStore(s => s.currentLevel?.targetDeliveries || 0);
  const coinsCollected = useGameStore(s => s.coinsCollected);

  const timePct = timeLeft / (useGameStore.getState().currentLevel?.timeLimit || 90);
  const timeColor = timePct > 0.5 ? '#6BCB77' : timePct > 0.25 ? '#FFD93D' : '#FF6B6B';

  return (
    <div className="w-full bg-pixel-brown border-b-4 border-pixel-yellow flex items-center justify-between px-4 py-2 gap-4 font-pixel text-xs pixel-text-shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-pixel-yellow">
          <span className="text-pixel-paper/80">得分</span>
          <span className="text-pixel-yellow tabular-nums min-w-[60px] text-right">{score.toString().padStart(6, '0')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-pixel-blue" />
          <span className="tabular-nums" style={{ color: timeColor }}>
            {Math.ceil(timeLeft).toString().padStart(2, '0')}s
          </span>
          <div className="w-20 h-3 bg-pixel-bg border-2 border-pixel-brownLight">
            <div className="h-full transition-all" style={{ width: `${Math.max(0, timePct * 100)}%`, background: timeColor }} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {combo >= 2 && (
          <div className="flex items-center gap-1 text-pixel-red animate-pulse">
            <Flame className="w-4 h-4" />
            <span>x{combo}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-pixel-gold">
          <Coins className="w-4 h-4" />
          <span className="tabular-nums">{coinsCollected}</span>
        </div>
        <div className="flex items-center gap-1 text-pixel-paper">
          <FileText className="w-4 h-4" />
          <span className="tabular-nums">{papersLeft}</span>
        </div>
        <div className="flex items-center gap-1 text-pixel-green">
          <span className="tabular-nums">{deliveries}/{target}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {Array.from({ length: Math.max(3, lives) }).map((_, i) => (
          <Heart
            key={i}
            className={`w-5 h-5 ${i < lives ? 'text-pixel-red fill-pixel-red' : 'text-pixel-brownLight'}`}
          />
        ))}
      </div>
    </div>
  );
}
