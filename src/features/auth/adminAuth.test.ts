// @vitest-environment jsdom
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../lib/api";
import { getSession, clearSession } from "../../lib/session";
import { adminLogin, verifyAdminSession } from "./auth.service";

type Call = { url?: string; auth?: string };
let calls: Call[] = [];
let respond: (config: InternalAxiosRequestConfig) => {
  status: number;
  data?: unknown;
};
const original = api.defaults.adapter;

beforeEach(() => {
  localStorage.clear();
  calls = [];
  api.defaults.adapter = async config => {
    calls.push({
      url: config.url,
      auth: config.headers.Authorization as string | undefined,
    });
    const { status, data } = respond(config);
    const response = { status, data, statusText: "", headers: {}, config };
    if (status >= 400)
      throw new AxiosError("fail", String(status), config, undefined, response);
    return response;
  };
});
afterEach(() => {
  api.defaults.adapter = original;
  clearSession();
});

describe("adminLogin", () => {
  it("ouvre une session ADMIN : le jeton n'est pas envoyé au login, il l'est pour /auth/me", async () => {
    respond = c =>
      c.url === "/auth/admin/login"
        ? { status: 200, data: { token: "TOKEN" } }
        : {
            status: 200,
            data: { user: { id: 3, email: "root@sc.sn", nom: "Root", role: "ADMIN" } },
          };
    await adminLogin({ email: "root@sc.sn", password: "x" });
    expect(calls).toEqual([
      { url: "/auth/admin/login", auth: undefined },
      { url: "/auth/me", auth: "Bearer TOKEN" },
    ]);
    expect(getSession()).toEqual({
      token: "TOKEN",
      user: { id: 3, role: "ADMIN", name: "Root", email: "root@sc.sn" },
    });
  });

  it("n'enregistre aucune session si le compte n'est pas administrateur", async () => {
    respond = c =>
      c.url === "/auth/admin/login"
        ? { status: 200, data: { token: "TOKEN" } }
        : { status: 200, data: { user: { role: "client" } } };
    await expect(
      adminLogin({ email: "a@b.sn", password: "x" }),
    ).rejects.toMatchObject({ status: 403 });
    expect(getSession()).toBeNull();
  });

  it("remonte l'erreur du serveur et ne garde rien", async () => {
    respond = () => ({
      status: 401,
      data: { error: { code: "IDENTIFIANTS", message: "Identifiants invalides." } },
    });
    await expect(
      adminLogin({ email: "a@b.sn", password: "mauvais" }),
    ).rejects.toMatchObject({ message: "Identifiants invalides.", status: 401 });
    expect(getSession()).toBeNull();
  });

  it("sans rôle dans /auth/me, une route admin tranche (403 = refusé)", async () => {
    respond = c =>
      c.url === "/admin/stats"
        ? { status: 403, data: {} }
        : { status: 200, data: { user: { email: "a@b.sn" } } };
    localStorage.setItem("client_token", "T");
    localStorage.setItem("client_user", JSON.stringify({ name: "A", email: "a@b.sn" }));
    await expect(verifyAdminSession()).rejects.toMatchObject({ status: 403 });
    expect(getSession()).toBeNull();
  });
});
