import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from '@/components/PixelButton';
import ScanlineOverlay from '@/components/ScanlineOverlay';
import { useGameStore } from '@/store/useGameStore';
import { useAudio } from '@/hooks/useAudio';
import { getCharacterById } from '@/data/characters';
import { getBikeById } from '@/data/bikes';
import { Play, Map, BookOpen, Settings as SettingsIcon, Newspaper, Shield, Trophy, Zap } from 'lucide-react';

export default function MainMenu() {
  const navigate = useNavigate();
  const loadSave = useGameStore(s => s.loadSave);
  const totalCoins = useGameStore(s => s.saveData.totalCoins);
  const totalDeliveries = useGameStore(s => s.saveData.totalDeliveries);
  const ps = useGameStore(s => s.saveData.persistentStats);
  const selectedChar = useGameStore(s => s.saveData.selectedCharacter);
  const selectedBike = useGameStore(s => s.saveData.selectedBike);
  const { playSfx } = useAudio();

  useEffect(() => {
    loadSave();
  }, [loadSave]);

  const handleClick = (route: string) => {
    playSfx('menu');
    navigate(route);
  };

  const charData = getCharacterById(selectedChar);
  const bikeData = getBikeById(selectedBike);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-pixel-bg p-4 overflow-hidden relative">
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-pixel-yellow animate-pixel-blink"
            style={{
              left: `${(i * 137) % 100}%`,
              top: `${(i * 83) % 100}%`,
              animationDelay: `${(i % 5) * 0.2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-4xl">
        <ScanlineOverlay />

        <div className="pixel-border bg-pixel-brown p-6 md:p-10 relative">
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Newspaper className="w-10 h-10 md:w-14 md:h-14 text-pixel-yellow animate-pixel-float" />
            </div>
            <h1
              className="font-pixel text-3xl md:text-5xl text-pixel-yellow pixel-text-shadow mb-2 tracking-wider"
              style={{ letterSpacing: '0.1em' }}
            >
              像素送报童
            </h1>
            <p className="font-retro text-xl md:text-2xl text-pixel-green mt-4 animate-pixel-blink">
              PRESS START
            </p>
            <div className="mt-4 font-retro text-lg text-pixel-paper/80">
              骑上自行车，穿梭街区投递报纸吧！
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            {charData && (
              <div className="pixel-border-sm bg-pixel-bg px-3 py-1.5 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {charData.colors.slice(0, 3).map((c, i) => (
                    <div key={i} className="w-2 h-2 border border-pixel-paper/30" style={{ background: c }} />
                  ))}
                </div>
                <span className="font-retro text-xs text-pixel-paper">{charData.name}</span>
              </div>
            )}
            {bikeData && (
              <div className="pixel-border-sm bg-pixel-bg px-3 py-1.5 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {bikeData.colors.slice(0, 2).map((c, i) => (
                    <div key={i} className="w-2 h-2 border border-pixel-paper/30" style={{ background: c }} />
                  ))}
                </div>
                <span className="font-retro text-xs text-pixel-paper">{bikeData.name}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
            <PixelButton
              variant="default"
              size="lg"
              icon={<Play className="w-5 h-5" />}
              block
              onClick={() => handleClick('/levels')}
            >
              开始游戏
            </PixelButton>
            <PixelButton
              variant="yellow"
              size="lg"
              icon={<Map className="w-5 h-5" />}
              block
              onClick={() => handleClick('/levels')}
            >
              关卡选择
            </PixelButton>
            <PixelButton
              variant="blue"
              size="lg"
              icon={<BookOpen className="w-5 h-5" />}
              block
              onClick={() => handleClick('/collection')}
            >
              收藏册
            </PixelButton>
            <PixelButton
              variant="red"
              size="lg"
              icon={<SettingsIcon className="w-5 h-5" />}
              block
              onClick={() => handleClick('/settings')}
            >
              设置
            </PixelButton>
          </div>

          <div className="border-t-4 border-pixel-yellow/30 pt-4 max-w-lg mx-auto">
            <div className="grid grid-cols-3 gap-3 font-retro text-lg text-pixel-paper/90">
              <div className="pixel-border-sm bg-pixel-bg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Newspaper className="w-3 h-3 text-pixel-green" />
                  <span className="font-pixel text-[8px] text-pixel-green">总投递</span>
                </div>
                <div className="text-pixel-green text-xl tabular-nums">{totalDeliveries}</div>
              </div>
              <div className="pixel-border-sm bg-pixel-bg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-3 h-3 text-pixel-gold" />
                  <span className="font-pixel text-[8px] text-pixel-gold">总金币</span>
                </div>
                <div className="text-pixel-yellow text-xl tabular-nums">{totalCoins}</div>
              </div>
              <div className="pixel-border-sm bg-pixel-bg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Shield className="w-3 h-3 text-pixel-blue" />
                  <span className="font-pixel text-[8px] text-pixel-blue">无伤</span>
                </div>
                <div className="text-pixel-blue text-xl tabular-nums">{ps.noDamageCount}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 font-retro text-base text-pixel-paper/60 text-center space-y-1">
            <div>🎮 WASD / 方向键 移动 &nbsp; | &nbsp; 空格 蓄力投递</div>
            <div>🎯 把报纸投到邮箱或门口 &nbsp; | &nbsp; ESC 暂停</div>
          </div>
        </div>

        <div className="text-center mt-6 font-pixel text-[10px] text-pixel-paper/40">
          PIXEL PAPERBOY © 2026 &nbsp;·&nbsp; v1.0
        </div>
      </div>
    </div>
  );
}
