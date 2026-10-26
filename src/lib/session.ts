import { useSyncExternalStore } from "react";

/*
  Session du client connecté : UNIQUE endroit qui sait où et comment elle est stockée.
  Le reste de l'application passe par ce module (`getToken`, `useSession`, `saveSession`, `clearSession`) ;
  plus aucun `localStorage.getItem("client_token")` ailleurs.

  Stockage actuel : jeton JWT renvoyé par POST /auth/login, gardé dans localStorage.
  Pour passer à un cookie httpOnly (recommandé), il faut aussi modifier l'API :
  voir src/features/auth/README.md. Seuls ce fichier et lib/api.ts changeraient côté front.

  Les clés `client_token` / `client_user` sont conservées : les sessions déjà ouvertes restent valides.
*/

export interface SessionUser {
  name: string;
  email: string;
  id?: number;
  role?: "CLIENT" | "ADMIN";
}
export interface Session {
  token: string;
  user: SessionUser;
}

const TOKEN_KEY = "client_token";
const USER_KEY = "client_user";

/* ───────── stockage (localStorage, avec repli mémoire si indisponible : navigation privée, quota…) ───────── */

const memory = new Map<string, string>();
const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
  },
  remove(key: string) {
    memory.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {
      /* rien à supprimer */
    }
  },
};

/* ───────── lecture ───────── */

const isSessionUser = (v: unknown): v is SessionUser =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as SessionUser).name === "string" &&
  typeof (v as SessionUser).email === "string";

/** Date d'expiration (ms) lue dans le champ `exp` d'un JWT, sans le vérifier (le serveur reste juge). */
function expiryOf(token: string): number | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

let cache: { raw: string; session: Session | null; expiresAt: number | null } =
  {
    raw: "",
    session: null,
    expiresAt: null,
  };

function read(): Session | null {
  const token = store.get(TOKEN_KEY);
  const rawUser = store.get(USER_KEY);
  const raw = `${token ?? ""}\u0000${rawUser ?? ""}`;
  if (raw !== cache.raw) {
    let session: Session | null = null;
    if (token && rawUser) {
      try {
        const user: unknown = JSON.parse(rawUser);
        if (isSessionUser(user)) session = { token, user };
      } catch {
        /* utilisateur illisible : session ignorée */
      }
    }
    cache = {
      raw,
      session,
      expiresAt: session ? expiryOf(session.token) : null,
    };
  }
  if (
    cache.session &&
    cache.expiresAt !== null &&
    Date.now() >= cache.expiresAt
  )
    return null;
  return cache.session;
}

/* ───────── abonnements (rendu React, autres onglets, expiration) ───────── */

const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());
let timer: ReturnType<typeof setTimeout> | undefined;

/** Programme la déconnexion locale à l'expiration du jeton (le plafond évite le dépassement du délai maximal de setTimeout). */
function armExpiry() {
  clearTimeout(timer);
  const s = read();
  if (!s || cache.expiresAt === null) return;
  const wait = Math.min(
    Math.max(cache.expiresAt - Date.now(), 0) + 50,
    2 ** 31 - 1,
  );
  timer = setTimeout(() => (read() ? armExpiry() : clearSession()), wait);
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === TOKEN_KEY || e.key === USER_KEY) {
      armExpiry();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/* ───────── API publique ───────── */

export const getSession = (): Session | null => read();
export const getToken = (): string | null => read()?.token ?? null;

export function saveSession(session: Session): void {
  store.set(TOKEN_KEY, session.token);
  store.set(USER_KEY, JSON.stringify(session.user));
  armExpiry();
  notify();
}

/** Supprime la session locale (déconnexion, jeton refusé ou expiré). Ne touche à rien d'autre dans le stockage. */
export function clearSession(): void {
  clearTimeout(timer);
  store.remove(TOKEN_KEY);
  store.remove(USER_KEY);
  notify();
}

/** Session courante dans un composant : se met à jour à la connexion, à la déconnexion, à l'expiration et entre onglets. */
export const useSession = (): Session | null =>
  useSyncExternalStore(subscribeSession, getSession, () => null);

armExpiry();
