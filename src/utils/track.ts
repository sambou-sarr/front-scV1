/*
  Mesure du tunnel de vente. Envoie un événement vers Google Tag Manager / GA4
  (window.dataLayer) s'il est installé, sinon ne fait rien. Aucun cookie posé ici.
  Événements : diag_answer, diag_result, lead_email, lead_call, cta_demo.
*/
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export default function track(
  event: string,
  params: Record<string, unknown> = {}
): void {
  try {
    (window.dataLayer = window.dataLayer || []).push({ event, ...params });
  } catch (e) {
    /* silencieux */
  }
}
