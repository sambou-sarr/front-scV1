import { useEffect } from 'react';
import type { RefObject } from 'react';

/*
  Suit la progression (0 → 1) d'une section « sticky » pendant le défilement.
  onFrame(p) est appelé dans requestAnimationFrame, uniquement quand la section est visible.
  Aucun re-render React par frame : on écrit directement dans le DOM depuis onFrame.
*/
export default function useStickyProgress(ref: RefObject<HTMLElement>, onFrame: (progress: number) => void, onLeave?: () => void): void {
  useEffect(() => {
    let raf = 0;
    const frame = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect(), span = r.height - window.innerHeight;
      if (r.bottom < 0 || r.top > window.innerHeight) { onLeave && onLeave(); return; }
      onFrame(Math.max(0, Math.min(1, -r.top / Math.max(1, span))));
    };
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
