import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import Fiche from "../../espace-client/components/Fiche";
import PublicFicheState from "../components/PublicFicheState";
import { useIsFicheOwner } from "../hooks/useIsFicheOwner";
import { usePassage, type PassageSource } from "../hooks/usePassage";
import { fetchFiche } from "../lib/ficheApi";
import "./FicheStats.css";

export default function PublicFichePage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const requestedSource = searchParams.get("source");
  const source: PassageSource =
    requestedSource === "qr" || requestedSource === "nfc"
      ? requestedSource
      : "direct";

  const ficheQuery = useQuery({
    queryKey: ["public-fiche", slug],
    enabled: slug.length > 0,
    queryFn: ({ signal }) =>
      fetchFiche(`fiches/public/${encodeURIComponent(slug)}`, signal),
    retry: false,
  });

  usePassage(slug, source, Boolean(ficheQuery.data));
  // Le QR et le bouton « NFC · QR » sont des outils du propriétaire : un visiteur ne les voit jamais.
  const isOwner = useIsFicheOwner(slug);

  if (ficheQuery.isPending) return <PublicFicheState loading />;
  if (ficheQuery.isError || !ficheQuery.data)
    return <PublicFicheState error={ficheQuery.error} />;

  return (
    <main className="fiche-public-page" ref={scrollerRef}>
      <Fiche
        key={ficheQuery.data.id}
        fiche={ficheQuery.data}
        scrollerRef={scrollerRef}
        ownerTools={isOwner}
      />
    </main>
  );
}
