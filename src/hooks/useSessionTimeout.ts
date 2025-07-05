import { useEffect, useRef, useState } from 'react';

export function useSessionTimeout(timeoutMs: number, onTimeout: () => void) {
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const reset = () => {
      setActive(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setActive(false);
        onTimeout();
      }, timeoutMs);
    };
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, reset));
    reset();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [timeoutMs, onTimeout]);

  return { active };
}
