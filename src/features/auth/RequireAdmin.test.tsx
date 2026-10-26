// @vitest-environment jsdom
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../lib/api";
import { clearSession, saveSession } from "../../lib/session";
import RequireAdmin from "./RequireAdmin";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const AdminLogin = () => {
  const { state } = useLocation();
  const s = state as { from?: string; notice?: string } | null;
  return h("p", null, `login from=${s?.from ?? "-"} notice=${s?.notice ?? "-"}`);
};
const app = (path: string) =>
  h(
    MemoryRouter,
    { initialEntries: [path] },
    h(
      Routes,
      null,
      h(Route, { path: "/admin/login", element: h(AdminLogin) }),
      h(Route, {
        path: "/admin/*",
        element: h(RequireAdmin, null, h("p", null, "back-office")),
      }),
    ),
  );

let host: HTMLDivElement;
let root: Root;
let calls: string[] = [];
let meResponse: () => { status: number; data?: unknown };
const original = api.defaults.adapter;

beforeEach(() => {
  localStorage.clear();
  calls = [];
  meResponse = () => ({ status: 200, data: { user: { role: "admin" } } });
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    calls.push(config.url ?? "");
    const { status, data } = meResponse();
    const response = { status, data, statusText: "", headers: {}, config };
    if (status >= 400)
      throw new AxiosError("fail", String(status), config, undefined, response);
    return response;
  };
  host = document.createElement("div");
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  clearSession();
  api.defaults.adapter = original;
});

const settle = () =>
  act(async () => {
    await new Promise(r => setTimeout(r, 0));
  });

describe("RequireAdmin", () => {
  it("renvoie vers /admin/login en mémorisant la page demandée", () => {
    act(() => root.render(app("/admin/fiches?statut=suspendue")));
    expect(host.textContent).toBe(
      "login from=/admin/fiches?statut=suspendue notice=-",
    );
  });

  it("refuse un compte client, avec un message", () => {
    saveSession({
      token: "T",
      user: { name: "Awa", email: "a@b.sn", role: "CLIENT" },
    });
    act(() => root.render(app("/admin")));
    expect(host.textContent).toBe(
      "login from=/admin notice=Ce compte n’est pas administrateur.",
    );
    expect(calls).toEqual([]);
  });

  it("affiche le back-office pour un administrateur, sans appel réseau", () => {
    saveSession({
      token: "T",
      user: { name: "Admin", email: "a@b.sn", role: "ADMIN" },
    });
    act(() => root.render(app("/admin")));
    expect(host.textContent).toBe("back-office");
    expect(calls).toEqual([]);
  });

  it("renvoie vers la connexion dès que la session disparaît", () => {
    saveSession({
      token: "T",
      user: { name: "Admin", email: "a@b.sn", role: "ADMIN" },
    });
    act(() => root.render(app("/admin")));
    act(() => clearSession());
    expect(host.textContent).toBe("login from=/admin notice=-");
  });

  it("vérifie une fois le rôle d'une ancienne session sans rôle", async () => {
    saveSession({ token: "T", user: { name: "Admin", email: "a@b.sn" } });
    act(() => root.render(app("/admin")));
    await settle();
    expect(calls).toEqual(["/auth/me"]);
    expect(host.textContent).toBe("back-office");
  });

  it("refuse une ancienne session dont le compte n'est pas administrateur", async () => {
    meResponse = () => ({ status: 200, data: { user: { role: "client" } } });
    saveSession({ token: "T", user: { name: "Awa", email: "a@b.sn" } });
    act(() => root.render(app("/admin")));
    await settle();
    expect(host.textContent).toBe("login from=/admin notice=-");
  });
});
