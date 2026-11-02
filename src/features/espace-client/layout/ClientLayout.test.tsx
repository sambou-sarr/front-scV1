// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../../lib/api";
import { clearSession, saveSession } from "../../../lib/session";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ClientLayout from "./ClientLayout";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let calls: { method?: string; url?: string }[] = [];
let verified = false;
let root: Root;
let host: HTMLDivElement;
let queryClient: QueryClient;
const originalAdapter = api.defaults.adapter;

beforeEach(() => {
  calls = [];
  verified = false;
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    calls.push({ method: config.method, url: config.url });
    const data =
      config.url === "/auth/me"
        ? {
            user: {
              id: 7,
              email: "awa@example.com",
              nom: "Awa",
              role: "CLIENT",
              emailVerified: verified,
            },
          }
        : { ok: true };
    return {
      status: 200,
      data,
      statusText: "",
      headers: {},
      config,
    };
  };
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  queryClient.clear();
  clearSession();
  host.remove();
  api.defaults.adapter = originalAdapter;
});

const settle = async () => {
  for (let i = 0; i < 4; i++) {
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  }
};

const renderLayout = (emailVerified?: boolean) => {
  saveSession({
    token: "client-token",
    user: {
      id: 7,
      role: "CLIENT",
      name: "Awa",
      email: "awa@example.com",
      emailVerified,
    },
  });
  act(() =>
    root.render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/espace-client"]}>
          <Routes>
            <Route path="/espace-client" element={<ClientLayout />}>
              <Route index element={<p>Tableau de bord client</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  );
};

describe("ClientLayout email verification", () => {
  it("shows a reminder and resends the verification link on click", async () => {
    renderLayout(false);
    await settle();

    expect(host.textContent).toContain(
      "Votre adresse e-mail n’est pas vérifiée",
    );
    const button = [...host.querySelectorAll("button")].find(element =>
      element.textContent?.includes("Vérifier mon e-mail"),
    );
    expect(button).toBeTruthy();

    act(() => button?.click());
    await settle();

    expect(calls).toContainEqual({
      method: "post",
      url: "/auth/resend-verification",
    });
    expect(host.textContent).toContain(
      "Le lien de vérification a été envoyé à awa@example.com.",
    );
  });

  it("uses the current profile status for an older session", async () => {
    verified = true;
    renderLayout();
    await settle();

    expect(calls).toContainEqual({ method: "get", url: "/auth/me" });
    expect(host.textContent).not.toContain(
      "Votre adresse e-mail n’est pas vérifiée",
    );
  });
});
