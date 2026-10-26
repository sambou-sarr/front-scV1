import { isAxiosError } from "axios";
import type { ChangeEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { toFicheError } from "../../lib/ficheSource";
import { uploadFicheMedia } from "../../services/media.service";
import { optimizeImageFile } from "../../services/mediaOptimizer";
import { I } from "../fiche/Icon";

/* Éléments partagés par l'éditeur et ses éditeurs d'onglets (verrou d'offre, envoi de média). */
export const UPGRADE_PATH = "/espace-client/abonnements";
export const Lock = ({
  to = "Signature",
  children,
}: {
  to?: string;
  children: ReactNode;
}) => (
  <div className="ed-lock">
    <I n="star" s={14} />
    <span>{children}</span>
    <Link to={UPGRADE_PATH}>Passer en {to}</Link>
  </div>
);
export const toURL = (f: Blob) => URL.createObjectURL(f);

/** Message lisible pour un échec d'upload : on garde le texte du serveur quel que soit le statut (403, 422, 503…). */
function uploadErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : "Échec de l'envoi du média.";
  }
  if (!error.response) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.";
  }
  const { status, data } = error.response;
  const apiError = (
    data as { error?: { code?: string; message?: string } } | undefined
  )?.error;
  // Route absente (API pas à jour) : ne pas la présenter comme « Fiche introuvable ».
  if (status === 404 && apiError?.code === "ROUTE_INTROUVABLE") {
    return "Le serveur ne propose pas l'envoi de médias : mettez l'API à jour.";
  }
  if (status === 401)
    return "Votre session a expiré. Reconnectez-vous pour continuer.";
  if (status === 413) return "Ce fichier est trop volumineux.";
  if (status === 429)
    return "Trop de requêtes. Patientez un instant puis réessayez.";
  return apiError?.message ?? toFicheError(error).message;
}

/** Upload helper shared by Editor and ContentEditor (separate component scope). */
export async function uploadMedia(
  ficheId: number,
  file: File,
  purpose?: "menu",
) {
  try {
    const prepared = file.type.startsWith("image/")
      ? await optimizeImageFile(file)
      : file;
    return await uploadFicheMedia(ficheId, prepared, purpose);
  } catch (error) {
    // Les erreurs locales (format, compression) gardent leur texte ; celles du serveur gardent le leur.
    throw new Error(uploadErrorMessage(error));
  }
}

/** Gestionnaire d'`<input type="file">` image : envoie le fichier puis rappelle `cb` avec l'URL stockée. */
export const imageInput =
  (ficheId: number, cb: (url: string) => void) =>
  async (ev: ChangeEvent<HTMLInputElement>) => {
    const input = ev.currentTarget;
    const f = input.files?.[0];
    try {
      if (f && /^image\//.test(f.type)) {
        const media = await uploadMedia(ficheId, f);
        cb(media.url);
      }
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Échec de l'envoi du média.",
      );
    } finally {
      input.value = "";
    }
  };

/** Télécharge le premier `<svg>` trouvé dans `root` (par exemple un QR code) sous le nom `filename`. */
export function downloadSvg(root: ParentNode | null, filename: string) {
  const svg = root?.querySelector("svg");
  if (!svg) return;
  const url = URL.createObjectURL(
    new Blob([svg.outerHTML], { type: "image/svg+xml" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
