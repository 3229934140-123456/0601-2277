import { useEffect, useRef } from 'react';

export interface KeyState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean;
  pause: boolean;
}

const DEFAULT_STATE: KeyState = {
  up: false, down: false, left: false, right: false, action: false, pause: false,
};

export function useKeyboard() {
  const keyState = useRef<KeyState>({ ...DEFAULT_STATE });
  const justPressed = useRef<Partial<Record<keyof KeyState, boolean>>>({});
  const actionPressedRef = useRef(0);

  useEffect(() => {
    const mapKey = (e: KeyboardEvent): keyof KeyState | null => {
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') return 'up';
      if (k === 'arrowdown' || k === 's') return 'down';
      if (k === 'arrowleft' || k === 'a') return 'left';
      if (k === 'arrowright' || k === 'd') return 'right';
      if (k === ' ' || k === 'spacebar' || k === 'enter') return 'action';
      if (k === 'escape' || k === 'p') return 'pause';
      return null;
    };

    const onDown = (e: KeyboardEvent) => {
      const key = mapKey(e);
      if (!key) return;
      if (key === 'action' || key === 'pause') e.preventDefault();
      if (!keyState.current[key]) {
        justPressed.current[key] = true;
        if (key === 'action') actionPressedRef.current = performance.now();
      }
      keyState.current[key] = true;
    };

    const onUp = (e: KeyboardEvent) => {
      const key = mapKey(e);
      if (!key) return;
      keyState.current[key] = false;
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  const consumeJustPressed = (key: keyof KeyState): boolean => {
    if (justPressed.current[key]) {
      justPressed.current[key] = false;
      return true;
    }
    return false;
  };

  const getActionHoldTime = (): number => {
    if (!keyState.current.action) return 0;
    return (performance.now() - actionPressedRef.current) / 1000;
  };

  const resetAction = () => {
    keyState.current.action = false;
    actionPressedRef.current = 0;
  };

  return { keyState, consumeJustPressed, getActionHoldTime, resetAction };
}
