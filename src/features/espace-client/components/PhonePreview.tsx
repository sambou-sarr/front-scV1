import { useRef, type ReactNode, type RefObject } from "react";

/**
 * Mini téléphone d'aperçu (cadre + zone défilante). Utilisé par la page d'aperçu de la fiche (`/fiche/preview/:id`)
 * et par l'administration (`/admin/fiches/:id`, aperçu des sections de stickers). Le style est global
 * (styles/global.css, `.fiche-preview-*`). `children` reçoit la zone défilante, à passer à `<Fiche scrollerRef>`.
 */
export default function PhonePreview({
  children,
}: {
  children: (scrollerRef: RefObject<HTMLDivElement>) => ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  return (
    <div className="fiche-preview-stage">
      <div className="fiche-preview-device">
        <div className="fiche-preview-device-in" ref={scroller}>
          {children(scroller)}
        </div>
      </div>
    </div>
  );
}
