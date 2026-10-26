import type { AxiosResponse } from "axios";
import { isAxiosError } from "axios";
import { api } from "../../lib/api";
import { toApiError } from "../../lib/apiError";
import type {
  Abonnement,
  Carte,
  CommandeInput,
  CreateStickerInput,
  Emplacements,
  FicheDetail,
  FichesPage,
  Formule,
  FormuleReglage,
  ListFichesParams,
  Parametres,
  PatchEmplacements,
  PatchFormule,
  ProductionSummary,
  QrApercu,
  QrFormat,
  QrFormatInfo,
  QrLien,
  QrRenderInput,
  QrStyle,
  QrStyleFull,
  QrStyleItem,
  RelanceType,
  RelancesPage,
  Revenus,
  Stats,
  StatutCarte,
  StatutSticker,
  Sticker,
  SubscriptionInput,
  TarifCommande,
  UsersPage,
} from "../../types/admin";

/*
  Appels du back-office (/admin/*, /client/qrcodes/*). Même client HTTP que le reste du site (lib/api.ts :
  jeton Bearer ajouté, session supprimée sur 401) ; toutes les erreurs remontent en `ApiError` lisible.
  La session administrateur elle-même (connexion, vérification du rôle) est dans features/auth/auth.service.ts.
*/

const FALLBACK: Record<number, string> = {
  400: "Données invalides.",
  401: "Session expirée, reconnecte-toi.",
  403: "Accès refusé.",
  404: "Introuvable.",
  409: "Conflit : cette valeur existe déjà.",
  422: "Opération impossible.",
  429: "Trop de tentatives, réessaie plus tard.",
};

const fallbackFor = (e: unknown): string => {
  const status = isAxiosError(e) ? e.response?.status : undefined;
  if (!status) return "Une erreur est survenue.";
  return (
    FALLBACK[status] ??
    (status >= 500 ? "Erreur du serveur." : `Erreur ${status}.`)
  );
};

type Query = Record<string, string | number | boolean | undefined | null>;

/** Paramètres de requête sans les valeurs vides (le serveur n'en veut pas). */
const clean = (q: Query = {}): Record<string, string | number | boolean> =>
  Object.fromEntries(
    Object.entries(q).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ) as Record<string, string | number | boolean>;

async function call<T>(promise: Promise<AxiosResponse<T>>): Promise<T> {
  try {
    return (await promise).data;
  } catch (e) {
    throw toApiError(e, fallbackFor(e));
  }
}

const get = <T>(path: string, query?: Query) =>
  call(api.get<T>(path, { params: clean(query) }));
const post = <T>(path: string, body?: unknown) => call(api.post<T>(path, body));
const patch = <T>(path: string, body?: unknown) =>
  call(api.patch<T>(path, body));
const del = <T>(path: string, query?: Query) =>
  call(api.delete<T>(path, { params: clean(query) }));

/** Téléchargement d'un fichier (POST qui renvoie un blob) : l'erreur serveur, elle, est lue en JSON. */
async function postBlob(
  path: string,
  body: unknown,
  query?: Query,
): Promise<{ blob: Blob; filename: string | null }> {
  try {
    const res = await api.post<Blob>(path, body, {
      params: clean(query),
      responseType: "blob",
    });
    const header = String(res.headers["content-disposition"] ?? "");
    const m = /filename="?([^";]+)"?/i.exec(header);
    return { blob: res.data, filename: m ? m[1] : null };
  } catch (e) {
    if (isAxiosError(e) && e.response?.data instanceof Blob) {
      try {
        e.response.data = JSON.parse(await e.response.data.text());
      } catch {
        e.response.data = undefined;
      }
    }
    throw toApiError(e, fallbackFor(e));
  }
}

