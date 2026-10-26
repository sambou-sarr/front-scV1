import { api } from "../../../lib/api";

export interface UploadedMedia {
  url: string;
  type: "image" | "video";
  alt: string;
  size: number;
}

/** Envoie le fichier brut et reçoit une référence stable servie par l'API. */
export async function uploadFicheMedia(
  ficheId: number,
  file: File,
  /** `menu` : vidéo d'un plat, dont le serveur vérifie la durée maximale. */
  purpose?: "menu"
): Promise<UploadedMedia> {
  const response = await api.post<{ media: UploadedMedia }>(
    `/fiches/${ficheId}/media`,
    file,
    {
      params: purpose ? { purpose } : undefined,
      headers: { "Content-Type": file.type },
      transformRequest: [data => data],
    }
  );
  return response.data.media;
}
