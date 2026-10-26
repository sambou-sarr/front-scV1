import { FICHE_DATA_KEYS, type FicheRecord, type Plan } from "../../../types";

/*
  Construit le corps de PATCH /api/fiches/:id à partir du brouillon de l'éditeur.
  Il respecte updateFicheSchema (api-sc/src/modules/fiches/fiches.schemas.ts) :

  - on n'envoie QUE ce qui a changé (champs d'identité + clés de `data`). Une liste envoyée REMPLACE celle du
    serveur ; une liste absente n'est pas touchée. Ça évite aussi de renvoyer des données que la formule
    interdit (ex. des prix sur Pro) et de provoquer un 422 pour rien ;
  - les lignes incomplètes (libellé / nom / titre vide) sont retirées : le serveur les refuse (400) et ferait
    échouer toute la sauvegarde. Elles sont comptées dans `skipped` pour prévenir l'utilisateur ;
  - les fichiers choisis dans Editor sont envoyés au service média avant la sauvegarde de la fiche ;
    toute URL blob: / data: restante est refusée pour éviter de perdre une prévisualisation locale.
*/

const IDENTITY = [
  "prenom",
  "nom",
  "fonction",
  "entreprise",
  "photo",
  "logo",
  "telephone",
  "whatsapp",
  "email",
  "site",
  "adresse",
  "googlePlaceId",
] as const;

type Json = Record<string, unknown>;

