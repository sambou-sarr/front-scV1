import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import PublicFicheState from "../components/PublicFicheState";
import StickerSectionView from "../components/sticker/StickerSectionView";
import { usePassage } from "../hooks/usePassage";
import { fetchFiche } from "../lib/ficheApi";
import "./FicheStats.css";

/** Ces pages sont des raccourcis de sticker : on ne les référence pas dans les moteurs de recherche. */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}

/** /s/:slug/:section — la page ouverte par le scan d'un sticker. */
export default function StickerSectionPage() {
  const { slug = "", section = "" } = useParams<{
    slug: string;
    section: string;
  }>();
  const scrollerRef = useRef<HTMLDivElement>(null);
  useNoIndex();

  // Même clé que PublicFichePage : si la personne ouvre ensuite la fiche complète, les données sont déjà là.
  const ficheQuery = useQuery({
    queryKey: ["public-fiche", slug],
    enabled: slug.length > 0,
    queryFn: ({ signal }) =>
      fetchFiche(`fiches/public/${encodeURIComponent(slug)}`, signal),
    retry: false,
  });

  // Un scan de sticker est un scan de QR code : il compte dans les passages de la fiche.
  usePassage(slug, "qr", Boolean(ficheQuery.data));

  if (ficheQuery.isPending) return <PublicFicheState loading />;
  if (ficheQuery.isError || !ficheQuery.data)
    return <PublicFicheState error={ficheQuery.error} />;

  return (
    <main className="fiche-public-page" ref={scrollerRef}>
      <StickerSectionView
        fiche={ficheQuery.data}
        section={section}
        scrollerRef={scrollerRef}
      />
    </main>
  );
}
