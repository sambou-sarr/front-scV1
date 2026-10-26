// @vitest-environment jsdom
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearSession, saveSession } from "../../lib/session";
import RequireAuth from "./RequireAuth";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const Login = () => {
  const { state } = useLocation();
  return h(
    "p",
    null,
    `login from=${(state as { from?: string } | null)?.from ?? "-"}`,
  );
};
const app = (path: string) =>
  h(
    MemoryRouter,
    { initialEntries: [path] },
    h(
      Routes,
      null,
      h(Route, { path: "/login", element: h(Login) }),
      h(Route, {
        path: "/espace-client/*",
        element: h(RequireAuth, null, h("p", null, "secret")),
      }),
    ),
  );

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  localStorage.clear();
  host = document.createElement("div");
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  clearSession();
});

describe("RequireAuth", () => {
  it("renvoie vers /login en mémorisant la page demandée", () => {
    act(() => root.render(app("/espace-client/editeur?x=1")));
    expect(host.textContent).toBe("login from=/espace-client/editeur?x=1");
  });

  it("affiche la page protégée quand une session existe", () => {
    saveSession({ token: "T", user: { name: "Awa", email: "a@b.sn" } });
    act(() => root.render(app("/espace-client")));
    expect(host.textContent).toBe("secret");
  });

  it("renvoie vers /login dès que la session disparaît (déconnexion, 401, expiration)", () => {
    saveSession({ token: "T", user: { name: "Awa", email: "a@b.sn" } });
    act(() => root.render(app("/espace-client")));
    expect(host.textContent).toBe("secret");
    act(() => clearSession());
    expect(host.textContent).toBe("login from=/espace-client");
  });
});