export interface PayloadResult {
  /** Corps à envoyer ; `null` si rien n'a changé. */
  payload: Json | null;
  /** Lignes incomplètes retirées de la requête (pour en informer l'utilisateur). */
  skipped: string[];
  /** Données conservées en base mais non envoyées car la formule actuelle ne les permet plus (ex. prix après rétrogradation). */
  ignored: string[];
  /** Zones contenant encore une URL de prévisualisation locale blob: / data:. */
  pendingUploads: string[];
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const digits = (v: unknown) => {
  const d = String(v ?? "").replace(/\D/g, "");
  return d === "" ? undefined : Number(d);
};
/** Ajoute la clé seulement si la valeur est renseignée. */
const opt = (o: Json, k: string, v: unknown) => {
  if (v !== undefined && v !== "" && v !== null) o[k] = v;
  return o;
};

export function buildUpdatePayload(previous: FicheRecord, draft: FicheRecord, plan?: Plan): PayloadResult {
  const skipped: string[] = [];
  const ignored: string[] = [];
  // Le serveur refuse (422) tout prix reçu si la formule n'en autorise pas : une fiche rétrogradée de Signature
  // à Pro ne pourrait plus jamais enregistrer son catalogue. On n'envoie donc pas ces prix et on le signale.
  const keepPrices = plan?.catalogPrices ?? true;
  const skip = (n: number, one: string, many: string) => {
    if (n > 0) skipped.push(n === 1 ? `1 ${one}` : `${n} ${many}`);
  };

  const rows = <T,>(list: T[] | undefined, ok: (x: T) => boolean) => {
    const all = list ?? [];
    const kept = all.filter(ok);
    return { kept, dropped: all.length - kept.length };
  };

  const clean: Record<string, (v: any) => unknown> = {
    reseauxSociaux: (v: { label: string; url: string }[]) => {
      const { kept, dropped } = rows(v, x => str(x.label) !== "");
      skip(dropped, "réseau social sans nom", "réseaux sociaux sans nom");
      return kept.map(x => ({ label: str(x.label), url: str(x.url) }));
    },
    liens: (v: { label: string; url: string }[]) => {
      const { kept, dropped } = rows(v, x => str(x.label) !== "");
      skip(dropped, "lien sans libellé", "liens sans libellé");
      return kept.map(x => ({ label: str(x.label), url: str(x.url) }));
    },
    horaires: (v: { jour: string; horaire: string }[]) =>
      rows(v, x => str(x.horaire) !== "").kept.map(x => ({ jour: x.jour, horaire: str(x.horaire) })),
    galerie: (v: { type?: string; url: string; alt?: string }[]) => {
      const { kept, dropped } = rows(v, x => str(x.url) !== "");
      skip(dropped, "média sans adresse", "médias sans adresse");
      return kept.map(x => opt({ type: x.type === "video" ? "video" : "image", url: str(x.url) }, "alt", str(x.alt)));
    },
    sections: (v: { titre: string; articles: any[] }[]) =>
      (v ?? []).flatMap(sec => {
        const { kept, dropped } = rows(sec.articles, a => str(a.nom) !== "");
        skip(dropped, "article sans nom", "articles sans nom");
        const titre = str(sec.titre) || (kept.length ? "Sans titre" : "");
        if (!titre) return [];
        return [
          {
            titre,
            articles: kept.map(a => {
              const o: Json = { nom: str(a.nom) };
              opt(o, "description", str(a.description));
              opt(o, "photo", str(a.photo));
              if (keepPrices) opt(o, "prix", digits(a.prix));
              else if (digits(a.prix) !== undefined && !ignored.includes("prix du catalogue")) ignored.push("prix du catalogue");
              opt(o, "badge", str(a.badge));
              return o;
            }),
          },
        ];
      }),
    menu: (v: { sections: { titre: string; plats: any[] }[] } | undefined) => ({
      sections: (v?.sections ?? []).flatMap(sec => {
        const { kept, dropped } = rows(sec.plats, p => str(p.nom) !== "");
        skip(dropped, "plat sans nom", "plats sans nom");
        const titre = str(sec.titre) || (kept.length ? "Sans titre" : "");
        if (!titre) return [];
        return [
          {
            titre,
            plats: kept.map(p => {
              const o: Json = { nom: str(p.nom) };
              opt(o, "prix", digits(p.prix));
              opt(o, "description", str(p.description));
              opt(o, "image", str(p.image));
              opt(o, "video", str(p.video));
              opt(o, "videoWebm", str(p.videoWebm));
              opt(o, "badge", str(p.badge));
              return o;
            }),
          },
        ];
      }),
    }),
    biens: (v: any[]) => {
      const { kept, dropped } = rows(v, b => str(b.titre) !== "");
      skip(dropped, "bien sans titre", "biens sans titre");
      return kept.map(b => {
        const o: Json = { titre: str(b.titre), type: b.type === "location" ? "location" : "vente" };
        opt(o, "prix", digits(b.prix));
        opt(o, "periode", str(b.periode));
        opt(o, "ville", str(b.ville));
        opt(o, "surface", digits(b.surface));
        opt(o, "terrain", digits(b.terrain));
        opt(o, "chambres", digits(b.chambres));
        opt(o, "sdb", digits(b.sdb));
        o.atouts = (b.atouts ?? []).map(str).filter(Boolean);
        opt(o, "description", str(b.description));
        o.photos = (b.photos ?? []).map(str).filter(Boolean);
        return o;
      });
    },
    rendezVous: (v: { label: string; url: string } | undefined) => ({ label: str(v?.label), url: str(v?.url) }),
    onglets: (v: { type: string; titre?: string; contenu?: string; visible?: boolean }[]) =>
      (v ?? []).map(o => {
        const r: Json = { type: o.type, visible: o.visible ?? true };
        opt(r, "titre", str(o.titre));
        if (o.type === "texte") opt(r, "contenu", o.contenu?.trim());
        return r;
      }),
    entete: (v: { disposition?: string; taille?: string; theme?: string; couverture?: string } | undefined) => {
      const o: Json = {};
      if (v?.disposition) o.disposition = v.disposition;
      if (v?.taille) o.taille = v.taille;
      if (v?.theme) o.theme = v.theme;
      if (v?.couverture !== undefined) o.couverture = str(v.couverture);
      return o;
    },
  };

  const payload: Json = {};
  for (const k of IDENTITY) if (!same(previous[k], draft[k])) payload[k] = str(draft[k]);

  const data: Json = {};
  for (const k of FICHE_DATA_KEYS) {
    if (same(previous.data[k], draft.data[k])) continue;
    const value = draft.data[k];
    data[k] = clean[k] ? clean[k](value) : typeof value === "string" ? value.trim() : value;
  }
  if (Object.keys(data).length) payload.data = data;

  // Version vue au chargement : le serveur refuse (409) si la fiche a changé entre-temps (autre onglet, autre appareil).
  if (Object.keys(payload).length && previous.updatedAt) payload.baseUpdatedAt = previous.updatedAt;

  return {
    payload: Object.keys(payload).length ? payload : null,
    skipped,
    ignored,
    pendingUploads: findPendingUploads(payload),
  };
}

/* ───────── images importées (blob: / data:) ───────── */

const PENDING = /^(blob:|data:)/i;
const AREA: Record<string, string> = {
  photo: "photo de profil",
  logo: "logo",
  galerie: "galerie",
  sections: "catalogue",
  menu: "menu",
  biens: "biens",
  entete: "image de couverture",
};

function findPendingUploads(payload: Json): string[] {
  const hit = new Map<string, number>();
  const walk = (v: unknown, area: string) => {
    if (typeof v === "string") {
      if (PENDING.test(v)) hit.set(area, (hit.get(area) ?? 0) + 1);
    } else if (Array.isArray(v)) v.forEach(x => walk(x, area));
    else if (v && typeof v === "object") Object.values(v).forEach(x => walk(x, area));
  };
  for (const [k, v] of Object.entries(payload)) {
    if (k === "data") for (const [dk, dv] of Object.entries(v as Json)) walk(dv, AREA[dk] ?? dk);
    else walk(v, AREA[k] ?? k);
  }
  return [...hit].map(([area, n]) => (n > 1 ? `${area} (${n} images)` : area));
}

/* ───────── libellés des erreurs du serveur ───────── */

const FIELD_LABEL: Record<string, string> = {
  prenom: "Prénom",
  nom: "Nom",
  fonction: "Fonction",
  entreprise: "Entreprise",
  photo: "Photo de profil",
  logo: "Logo",
  telephone: "Téléphone",
  whatsapp: "WhatsApp",
  email: "E-mail",
  site: "Site web",
  adresse: "Adresse",
  googlePlaceId: "Identifiant Google",
  secteur: "Secteur",
  premierBouton: "Premier bouton",
  messageWhatsapp: "Message WhatsApp",
  presentation: "Présentation",
  reseauxSociaux: "Réseaux sociaux",
  liens: "Liens",
  horaires: "Horaires",
  galerie: "Galerie",
  sections: "Catalogue",
  articles: "articles",
  menu: "Menu",
  plats: "plats",
  biens: "Biens",
  photos: "photos",
  rendezVous: "Rendez-vous",
  onglets: "Blocs",
  entete: "Entête",
  label: "libellé",
  url: "adresse",
  nom_: "nom",
  titre: "titre",
  type: "type",
  disposition: "disposition",
  theme: "thème",
  couverture: "couverture",
};

/** « data.liens.2.label » → « Liens, ligne 3 · libellé » */
export function labelForChamp(champ: string): string {
  const parts = champ.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  if (parts[0] === "data") parts.shift();
  const out: string[] = [];
  for (const p of parts) {
    if (/^\d+$/.test(p)) out.push(`ligne ${Number(p) + 1}`);
    else if (p === "sections" && out.length && out[out.length - 1].startsWith("Menu")) continue; // menu.sections
    else out.push(FIELD_LABEL[p] ?? p);
  }
  return out.length ? out.join(" · ") : "Données";
}
