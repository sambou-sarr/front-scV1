import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import {
  ApiError,
  errMsg,
  isAuthFailure,
  isUnauthorized,
  toApiError,
} from "./apiError";

const axiosErr = (status?: number, data?: unknown) =>
  new AxiosError(
    "boom",
    undefined,
    undefined,
    undefined,
    status === undefined
      ? undefined
      : ({ status, data, statusText: "", headers: {}, config: {} } as never),
  );

describe("toApiError", () => {
  it("lit le format serveur { error: { code, message } }", () => {
    const e = toApiError(
      axiosErr(409, {
        error: { code: "EMAIL_PRIS", message: "E-mail déjà utilisé." },
      }),
    );
    expect(e).toBeInstanceOf(ApiError);
    expect([e.message, e.code, e.status]).toEqual([
      "E-mail déjà utilisé.",
      "EMAIL_PRIS",
      409,
    ]);
  });

  it("lit le format { message }", () => {
    expect(toApiError(axiosErr(400, { message: "Lien expiré." })).message).toBe(
      "Lien expiré.",
    );
  });

  it("utilise le fallback explicite sûr quand le corps d'une erreur serveur est vide", () => {
    expect(toApiError(axiosErr(500, {}), "Oups").message).toBe(
      "Oups",
    );
    expect(toApiError(axiosErr(500, {})).message).toBe(
      "Une erreur technique est survenue. Réessayez plus tard.",
    );
  });

  it("n'expose jamais le message technique renvoyé avec une erreur serveur", () => {
    const e = toApiError(
      axiosErr(503, {
        error: {
          code: "DB_UNAVAILABLE",
          message: "postgres://internal-host/password",
        },
      }),
    );

    expect(e.message).toBe(
      "Une erreur technique est survenue. Réessayez plus tard.",
    );
    expect(e.code).toBe("ERREUR_SERVEUR");
    expect(e.status).toBe(503);
  });

  it("n'expose pas le message d'une erreur technique locale inconnue", () => {
    expect(toApiError(new Error("internal stack details")).message).toBe(
      "Une erreur inattendue est survenue.",
    );
  });

  it("normalise les erreurs utilisées directement par les écrans", () => {
    expect(errMsg(axiosErr(500, { message: "database password" }))).toBe(
      "Une erreur technique est survenue. Réessayez plus tard.",
    );
    expect(errMsg(new Error("internal stack details"))).toBe(
      "Une erreur inattendue est survenue.",
    );
  });

  it("signale l'absence de réseau", () => {
    const e = toApiError(axiosErr(undefined));
    expect(e.code).toBe("NETWORK");
    expect(e.message).toMatch(/joindre le serveur/);
  });

  it("laisse passer une ApiError telle quelle", () => {
    const e = new ApiError("x", "C", 418);
    expect(toApiError(e)).toBe(e);
  });
});

describe("statut d'authentification", () => {
  it("reconnaît 401 et 403 sur une AxiosError comme sur une ApiError", () => {
    expect(isUnauthorized(axiosErr(401))).toBe(true);
    expect(isUnauthorized(new ApiError("x", undefined, 401))).toBe(true);
    expect(isAuthFailure(axiosErr(403))).toBe(true);
    expect(isAuthFailure(axiosErr(500))).toBe(false);
    expect(isAuthFailure(new Error("x"))).toBe(false);
  });
});
