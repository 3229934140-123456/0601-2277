import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type Variant = 'default' | 'red' | 'yellow' | 'blue' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  block?: boolean;
}

export default function PixelButton({
  variant = 'default',
  size = 'md',
  icon,
  block,
  className,
  children,
  ...rest
}: Props) {
  const sizeClass = {
    sm: 'text-[10px] px-4 py-2',
    md: 'text-xs px-6 py-4',
    lg: 'text-sm px-8 py-5',
  }[size];

  const variantClass = {
    default: 'bg-pixel-green text-pixel-bg hover:brightness-110 active:brightness-95',
    red: 'pixel-btn-red text-white hover:brightness-110 active:brightness-95',
    yellow: 'pixel-btn-yellow text-pixel-bg hover:brightness-110 active:brightness-95',
    blue: 'pixel-btn-blue text-pixel-bg hover:brightness-110 active:brightness-95',
    outline: 'bg-transparent text-pixel-yellow border-4 border-pixel-yellow hover:bg-pixel-yellow/10',
  }[variant];

  const variantShadow = variant === 'outline' ? '' : '';
  const btnBase = variant === 'outline' ? '' : 'pixel-btn';

  return (
    <button
      {...rest}
      className={clsx(
        btnBase,
        variantClass,
        variantShadow,
        sizeClass,
        block ? 'w-full' : '',
        'font-pixel tracking-wider relative inline-flex items-center justify-center gap-2 select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0',
        className
      )}
      style={variant === 'outline' ? {
        boxShadow: '4px 4px 0 0 #000',
      } : undefined}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
