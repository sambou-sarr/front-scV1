// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSession,
  getSession,
  getToken,
  saveSession,
  subscribeSession,
} from "./session";

const user = { name: "Awa", email: "awa@exemple.sn" };
const jwt = (exp?: number) =>
  `h.${btoa(JSON.stringify(exp === undefined ? {} : { exp })).replace(/=/g, "")}.s`;

beforeEach(() => localStorage.clear());
afterEach(() => {
  clearSession();
  vi.useRealTimers();
});

describe("session", () => {
  it("enregistre puis relit la session", () => {
    saveSession({ token: "abc", user });
    expect(getToken()).toBe("abc");
    expect(getSession()?.user).toEqual(user);
  });

  it("garde les clés historiques (les sessions déjà ouvertes restent valides)", () => {
    localStorage.setItem("client_token", "legacy");
    localStorage.setItem("client_user", JSON.stringify(user));
    expect(getSession()).toEqual({ token: "legacy", user });
  });

  it("ignore un utilisateur illisible ou incomplet", () => {
    localStorage.setItem("client_token", "t");
    localStorage.setItem("client_user", "{pas du json");
    expect(getSession()).toBeNull();
    localStorage.setItem("client_user", JSON.stringify({ name: "x" }));
    expect(getSession()).toBeNull();
  });

  it("clearSession ne supprime que la session, pas le reste du stockage", () => {
    localStorage.setItem("autre", "garde-moi");
    saveSession({ token: "abc", user });
    clearSession();
    expect(getSession()).toBeNull();
    expect(localStorage.getItem("autre")).toBe("garde-moi");
  });

  it("prévient les abonnés à la connexion et à la déconnexion", () => {
    const listener = vi.fn();
    const off = subscribeSession(listener);
    saveSession({ token: "abc", user });
    clearSession();
    expect(listener).toHaveBeenCalledTimes(2);
    off();
    saveSession({ token: "abc", user });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("réagit à une déconnexion dans un autre onglet (événement storage)", () => {
    saveSession({ token: "abc", user });
    const listener = vi.fn();
    const off = subscribeSession(listener);
    localStorage.clear();
    window.dispatchEvent(new StorageEvent("storage", { key: "client_token" }));
    expect(listener).toHaveBeenCalled();
    expect(getSession()).toBeNull();
    off();
  });

  it("refuse un jeton JWT expiré", () => {
    saveSession({ token: jwt(Math.floor(Date.now() / 1000) - 60), user });
    expect(getToken()).toBeNull();
  });

  it("se déconnecte tout seul à l'expiration du jeton", () => {
    vi.useFakeTimers();
    saveSession({ token: jwt(Math.floor(Date.now() / 1000) + 60), user });
    expect(getToken()).not.toBeNull();
    const listener = vi.fn();
    subscribeSession(listener);
    vi.advanceTimersByTime(61_000);
    expect(getSession()).toBeNull();
    expect(localStorage.getItem("client_token")).toBeNull();
    expect(listener).toHaveBeenCalled();
  });

  it("un jeton sans date d'expiration reste valable (le serveur reste juge)", () => {
    saveSession({ token: jwt(), user });
    expect(getToken()).not.toBeNull();
    saveSession({ token: "pas-un-jwt", user });
    expect(getToken()).toBe("pas-un-jwt");
  });
});
