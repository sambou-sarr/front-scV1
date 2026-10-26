import { api } from "../../../lib/api";
import {
  FICHE_DATA_KEYS,
  type ApiFicheDetail,
  type FicheData,
  type FicheRecord,
  type Formule,
} from "../../../types";

/*
  Frontière entre le serveur et le front : seul endroit où un `ApiFicheDetail` (forme brute) devient
  un `FicheRecord` (modèle de référence). Les composants ne manipulent jamais le DTO.
*/

export function toFicheRecord(dto: ApiFicheDetail): FicheRecord {
  const raw = dto.data ?? {};

  // Seules les clés connues de FicheData sont reprises (liste unique : FICHE_DATA_KEYS, ordre conservé).
  const data: FicheData = {};
  for (const key of FICHE_DATA_KEYS) {
    if (key === "galerie") {
      // Galerie : toujours un tableau ; on écarte les médias de type inconnu.
      data.galerie = (raw.galerie ?? [])
        .filter(media => media.type === "image" || media.type === "video")
        .map(media => ({
          type: media.type as "image" | "video",
          url: media.url,
          alt: media.alt,
        }));
    } else if (raw[key] !== undefined) {
      (data as Record<string, unknown>)[key] = raw[key];
    }
  }

  return {
    id: dto.id,
    slug: dto.slug,
    formule: dto.formule.toLowerCase() as Formule,
    planCapabilities: dto.planCapabilities ?? null,
    expiree: dto.expiree ?? false,
    statut: dto.statut.toLowerCase(),
    enLigneSeule: dto.enLigneSeule,
    prenom: dto.prenom ?? "",
    nom: dto.nom ?? "",
    fonction: dto.fonction ?? "",
    entreprise: dto.entreprise ?? "",
    photo: dto.photo ?? "",
    logo: dto.logo ?? "",
    telephone: dto.telephone ?? "",
    whatsapp: dto.whatsapp ?? "",
    email: dto.email ?? "",
    site: dto.site ?? "",
    adresse: dto.adresse ?? "",
    googlePlaceId: dto.googlePlaceId ?? "",
    dateEcheance: dto.dateEcheance,
    scansTotal: dto.scansTotal,
    updatedAt: dto.updatedAt,
    data,
  };
}

/** GET d'une fiche (`fiches/:id` ou `fiches/public/:slug`) convertie en `FicheRecord`. */
export async function fetchFiche(
  path: string,
  signal?: AbortSignal,
): Promise<FicheRecord> {
  const res = await api.get<{ fiche: ApiFicheDetail }>(path, { signal });
  return toFicheRecord(res.data.fiche);
}

/** PATCH d'une fiche : renvoie la version enregistrée par le serveur. */
export async function patchFiche(
  id: number,
  payload: Record<string, unknown>,
): Promise<FicheRecord> {
  const res = await api.patch<{ fiche: ApiFicheDetail }>(
    `fiches/${id}`,
    payload,
  );
  return toFicheRecord(res.data.fiche);
}

/** Publication explicite d’un brouillon (`POST /fiches/:id/publish`). */
export async function publishFiche(id: number): Promise<FicheRecord> {
  const res = await api.post<{ fiche: ApiFicheDetail }>(
    `fiches/${id}/publish`,
  );
  return toFicheRecord(res.data.fiche);
}
