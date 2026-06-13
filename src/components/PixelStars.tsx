import clsx from 'clsx';

interface Props {
  stars: 0 | 1 | 2 | 3;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}

const SIZE_MAP = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

export default function PixelStars({ stars, size = 'md', animate = false }: Props) {
  return (
    <div className="flex items-center gap-1 md:gap-2">
      {[1, 2, 3].map(i => {
        const on = stars >= i;
        const delay = i * 0.15;
        return (
          <div
            key={i}
            className={clsx(
              SIZE_MAP[size],
              'relative',
              animate && on && 'animate-star-pop',
            )}
            style={animate ? { animationDelay: `${delay}s`, opacity: animate ? 0 : 1, animationFillMode: 'forwards' } : {}}
          >
            <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
              <rect x="14" y="2" width="4" height="4" fill={on ? '#FFD700' : '#444'} />
              <rect x="12" y="6" width="8" height="4" fill={on ? '#FFD700' : '#444'} />
              <rect x="4" y="10" width="24" height="4" fill={on ? '#FFD73D' : '#555'} />
              <rect x="6" y="14" width="20" height="4" fill={on ? '#FFD700' : '#444'} />
              <rect x="8" y="18" width="8" height="4" fill={on ? '#FFD700' : '#444'} />
              <rect x="16" y="18" width="8" height="4" fill={on ? '#FFD700' : '#444'} />
              <rect x="6" y="22" width="6" height="4" fill={on ? '#E6B800' : '#333'} />
              <rect x="20" y="22" width="6" height="4" fill={on ? '#E6B800' : '#333'} />
              <rect x="4" y="26" width="4" height="4" fill={on ? '#B8860B' : '#2a2a2a'} />
              <rect x="24" y="26" width="4" height="4" fill={on ? '#B8860B' : '#2a2a2a'} />
              {on && (
                <>
                  <rect x="13" y="7" width="2" height="2" fill="#FFF176" />
                  <rect x="9" y="11" width="2" height="2" fill="#FFEC8B" />
                </>
              )}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
