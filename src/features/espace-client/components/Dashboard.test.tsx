// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import type { InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../../lib/api";
import type { ApiFicheSummary } from "../../../types";
import Dashboard from "./Dashboard";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const fiche: ApiFicheSummary = {
  id: 12,
  slug: "chez-awa",
  prenom: "Awa",
  nom: "Ndiaye",
  fonction: "Coiffeuse",
  entreprise: "Salon Awa",
  photo: null,
  logo: null,
  telephone: null,
  whatsapp: null,
  email: null,
  site: null,
  adresse: null,
  googlePlaceId: null,
  premierBouton: "WHATSAPP",
  messageWhatsapp: null,
  statut: "ACTIVE",
  enLigneSeule: true,
  scansTotal: 0,
  userId: 1,
  secteur: "BEAUTE",
  presentation: null,
  rdvLabel: null,
  rdvUrl: null,
  enteteDisposition: "PORTRAIT",
  enteteTaille: "M",
  enteteTheme: "OR",
  enteteCouverture: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

let calls: { method?: string; url?: string }[] = [];
let dashboardFiches: ApiFicheSummary[] = [];
let root: Root;
let host: HTMLDivElement;
let client: QueryClient;
const originalAdapter = api.defaults.adapter;

beforeEach(() => {
  calls = [];
  dashboardFiches = [fiche];
  client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    calls.push({ method: config.method, url: config.url });
    const data =
      config.method === "get" ? dashboardFiches : { ok: true };
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
  client.clear();
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

const click = (button: HTMLButtonElement | null) =>
  act(() => button?.click());

describe("Dashboard deletion", () => {
  it("deletes the fiche without also sending a draft mutation", async () => {
    act(() =>
      root.render(
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <Dashboard user={{ name: "Awa Ndiaye" }} onEdit={() => {}} onView={() => {}} />
          </MemoryRouter>
        </QueryClientProvider>,
      ),
    );
    await settle();

    click(host.querySelector<HTMLButtonElement>(".db-delete-btn"));
    click(
      [...host.querySelectorAll<HTMLButtonElement>("button")].find(button =>
        button.textContent?.includes("Supprimer définitivement"),
      ) ?? null,
    );
    await settle();

    expect(calls.filter(call => call.method === "delete")).toEqual([
      { method: "delete", url: "/fiches/12" },
    ]);
    expect(calls.some(call => call.url?.includes("draft-fiche"))).toBe(false);
  });

  it("shows expiry KPI counts and links to matching subscription filters", async () => {
    const endsAt = new Date(Date.now() + 6 * 86_400_000).toISOString();
    const startsAt = new Date(Date.now() - 85 * 86_400_000).toISOString();
    const expiredAt = new Date(Date.now() - 5 * 86_400_000).toISOString();
    dashboardFiches = [
      {
        ...fiche,
        id: 13,
        subscriptions: [
          {
            startsAt,
            endsAt,
            status: "ACTIVE",
            plan: { type: "PRO" },
          },
        ],
      },
      {
        ...fiche,
        id: 14,
        latestSubscription: {
          startsAt,
          endsAt: expiredAt,
          status: "EXPIRED",
          plan: { type: "SIGNATURE" },
        },
      },
    ];
    act(() =>
      root.render(
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <Dashboard
              user={{ name: "Awa Ndiaye" }}
              onEdit={() => {}}
              onView={() => {}}
            />
          </MemoryRouter>
        </QueryClientProvider>,
      ),
    );
    await settle();

    expect(host.textContent).not.toContain("Dernière modification");
    const kpis = [
      ...host.querySelectorAll<HTMLAnchorElement>(".db-kpi-link"),
    ];
    expect(kpis.map(link => link.getAttribute("href"))).toEqual([
      "/espace-client/abonnements?expiry=expired",
      "/espace-client/abonnements?expiry=expiring",
    ]);
    expect(kpis[0].querySelector("b")?.textContent).toBe("1");
    expect(kpis[1].querySelector("b")?.textContent).toBe("1");
  });
});
