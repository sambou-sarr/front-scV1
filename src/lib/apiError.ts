import { isAxiosError } from "axios";

export const SERVER_ERROR_MESSAGE =
  "Une erreur technique est survenue. Réessayez plus tard.";
export const NETWORK_ERROR_MESSAGE =
  "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.";
const UNEXPECTED_ERROR_MESSAGE = "Une erreur inattendue est survenue.";

/** Erreur d'API normalisée (message lisible, code métier du serveur, statut HTTP). */
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ErrorBody = {
  error?: string | { code?: string; message?: string };
  message?: string;
};

/** Statut HTTP d'une erreur, qu'elle soit une `ApiError` ou une `AxiosError`. */
export function errorStatus(e: unknown): number | undefined {
  if (e instanceof ApiError) return e.status;
  if (isAxiosError(e)) return e.response?.status;
  return undefined;
}

/** Session absente, invalide ou expirée (401). */
export const isUnauthorized = (e: unknown) => errorStatus(e) === 401;

/** Accès refusé : session expirée (401) ou droits insuffisants (403). */
export const isAuthFailure = (e: unknown) => {
  const s = errorStatus(e);
  return s === 401 || s === 403;
};

/**
 * Convertit n'importe quelle erreur en `ApiError`.
 * Format serveur : `{ error: { code, message } }` ou `{ message }`.
 */
export function toApiError(
  e: unknown,
  fallback?: string,
): ApiError {
  if (e instanceof ApiError) return e;
  if (isAxiosError(e)) {
    if (!e.response) {
      return new ApiError(
        NETWORK_ERROR_MESSAGE,
        "NETWORK",
        0,
      );
    }
    if (e.response.status >= 500) {
      return new ApiError(
        fallback ?? SERVER_ERROR_MESSAGE,
        "ERREUR_SERVEUR",
        e.response.status,
      );
    }
    const body = e.response.data as ErrorBody | undefined;
    const err = typeof body?.error === "object" ? body.error : undefined;
    return new ApiError(
      err?.message ??
        (typeof body?.error === "string" ? body.error : undefined) ??
        body?.message ??
        fallback ??
        "Une erreur est survenue.",
      err?.code,
      e.response.status,
    );
  }
  return new ApiError(fallback ?? UNEXPECTED_ERROR_MESSAGE);
}

/** Message lisible d'une erreur quelconque (notifications, états d'erreur des écrans). */
export const errMsg = (e: unknown): string => {
  if (e instanceof ApiError) return e.message;
  if (isAxiosError(e)) return toApiError(e).message;
  return UNEXPECTED_ERROR_MESSAGE;
};
