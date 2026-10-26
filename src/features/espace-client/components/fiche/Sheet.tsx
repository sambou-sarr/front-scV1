import type { ReactNode } from "react";
import { useEffect } from "react";
import { I } from "./Icon";

/** Feuille modale (plat, bien) ouverte depuis la fiche. */
export function Sheet({
  onClose,
  children,
  label,
}: {
  onClose: () => void;
  children: ReactNode;
  label: string;
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div
      className="f-sheet-bg"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className="f-sheet" onClick={e => e.stopPropagation()}>
        <button className="f-sheet-x" onClick={onClose} aria-label="Fermer">
          <I n="close" s={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ---------- Menu interactif : vignette → vidéo courte verticale + description ---------- */
