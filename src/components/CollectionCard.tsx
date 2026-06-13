import { BikeSkin, rarityColors } from '@/data/bikes';
import { PaperSkin, paperRarityColors } from '@/data/papers';
import { Lock } from 'lucide-react';
import clsx from 'clsx';

type ItemType = 'bike' | 'paper';

interface Props {
  type: ItemType;
  item: BikeSkin | PaperSkin;
  unlocked: boolean;
  selected: boolean;
  onClick?: () => void;
  onPreview?: () => void;
}

export default function CollectionCard({ type, item, unlocked, selected, onClick, onPreview }: Props) {
  const rarity = type === 'bike'
    ? rarityColors[(item as BikeSkin).rarity]
    : paperRarityColors[(item as PaperSkin).rarity];
  const colors = item.colors;

  return (
    <button
      onClick={onClick}
      onDoubleClick={onPreview}
      className={clsx(
        'pixel-border-sm bg-pixel-brown p-3 text-left transition-all hover:-translate-y-1 w-full',
        selected && 'ring-4 ring-pixel-yellow',
        !unlocked && 'grayscale opacity-80',
      )}
      style={{ borderColor: rarity.border }}
    >
      <div className="aspect-square bg-pixel-bg mb-2 relative overflow-hidden pixel-border-sm flex items-center justify-center p-4"
        style={{ borderColor: rarity.bg }}
      >
        {type === 'bike' ? (
          <BikePreview colors={colors} />
        ) : (
          <PaperPreview colors={colors} headline={(item as PaperSkin).headline} />
        )}
        {!unlocked && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Lock className="w-8 h-8 text-pixel-yellow" />
          </div>
        )}
        {selected && unlocked && (
          <div className="absolute top-1 right-1 bg-pixel-green text-pixel-bg font-pixel text-[8px] px-2 py-1 pixel-border-sm">
            使用中
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="font-pixel text-[10px] text-pixel-paper pixel-text-shadow-sm truncate">
          {item.name}
        </div>
        <div
          className="font-pixel text-[8px] px-2 py-0.5 shrink-0"
          style={{ background: rarity.bg, color: rarity.text, border: `2px solid ${rarity.border}` }}
        >
          {rarity.label}
        </div>
      </div>

      <div className="font-retro text-sm text-pixel-blue">
        {type === 'bike' ? (item as BikeSkin).era : ''}
      </div>

      <div className="mt-2 font-retro text-xs text-pixel-paper/70 line-clamp-2 min-h-[2rem]">
        {item.description}
      </div>

      {!unlocked && (
        <div className="mt-2 font-retro text-xs text-pixel-yellow">
          🔒 {item.unlockCondition}
        </div>
      )}
    </button>
  );
}

function BikePreview({ colors }: { colors: string[] }) {
  const [frame, dark, light, tire, rim] = colors;
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
      <rect x="4" y="38" width="16" height="16" fill={tire} />
      <rect x="8" y="42" width="8" height="8" fill={rim} />
      <rect x="11" y="42" width="2" height="8" fill={tire} />
      <rect x="44" y="38" width="16" height="16" fill={tire} />
      <rect x="48" y="42" width="8" height="8" fill={rim} />
      <rect x="51" y="42" width="2" height="8" fill={tire} />
      <rect x="12" y="32" width="34" height="4" fill={frame} />
      <rect x="18" y="24" width="4" height="12" fill={frame} />
      <rect x="18" y="24" width="28" height="4" fill={frame} />
      <rect x="42" y="24" width="4" height="16" fill={frame} />
      <rect x="28" y="32" width="4" height="14" fill={dark} />
      <rect x="14" y="20" width="8" height="4" fill={dark} />
      <rect x="24" y="12" width="12" height="12" fill="#FFD8A8" />
      <rect x="26" y="10" width="8" height="4" fill="#5C3A21" />
      <rect x="26" y="18" width="2" height="2" fill="#000" />
      <rect x="32" y="18" width="2" height="2" fill="#000" />
      <rect x="28" y="24" width="8" height="8" fill={light} />
    </svg>
  );
}

function PaperPreview({ colors, headline }: { colors: string[]; headline: string }) {
  const [bg, ink, accent] = colors;
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
      <rect x="8" y="12" width="48" height="44" fill={bg} />
      <rect x="8" y="12" width="48" height="6" fill={accent} />
      <rect x="12" y="22" width="40" height="2" fill={ink} />
      <rect x="12" y="28" width="36" height="2" fill={ink} />
      <rect x="12" y="34" width="40" height="2" fill={ink} />
      <rect x="12" y="40" width="30" height="2" fill={ink} />
      <rect x="12" y="46" width="36" height="2" fill={ink} />
      <rect x="10" y="12" width="2" height="44" fill={shadeColor(bg, 25)} />
      <rect x="52" y="12" width="2" height="44" fill={shadeColor(bg, -25)} />
      <rect x="8" y="12" width="48" height="2" fill={shadeColor(bg, 30)} />
      <text x="32" y="17" textAnchor="middle" fontSize="4" fontFamily="monospace" fill={ink} fontWeight="bold">
        {headline.slice(0, 10)}
      </text>
    </svg>
  );
}

function shadeColor(color: string, percent: number): string {
  const f = parseInt(color.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const R = f >> 16;
  const G = (f >> 8) & 0x00FF;
  const B = f & 0x0000FF;
  const r = Math.round((t - R) * p) + R;
  const g = Math.round((t - G) * p) + G;
  const b = Math.round((t - B) * p) + B;
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