export const adminApi = {
  // ───── Tableau de bord ─────
  stats: () => get<Stats>("/admin/stats"),
  getRevenus: () => get<Revenus>("/admin/revenus"),

  // ───── Fiches ─────
  listFiches: (p: ListFichesParams) =>
    get<FichesPage>("/admin/fiches", { ...p }),
  getFiche: (id: number) => get<FicheDetail>(`/admin/fiches/${id}`),
  // statut / slug / propriétaire (userId: null = retirer le propriétaire)
  updateFiche: (
    id: number,
    b: {
      slug?: string;
      statut?: "active" | "suspendue";
      userId?: number | null;
    },
  ) => patch<{ fiche: unknown }>(`/admin/fiches/${id}`, b),
  deleteFiche: (id: number, slug: string) =>
    del<{ ok: true }>(`/admin/fiches/${id}`, { confirmer: slug }),
  generateClaimCode: (id: number) =>
    post<{ claimCode: string }>(`/admin/fiches/${id}/claim-code`),

  // ───── Abonnements ─────
  activateSubscription: (id: number, b: SubscriptionInput) =>
    post<{ subscription: Abonnement }>(`/admin/fiches/${id}/subscription`, b),
  cancelSubscription: (id: number, subId: number) =>
    post<{ subscription: unknown }>(
      `/admin/fiches/${id}/subscriptions/${subId}/cancel`,
    ),

  // ───── Formules (prix, remises, emplacements) ─────
  getFormules: () => get<Parametres>("/admin/formules"),
  updateFormule: (formule: string, b: PatchFormule) =>
    patch<{ formule: FormuleReglage }>(
      `/admin/formules/${formule}`,
      b,
    ),
  updateEmplacements: (b: PatchEmplacements) =>
    patch<{ emplacements: Emplacements }>("/admin/formules/emplacements", b),
  tarifCommande: (b: CommandeInput) =>
    post<TarifCommande>("/admin/formules/commande/tarif", b),

  // ───── Relances (renouvellements, expirées, montée en gamme) ─────
  getRelances: (
    type: RelanceType,
    p: { jours?: number; scansMin?: number } = {},
  ) => get<RelancesPage>("/admin/relances", { type, ...p }),

  // ───── Production (cartes NFC, stickers, QR dynamiques) ─────
  productionSummary: () => get<ProductionSummary>("/admin/production/summary"),
  listCartes: () => get<{ cartes: Carte[] }>("/admin/production/cartes"),
  createCarte: (b: {
    ficheId: number;
    tier?: Formule;
    rectoUrl?: string;
    versoUrl?: string;
  }) => post<{ carte: Carte }>("/admin/production/cartes", b),
  updateCarte: (
    id: number,
    b: {
      statut?: StatutCarte;
      notes?: string | null;
      rectoUrl?: string | null;
      versoUrl?: string | null;
    },
  ) => patch<{ carte: Carte }>(`/admin/production/cartes/${id}`, b),
  listStickers: () => get<{ stickers: Sticker[] }>("/admin/production/stickers"),
  createSticker: (b: CreateStickerInput) =>
    post<{ sticker: Sticker }>("/admin/production/stickers", b),
  updateSticker: (
    id: number,
    b: { statut?: StatutSticker; notes?: string | null },
  ) => patch<{ sticker: Sticker }>(`/admin/production/stickers/${id}`, b),
  listQr: () => get<{ qr: QrLien[] }>("/admin/production/qr"),
  updateQr: (code: string, b: { targetUrl?: string | null; actif?: boolean }) =>
    patch<{ qr: QrLien }>(`/admin/production/qr/${code}`, b),

  // ───── QR codes (aperçu, téléchargement, styles enregistrés) ─────
  qrFormats: () => get<{ formats: QrFormatInfo[] }>("/admin/qrcodes/formats"),
  qrApercu: (b: QrRenderInput) => post<QrApercu>("/admin/qrcodes/apercu", b),
  qrTelecharger: (b: QrRenderInput, format: QrFormat) =>
    postBlob("/admin/qrcodes/telecharger", b, { format }),
  qrListStyles: () =>
    get<{ styles: QrStyleItem[] }>("/admin/qrcodes/styles"),
  qrGetStyle: (id: number) =>
    get<{ style: QrStyleFull }>(`/admin/qrcodes/styles/${id}`),
  qrCreateStyle: (b: { nom: string; style: QrStyle }) =>
    post<{ style: QrStyleFull }>("/admin/qrcodes/styles", b),
  qrUpdateStyle: (id: number, b: { nom?: string; style?: QrStyle }) =>
    patch<{ style: QrStyleFull }>(`/admin/qrcodes/styles/${id}`, b),
  qrDeleteStyle: (id: number) => del<null>(`/admin/qrcodes/styles/${id}`),

  // ───── Clients ─────
  listUsers: (p: {
    search?: string;
    role?: "client" | "admin";
    page?: number;
    limit?: number;
  }) => get<UsersPage>("/admin/users", { ...p }),
};
