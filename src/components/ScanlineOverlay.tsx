import { useGameStore } from '@/store/useGameStore';
import clsx from 'clsx';

interface Props {
  className?: string;
}

export default function ScanlineOverlay({ className }: Props) {
  const settings = useGameStore(s => s.saveData.settings);
  if (!settings.scanlines && !settings.crtFilter && !settings.colorShift) return null;
  return (
    <div className={clsx('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {settings.crtFilter && <div className="crt-vignette" />}
      {settings.scanlines && (
        <>
          <div className="crt-scanlines" />
          <div className="crt-scanline-bar" />
        </>
      )}
      {settings.colorShift && (
        <div className="absolute inset-0 mix-blend-screen opacity-30 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,0,0,0.06) 0%, transparent 50%, rgba(0,255,255,0.06) 100%)',
          }}
        />
      )}
    </div>
  );
}
