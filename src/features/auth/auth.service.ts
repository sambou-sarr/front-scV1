import { api } from "../../lib/api";
import { ApiError, errorStatus, toApiError } from "../../lib/apiError";
import { clearSession, getToken, saveSession } from "../../lib/session";
import { IRegister, Login } from "../../types";

/*
  Appels d'authentification. Toutes les erreurs remontent en `ApiError` (message lisible + code + statut).
  La session (jeton + utilisateur) n'est lue et écrite que par lib/session.ts.
*/

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    nom: string;
    role: "CLIENT" | "ADMIN";
    emailVerified: boolean;
  };
  token: string;
}

export async function register(registerData: IRegister) {
  try {
    const res = await api.post("/auth/register", {
      email: registerData.email,
      password: registerData.password,
      nom: registerData.name,
    });
    return res.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function login(loginData: Login): Promise<LoginResponse> {
  try {
    const res = await api.post<LoginResponse>("/auth/login", loginData);
    const { token, user } = res.data;
    saveSession({
      token,
      user: { id: user.id, role: user.role, name: user.nom, email: user.email },
    });
    return res.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** Prévient le serveur (avec le jeton), puis supprime la session locale quoi qu'il arrive. */
export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    /* session déjà expirée ou serveur injoignable : on quitte quand même */
  } finally {
    clearSession();
  }
}

export async function verifyEmail(token: string): Promise<void> {
  try {
    await api.post("/auth/verify-email", { token });
  } catch (error) {
    throw toApiError(
      error,
      "La vérification a échoué. Le lien est peut-être expiré.",
    );
  }
}

export async function forgotPassword(email: string): Promise<void> {
  try {
    await api.post("/auth/forgot-password", { email });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function resetPassword(payload: {
  token: string;
  password: string;
}): Promise<void> {
  try {
    await api.post("/auth/reset-password", payload);
  } catch (error) {
    throw toApiError(error);
  }
}

/* ───────── Back-office (administrateurs) ───────── */

/**
 * Vérifie que le jeton courant est celui d'un administrateur (GET /auth/me) et mémorise l'identité dans la session.
 * Si /auth/me ne donne pas le rôle, une route réservée aux admins tranche (403 = compte non administrateur).
 */
export async function verifyAdminSession(): Promise<void> {
  const refuse = () => {
    clearSession();
    return new ApiError(
      "Ce compte n’est pas administrateur.",
      "INTERDIT",
      403,
    );
  };
  try {
    const res = await api.get<Record<string, unknown>>("/auth/me");
    const u = (
      res.data.user && typeof res.data.user === "object"
        ? res.data.user
        : res.data
    ) as Record<string, unknown>;
    const role = typeof u.role === "string" ? u.role.toLowerCase() : undefined;
    if (role && role !== "admin") throw refuse();
    if (!role) {
      try {
        await api.get("/admin/stats");
      } catch (e) {
        if (errorStatus(e) === 403) throw refuse();
        throw e;
      }
    }
    const email = typeof u.email === "string" ? u.email : "";
    const name = typeof u.nom === "string" ? u.nom : "";
    const token = getToken();
    if (!token) throw refuse();
    saveSession({
      token,
      user: {
        id: typeof u.id === "number" ? u.id : undefined,
        role: "ADMIN",
        name,
        email,
      },
    });
  } catch (error) {
    throw toApiError(error);
  }
}

/** Connexion administrateur : POST /auth/admin/login, puis vérification du rôle. */
export async function adminLogin(loginData: Login): Promise<void> {
  try {
    const res = await api.post<{ token?: string }>(
      "/auth/admin/login",
      loginData,
    );
    if (!res.data.token)
      throw new ApiError("Réponse de connexion inattendue (pas de jeton).");
    // Session provisoire : l'intercepteur de lib/api.ts a besoin du jeton pour appeler /auth/me.
    saveSession({
      token: res.data.token,
      user: { name: "", email: loginData.email, role: "ADMIN" },
    });
    await verifyAdminSession();
  } catch (error) {
    clearSession();
    throw toApiError(error);
  }
}
