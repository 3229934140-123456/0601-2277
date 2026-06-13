import { useNavigate } from 'react-router-dom';
import PixelButton from '@/components/PixelButton';
import ScanlineOverlay from '@/components/ScanlineOverlay';
import { useGameStore } from '@/store/useGameStore';
import { useAudio } from '@/hooks/useAudio';
import { ArrowLeft, Monitor, Music, Volume2, VolumeX, Eye } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { playSfx } = useAudio();
  const settings = useGameStore(s => s.saveData.settings);
  const updateSettings = useGameStore(s => s.updateSettings);

  const toggle = (k: keyof typeof settings) => {
    playSfx('menu');
    updateSettings({ [k]: !settings[k] } as any);
  };
  const setVol = (k: 'musicVolume' | 'sfxVolume', v: number) => {
    updateSettings({ [k]: v });
  };

  return (
    <div className="min-h-screen w-full bg-pixel-bg p-4 md:p-8 relative overflow-hidden flex items-center justify-center">
      <ScanlineOverlay />

      <div className="w-full max-w-2xl relative">
        <div className="mb-6">
          <PixelButton variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => { playSfx('menu'); navigate('/'); }}>
            返回
          </PixelButton>
        </div>

        <div className="pixel-border bg-pixel-brown p-6 md:p-10">
          <h1 className="font-pixel text-2xl md:text-3xl text-pixel-yellow pixel-text-shadow text-center mb-8">
            ⚙️ 游戏设置
          </h1>

          <div className="space-y-5">
            <Section icon={<Monitor className="w-5 h-5" />} title="怀旧视觉效果">
              <ToggleRow
                label="CRT 暗角效果"
                desc="模拟老式显示器的四周暗角"
                on={settings.crtFilter}
                onClick={() => toggle('crtFilter')}
              />
              <ToggleRow
                label="扫描线效果"
                desc="模拟 CRT 显示器的横向扫描线"
                on={settings.scanlines}
                onClick={() => toggle('scanlines')}
              />
              <ToggleRow
                label="色彩偏移"
                desc="轻微 RGB 分离，营造复古电视感"
                on={settings.colorShift}
                onClick={() => toggle('colorShift')}
              />
            </Section>

            <Section icon={<Music className="w-5 h-5" />} title="芯片音乐">
              <ToggleRow
                label="背景音乐"
                desc="播放 8-bit 循环 BGM"
                on={settings.musicEnabled}
                onClick={() => toggle('musicEnabled')}
              />
              <SliderRow
                label="音乐音量"
                icon={<Volume2 className="w-4 h-4" />}
                value={settings.musicVolume}
                onChange={(v) => setVol('musicVolume', v)}
              />
            </Section>

            <Section icon={<Volume2 className="w-5 h-5" />} title="音效">
              <ToggleRow
                label="游戏音效"
                desc="投递、拾取、碰撞等所有游戏音效"
                on={settings.sfxEnabled}
                onClick={() => toggle('sfxEnabled')}
              />
              <SliderRow
                label="音效音量"
                icon={<VolumeX className="w-4 h-4" />}
                value={settings.sfxVolume}
                onChange={(v) => setVol('sfxVolume', v)}
              />
            </Section>

            <Section icon={<Eye className="w-5 h-5" />} title="实时预览">
              <div className="mt-2 aspect-video bg-pixel-bg pixel-border-sm overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-pixel text-xs md:text-sm text-pixel-yellow mb-2">效果预览</div>
                    <div className="font-pixel text-2xl md:text-3xl text-pixel-green">PIXEL</div>
                    <div className="font-retro text-base md:text-lg text-pixel-paper mt-2">
                      8-bit 复古游戏
                    </div>
                  </div>
                </div>
                {settings.scanlines && <div className="crt-scanlines" />}
                {settings.crtFilter && <div className="crt-vignette" style={{ borderRadius: 0 }} />}
                {settings.colorShift && (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{
                      textShadow: '-2px 0 rgba(255,0,0,0.2), 2px 0 rgba(0,255,255,0.2)',
                      mixBlendMode: 'screen',
                    }}
                  />
                )}
              </div>
            </Section>
          </div>

          <div className="mt-8 flex justify-center">
            <PixelButton variant="default" icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => { playSfx('menu'); navigate('/'); }}>
              返回主菜单
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="pixel-border-sm bg-pixel-bg p-4 md:p-5">
      <div className="flex items-center gap-2 font-pixel text-sm text-pixel-yellow mb-4 pixel-text-shadow-sm">
        <span className="text-pixel-yellow">{icon}</span>
        {title}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, on, onClick }: { label: string; desc: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-4 p-2 hover:bg-pixel-brown/50 rounded-sm transition-colors text-left"
    >
      <div className="min-w-0">
        <div className="font-pixel text-xs text-pixel-paper">{label}</div>
        <div className="font-retro text-sm text-pixel-paper/60">{desc}</div>
      </div>
      <div
        className={`w-14 h-7 shrink-0 relative transition-colors pixel-border-sm ${on ? 'bg-pixel-green' : 'bg-pixel-brownLight'}`}
        style={{ borderColor: on ? '#4A9E55' : '#2D1B0E' }}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 transition-all ${on ? 'left-7' : 'left-0.5'}`}
          style={{
            background: on ? '#F5F5DC' : '#888',
            boxShadow: on
              ? 'inset -2px -2px 0 #AA9, inset 2px 2px 0 #FFF'
              : 'inset -2px -2px 0 #555, inset 2px 2px 0 #AAA',
          }}
        />
      </div>
    </button>
  );
}

function SliderRow({ label, icon, value, onChange }: {
  label: string; icon: React.ReactNode; value: number; onChange: (v: number) => void;
}) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3 p-2">
      <div className="shrink-0 text-pixel-blue">{icon}</div>
      <div className="font-pixel text-xs text-pixel-paper whitespace-nowrap w-24">{label}</div>
      <div className="flex-1 h-4 bg-pixel-brown relative border-2 border-pixel-brownLight">
        <div className="h-full bg-pixel-yellow" style={{ width: `${pct}%` }} />
        <input
          type="range"
          min={0} max={100} value={pct}
          onChange={e => onChange(parseInt(e.target.value) / 100)}
          className="absolute inset-0 opacity-0 w-full cursor-pointer"
        />
      </div>
      <div className="font-pixel text-xs text-pixel-yellow w-10 text-right tabular-nums">
        {pct}%
      </div>
    </div>
  );
}
