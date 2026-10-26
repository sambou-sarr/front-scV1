import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useRef, useState } from "react";
import type { TabType } from "../../../../types";

/* Glisser-déposer au pointeur (souris et tactile) pour réordonner ou ajouter des blocs. */
export type DragPayload =
  | { kind: "move"; id: string; label: string }
  | { kind: "new"; type: TabType; label: string; id?: undefined };
export type DragState = DragPayload & {
  x: number;
  y: number;
  over: number | null;
  moved: boolean;
};
export type StartDrag = (
  e: ReactPointerEvent<HTMLButtonElement>,
  payload: DragPayload,
) => void;

export function useDnD(
  listRef: RefObject<HTMLUListElement>,
  onDrop: (d: DragState) => void,
): [DragState | null, StartDrag] {
  const [drag, setDrag] = useState<DragState | null>(null);
  const ref = useRef<DragState | null>(null);
  const start: StartDrag = (e, payload) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const sx = e.clientX,
      sy = e.clientY;
    const move = (ev: PointerEvent) => {
      const items = [
        ...(listRef.current?.querySelectorAll("[data-row]") || []),
      ];
      let over = items.length;
      for (let k = 0; k < items.length; k++) {
        const r = items[k].getBoundingClientRect();
        if (ev.clientY < r.top + r.height / 2) {
          over = k;
          break;
        }
      }
      const lr = listRef.current!.getBoundingClientRect();
      const inside =
        ev.clientY > lr.top - 70 &&
        ev.clientY < lr.bottom + 70 &&
        ev.clientX > lr.left - 60 &&
        ev.clientX < lr.right + 60;
      ref.current = {
        ...ref.current!,
        x: ev.clientX,
        y: ev.clientY,
        over: inside ? over : null,
        moved:
          ref.current!.moved ||
          Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6,
      };
      setDrag(ref.current);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const d = ref.current;
      ref.current = null;
      setDrag(null);
      if (d) onDrop(d);
    };
    ref.current = { ...payload, x: sx, y: sy, over: null, moved: false };
    setDrag(ref.current);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };
  return [drag, start];
}
