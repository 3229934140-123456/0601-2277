import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from '@/components/PixelButton';
import PixelStars from '@/components/PixelStars';
import ScanlineOverlay from '@/components/ScanlineOverlay';
import CollectionCard from '@/components/CollectionCard';
import { useGameStore } from '@/store/useGameStore';
import { useAudio } from '@/hooks/useAudio';
import { BIKES } from '@/data/bikes';
import { PAPERS } from '@/data/papers';
import { ArrowLeft, Bike, Newspaper } from 'lucide-react';

type Tab = 'bike' | 'paper';

export default function Collection() {
  const navigate = useNavigate();
  const { playSfx } = useAudio();
  const [tab, setTab] = useState<Tab>('bike');
  const unlockedBikes = useGameStore(s => s.saveData.unlockedBikes);
  const unlockedPapers = useGameStore(s => s.saveData.unlockedPapers);
  const selectedBike = useGameStore(s => s.saveData.selectedBike);
  const selectedPaper = useGameStore(s => s.saveData.selectedPaper);
  const selectSkin = useGameStore(s => s.selectSkin);
  const totalCoins = useGameStore(s => s.saveData.totalCoins);
  const totalDeliveries = useGameStore(s => s.saveData.totalDeliveries);

  const handleSelect = (type: Tab, id: string) => {
    const list = type === 'bike' ? unlockedBikes : unlockedPapers;
    if (!list.includes(id)) return;
    playSfx('menu');
    selectSkin(type, id);
  };

  const items = tab === 'bike' ? BIKES : PAPERS;
  const unlocked = tab === 'bike' ? unlockedBikes : unlockedPapers;
  const selected = tab === 'bike' ? selectedBike : selectedPaper;
  const progress = `${unlocked.length}/${items.length}`;

  return (
    <div className="min-h-screen w-full bg-pixel-bg p-4 md:p-8 relative overflow-hidden">
      <ScanlineOverlay />

      <div className="max-w-6xl mx-auto relative">
        <div className="flex items-center justify-between mb-6">
          <PixelButton variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => { playSfx('menu'); navigate('/'); }}>
            返回
          </PixelButton>
          <h1 className="font-pixel text-2xl md:text-3xl text-pixel-yellow pixel-text-shadow">
            收藏册
          </h1>
          <div className="w-[120px] text-right font-pixel text-xs text-pixel-green">
            进度: {progress}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <MiniStat label="解锁自行车" value={`${unlockedBikes.length}/${BIKES.length}`} color="text-pixel-blue" />
          <MiniStat label="解锁报纸" value={`${unlockedPapers.length}/${PAPERS.length}`} color="text-pixel-paper" />
          <MiniStat label="累计金币" value={totalCoins.toString()} color="text-pixel-gold" />
          <MiniStat label="累计投递" value={totalDeliveries.toString()} color="text-pixel-green" />
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => { setTab('bike'); playSfx('menu'); }}
            className={`pixel-btn pixel-btn-blue ${tab === 'bike' ? '' : 'opacity-60'} flex items-center gap-2 font-pixel text-xs`}
          >
            <Bike className="w-4 h-4" />
            自行车 ({unlockedBikes.length})
          </button>
          <button
            onClick={() => { setTab('paper'); playSfx('menu'); }}
            className={`pixel-btn ${tab === 'paper' ? '' : 'opacity-60'} flex items-center gap-2 font-pixel text-xs`}
          >
            <Newspaper className="w-4 h-4" />
            报纸 ({unlockedPapers.length})
          </button>
          <div className="ml-auto font-retro text-pixel-paper/60 text-sm">
            点击卡片切换使用 &nbsp;·&nbsp; 双击查看详情
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <CollectionCard
              key={item.id}
              type={tab}
              item={item as any}
              unlocked={unlocked.includes(item.id)}
              selected={selected === item.id}
              onClick={() => handleSelect(tab, item.id)}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="font-retro text-lg text-pixel-paper/70">
            💡 提示：完成挑战目标可解锁更多皮肤
          </div>
          <div className="font-pixel text-[10px] text-pixel-paper/40 mt-2">
            无伤通关 / 高连击 / 收集金币 / 高分挑战
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="pixel-border-sm bg-pixel-brown p-3 text-center">
      <div className="font-pixel text-[9px] text-pixel-paper/60 mb-1">{label}</div>
      <div className={`font-pixel text-lg pixel-text-shadow-sm tabular-nums ${color}`}>
        {value}
      </div>
    </div>
  );
}
