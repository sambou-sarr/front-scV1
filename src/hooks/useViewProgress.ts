import { useEffect } from 'react';
import type { RefObject } from 'react';

/*
  Progression de visibilité d'un élément : 0 quand il entre par le bas, 1 quand il sort par le haut.
  Fonctionne dans tous les navigateurs (repli des scroll-driven animations CSS).
*/
export default function useViewProgress(ref: RefObject<HTMLElement>, onFrame: (progress: number) => void): void {
  useEffect(() => {
    let raf = 0;
    const frame = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < -50 || r.top > vh + 50) return;
      onFrame(Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height))));
    };
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
