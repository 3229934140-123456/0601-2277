import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from '@/components/PixelButton';
import PixelStars from '@/components/PixelStars';
import ScanlineOverlay from '@/components/ScanlineOverlay';
import CollectionCard, { BikePreview, PaperPreview, CharacterPreview, ItemType, AnySkin } from '@/components/CollectionCard';
import { useGameStore } from '@/store/useGameStore';
import { useAudio } from '@/hooks/useAudio';
import { BIKES } from '@/data/bikes';
import { PAPERS } from '@/data/papers';
import { CHARACTERS } from '@/data/characters';
import { rarityColors } from '@/data/bikes';
import { paperRarityColors } from '@/data/papers';
import { characterRarityColors } from '@/data/characters';
import { ArrowLeft, Bike, Newspaper, User, X, Award, Star, Lock } from 'lucide-react';

type Tab = 'bike' | 'paper' | 'character';

export default function Collection() {
  const navigate = useNavigate();
  const { playSfx } = useAudio();
  const [tab, setTab] = useState<Tab>('bike');
  const [previewItem, setPreviewItem] = useState<{ type: Tab; item: AnySkin; unlocked: boolean } | null>(null);
  const unlockedBikes = useGameStore(s => s.saveData.unlockedBikes);
  const unlockedPapers = useGameStore(s => s.saveData.unlockedPapers);
  const unlockedCharacters = useGameStore(s => s.saveData.unlockedCharacters);
  const selectedBike = useGameStore(s => s.saveData.selectedBike);
  const selectedPaper = useGameStore(s => s.saveData.selectedPaper);
  const selectedCharacter = useGameStore(s => s.saveData.selectedCharacter);
  const selectSkin = useGameStore(s => s.selectSkin);
  const totalCoins = useGameStore(s => s.saveData.totalCoins);
  const totalDeliveries = useGameStore(s => s.saveData.totalDeliveries);
  const ps = useGameStore(s => s.saveData.persistentStats);

  const items = useMemo(() => {
    if (tab === 'bike') return BIKES as AnySkin[];
    if (tab === 'paper') return PAPERS as AnySkin[];
    return CHARACTERS as AnySkin[];
  }, [tab]);

  const unlocked = useMemo(() => {
    if (tab === 'bike') return unlockedBikes;
    if (tab === 'paper') return unlockedPapers;
    return unlockedCharacters;
  }, [tab, unlockedBikes, unlockedPapers, unlockedCharacters]);

  const selected = useMemo(() => {
    if (tab === 'bike') return selectedBike;
    if (tab === 'paper') return selectedPaper;
    return selectedCharacter;
  }, [tab, selectedBike, selectedPaper, selectedCharacter]);

  const handleSelect = (type: Tab, id: string, isUnlocked: boolean) => {
    if (!isUnlocked) return;
    playSfx('menu');
    selectSkin(type, id);
  };

  const handlePreview = (type: Tab, item: AnySkin, isUnlocked: boolean) => {
    playSfx('menu');
    setPreviewItem({ type, item, unlocked: isUnlocked });
  };

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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <MiniStat label="解锁自行车" value={`${unlockedBikes.length}/${BIKES.length}`} color="text-pixel-blue" />
          <MiniStat label="解锁报纸" value={`${unlockedPapers.length}/${PAPERS.length}`} color="text-pixel-paper" />
          <MiniStat label="解锁角色" value={`${unlockedCharacters.length}/${CHARACTERS.length}`} color="text-pink-300" />
          <MiniStat label="累计金币" value={totalCoins.toString()} color="text-pixel-gold" />
          <MiniStat label="无伤通关" value={ps.noDamageCount.toString()} color="text-pixel-green" />
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => { setTab('bike'); playSfx('menu'); }}
            className={`pixel-btn pixel-btn-blue ${tab === 'bike' ? '' : 'opacity-60'} flex items-center gap-2 font-pixel text-xs`}
          >
            <Bike className="w-4 h-4" />
            自行车 ({unlockedBikes.length})
          </button>
          <button
            onClick={() => { setTab('paper'); playSfx('menu'); }}
            className={`pixel-btn pixel-btn-yellow ${tab === 'paper' ? '' : 'opacity-60'} flex items-center gap-2 font-pixel text-xs`}
          >
            <Newspaper className="w-4 h-4" />
            报纸 ({unlockedPapers.length})
          </button>
          <button
            onClick={() => { setTab('character'); playSfx('menu'); }}
            className={`pixel-btn pixel-btn-red ${tab === 'character' ? '' : 'opacity-60'} flex items-center gap-2 font-pixel text-xs`}
          >
            <User className="w-4 h-4" />
            角色 ({unlockedCharacters.length})
          </button>
          <div className="ml-auto font-retro text-pixel-paper/60 text-sm">
            点击卡片切换使用 &nbsp;·&nbsp; 双击查看详情
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => {
            const isUnlocked = unlocked.includes(item.id);
            const isSelected = selected === item.id;
            return (
              <CollectionCard
                key={item.id}
                type={tab as ItemType}
                item={item}
                unlocked={isUnlocked}
                selected={isSelected}
                onClick={() => handleSelect(tab, item.id, isUnlocked)}
                onPreview={() => handlePreview(tab, item, isUnlocked)}
              />
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <div className="font-retro text-lg text-pixel-paper/70">
            💡 提示：完成挑战目标可解锁更多内容
          </div>
          <div className="font-pixel text-[10px] text-pixel-paper/40 mt-2">
            无伤通关 / 高连击 / 收集金币 / 高分挑战 / 全关卡成就
          </div>
        </div>
      </div>

      {previewItem && (
        <PreviewModal
          type={previewItem.type}
          item={previewItem.item}
          unlocked={previewItem.unlocked}
          selected={selected === previewItem.item.id}
          onClose={() => setPreviewItem(null)}
          onSelect={() => {
            handleSelect(previewItem.type, previewItem.item.id, previewItem.unlocked);
          }}
        />
      )}
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

function PreviewModal({
  type, item, unlocked, selected, onClose, onSelect,
}: {
  type: Tab;
  item: AnySkin;
  unlocked: boolean;
  selected: boolean;
  onClose: () => void;
  onSelect: () => void;
}) {
  const rarity = (() => {
    if (type === 'bike') return rarityColors[(item as any).rarity];
    if (type === 'paper') return paperRarityColors[(item as any).rarity];
    return characterRarityColors[(item as any).rarity];
  })();
  const colors = item.colors;
  const era = (item as any).era || '';
  const headline = (item as any).headline || '';
  const backstory = (item as any).backstory || '';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}>
      <div
        className="pixel-border bg-pixel-brown max-w-lg w-full p-6 relative animate-pixel-pop"
        onClick={e => e.stopPropagation()}
        style={{ borderColor: rarity.border }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-pixel-red text-white pixel-border-sm hover:brightness-110"
        >
          <X className="w-4 h-4" strokeWidth={3} />
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <div
              className="aspect-square bg-pixel-bg pixel-border-sm p-4 flex items-center justify-center relative"
              style={{ borderColor: rarity.bg }}
            >
              {type === 'bike' ? (
                <BikePreview colors={colors} />
              ) : type === 'paper' ? (
                <PaperPreview colors={colors} headline={headline} />
              ) : (
                <CharacterPreview colors={colors} />
              )}
              {!unlocked && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                  <Lock className="w-10 h-10 text-pixel-yellow mb-2" />
                  <div className="font-pixel text-xs text-pixel-yellow">未解锁</div>
                </div>
              )}
              {selected && unlocked && (
                <div className="absolute top-2 left-2 bg-pixel-green text-pixel-bg font-pixel text-[8px] px-2 py-1 pixel-border-sm flex items-center gap-1">
                  <Star className="w-2 h-2" fill="currentColor" />
                  使用中
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <div
                className="font-pixel text-xs px-3 py-1 text-center"
                style={{ background: rarity.bg, color: rarity.text, border: `2px solid ${rarity.border}` }}
              >
                {rarity.label} &nbsp;·&nbsp; {era || '典藏'}
              </div>
              {unlocked ? (
                selected ? (
                  <PixelButton variant="default" block disabled>
                    ✓ 已装备
                  </PixelButton>
                ) : (
                  <PixelButton variant="default" block onClick={onSelect}>
                    装备此物品
                  </PixelButton>
                )
              ) : (
                <PixelButton variant="outline" block disabled>
                  <Lock className="w-3 h-3" />
                  &nbsp; 尚未解锁
                </PixelButton>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/2 min-h-0">
            <h2 className="font-pixel text-xl text-pixel-yellow pixel-text-shadow-sm mb-2 break-words">
              {item.name}
            </h2>

            <div className="space-y-3 font-retro text-sm">
              <div>
                <div className="font-pixel text-[10px] text-pixel-blue mb-1 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  简介
                </div>
                <div className="pixel-border-sm bg-pixel-bg p-3 text-pixel-paper leading-relaxed">
                  {item.description}
                </div>
              </div>

              {backstory && (
                <div>
                  <div className="font-pixel text-[10px] text-pixel-gold mb-1 flex items-center gap-1">
                    📖 背景故事
                  </div>
                  <div className="pixel-border-sm bg-pixel-bg p-3 text-pixel-paper/90 leading-relaxed italic">
                    "{backstory}"
                  </div>
                </div>
              )}

              {!unlocked && (
                <div>
                  <div className="font-pixel text-[10px] text-pixel-red mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    解锁条件
                  </div>
                  <div className="pixel-border-sm bg-pixel-yellow/10 p-3 text-pixel-yellow border-pixel-yellow/40">
                    {item.unlockCondition}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-pixel-brownLight">
              <div className="font-pixel text-[9px] text-pixel-paper/50 mb-2">配色方案</div>
              <div className="flex gap-2">
                {colors.map((c, i) => (
                  <div key={i} className="flex-1 aspect-square pixel-border-sm"
                    style={{ background: c, borderColor: '#2D1B0E' }}
                    title={`Color ${i + 1}: ${c}`}
                  />
                ))}
              </div>
            </div>

            {type === 'bike' && (
              <div className="mt-3 pt-3 border-t-2 border-pixel-brownLight">
                <PixelStars stars={3} size="sm" />
                <div className="font-pixel text-[8px] text-pixel-paper/40 mt-1">
                  集齐全部自行车可解锁隐藏奖励
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
