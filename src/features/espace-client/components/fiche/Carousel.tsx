import type { ReactNode } from "react";
import { useState } from "react";
import { I } from "./Icon";

/** Carrousel générique à défilement horizontal. */
export function Carousel<T>({
  items,
  render,
  label,
}: {
  items: T[];
  render: (item: T, i: number) => ReactNode;
  label: string;
}) {
  const [i, setI] = useState(0);
  if (!items.length) return null;
  return (
    <div className="f-car">
      <div className="f-car-v">
        {render(items[i], i)}
        {items.length > 1 && (
          <>
            <button
              className="f-car-b l"
              onClick={() => setI((i - 1 + items.length) % items.length)}
              aria-label="Précédent"
            >
              <I n="left" s={16} />
            </button>
            <button
              className="f-car-b r"
              onClick={() => setI((i + 1) % items.length)}
              aria-label="Suivant"
            >
              <I n="right" s={16} />
            </button>
          </>
        )}
      </div>
      <div className="f-car-n">
        <small>
          {label} {i + 1} / {items.length}
        </small>
        <span>
          {items.map((_, k) => (
            <i key={k} className={k === i ? "on" : ""} />
          ))}
        </span>
      </div>
    </div>
  );
}
