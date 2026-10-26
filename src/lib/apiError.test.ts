import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import {
  ApiError,
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

  it("utilise le message de repli quand le corps est vide", () => {
    expect(toApiError(axiosErr(500, {}), "Oups").message).toBe("Oups");
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
