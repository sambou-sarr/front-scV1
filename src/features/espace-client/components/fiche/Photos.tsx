import { useState } from "react";

/** Galerie photo d'un bien. */
export function Photos({ photos, alt }: { photos: string[]; alt: string }) {
  const [i, setI] = useState(0);
  return (
    <div className="f-ph">
      <div
        className="f-ph-track"
        onScroll={e =>
          setI(
            Math.round(
              e.currentTarget.scrollLeft / e.currentTarget.clientWidth,
            ),
          )
        }
      >
        {photos.map((u, k) => (
          <img
            key={k}
            src={u}
            alt={k ? "" : alt}
            loading="lazy"
            draggable="false"
          />
        ))}
      </div>
      {photos.length > 1 && (
        <span className="f-ph-dots">
          {photos.map((_, k) => (
            <i key={k} className={k === i ? "on" : ""} />
          ))}
        </span>
      )}
      {photos.length > 1 && (
        <span className="f-ph-n">
          {i + 1} / {photos.length}
        </span>
      )}
    </div>
  );
}
