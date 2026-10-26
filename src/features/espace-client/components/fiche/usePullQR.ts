import type { Dispatch, RefObject, SetStateAction } from "react";
import { useEffect, useState } from "react";

/**
 * Geste « tirer pour le QR » : état tenu, molette et bouton d'accessibilité.
 * `enabled = false` (visiteur) : aucun écouteur n'est installé et le QR n'est jamais « tenu ».
 */
export function usePullQR(
  rootRef: RefObject<HTMLDivElement>,
  scrollerRef?: RefObject<HTMLDivElement>,
  enabled = true,
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (!enabled) return undefined;
    const root = rootRef.current!,
      sc = scrollerRef?.current || null;
    const top = () => (sc ? sc.scrollTop : window.scrollY) <= 0;
    let startY: number | null = null,
      pull = 0,
      timer = 0;
    const set = (v: number) => {
      pull = v;
      root.style.setProperty("--pull", v.toFixed(1));
      root.style.setProperty("--p01", Math.min(1, v / 150).toFixed(3));
      root.classList.toggle("pulling", v > 4);
    };
    const release = () => {
      startY = null;
      root.classList.add("rel");
      set(0);
      setTimeout(() => root.classList.remove("rel"), 480);
    };
    const onStart = (y: number) => {
      if (top()) {
        startY = y;
        root.classList.remove("rel");
      }
    };
    const onMove = (y: number, e?: Event) => {
      if (startY === null) return;
      const dy = y - startY;
      if (dy > 0 && top()) {
        if (e?.cancelable) e.preventDefault();
        set(Math.min(300, dy * 0.55));
      } else if (dy <= 0 && pull) set(0);
    };
    const ts = (e: TouchEvent) => onStart(e.touches[0].clientY),
      tm = (e: TouchEvent) => onMove(e.touches[0].clientY, e),
      te = () => startY !== null && release();
    const pd = (e: PointerEvent) => {
      if (
        e.pointerType === "mouse" &&
        e.button === 0 &&
        (e.target as Element).closest(".f-hero")
      )
        onStart(e.clientY);
    };
    const pm = (e: PointerEvent) => {
        if (e.pointerType === "mouse") onMove(e.clientY, e);
      },
      pu = (e: PointerEvent) => {
        if (e.pointerType === "mouse" && startY !== null) release();
      };
    const wh = (e: WheelEvent) => {
      if (e.deltaY < 0 && top()) {
        root.classList.remove("rel");
        set(Math.min(300, pull + -e.deltaY * 0.35));
        clearTimeout(timer);
        timer = window.setTimeout(release, 380);
      }
    };
    const el = sc || window;
    root.addEventListener("touchstart", ts, { passive: true });
    root.addEventListener("touchmove", tm, { passive: false });
    root.addEventListener("touchend", te);
    root.addEventListener("pointerdown", pd);
    window.addEventListener("pointermove", pm);
    window.addEventListener("pointerup", pu);
    el.addEventListener("wheel", wh as EventListener, { passive: true });
    return () => {
      root.removeEventListener("touchstart", ts);
      root.removeEventListener("touchmove", tm);
      root.removeEventListener("touchend", te);
      root.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointermove", pm);
      window.removeEventListener("pointerup", pu);
      el.removeEventListener("wheel", wh as EventListener);
      clearTimeout(timer);
    };
  }, [rootRef, scrollerRef, enabled]);
  return [enabled && held, setHeld];
}
