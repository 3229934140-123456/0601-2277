import { useGameStore } from '@/store/useGameStore';

interface Props {}

export default function ChargeBar({}: Props) {
  const charge = useGameStore(s => s.charge);
  const charging = useGameStore(s => s.charging);

  return (
    <div className="w-full bg-pixel-brown/90 border-t-4 border-pixel-yellow px-4 py-3 flex items-center gap-4">
      <div className="font-pixel text-[10px] text-pixel-yellow pixel-text-shadow-sm whitespace-nowrap">
        蓄力
      </div>
      <div className="flex-1 h-6 bg-pixel-bg border-4 border-pixel-brownLight relative overflow-hidden">
        <div
          className="h-full transition-[width] duration-75"
          style={{
            width: `${charge * 100}%`,
            background: `linear-gradient(90deg, #6BCB77 0%, #FFD93D 50%, #FF6B6B 100%)`,
            opacity: charging ? 1 : 0.4,
          }}
        />
        <div className="absolute inset-0 flex justify-around pointer-events-none">
          {[0.25, 0.5, 0.75].map(t => (
            <div key={t} className="w-px h-full bg-pixel-bg/60" style={{ marginLeft: `${t * 100}%` }} />
          ))}
        </div>
        <div className="absolute inset-0 flex justify-around pointer-events-none font-pixel text-[8px] items-center">
          <span style={{ color: '#6BCB77', marginLeft: '-10%' }}>近</span>
          <span style={{ color: '#FFD93D' }}>中</span>
          <span style={{ color: '#FF6B6B', marginRight: '-10%' }}>远</span>
        </div>
      </div>
      <div className="font-pixel text-[10px] text-pixel-paper/80 pixel-text-shadow-sm whitespace-nowrap">
        [空格]
      </div>
    </div>
  );
}
