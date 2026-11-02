// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import type { InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../../lib/api";
import PaymentsPage from "./PaymentsPage";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const payment = {
  id: 99,
  statut: "succeeded",
  formule: "pro",
  formuleNom: "Pro",
  fournisseur: "simulation",
  montantFcfa: 27000,
  devise: "XOF",
  reference: "PAY-99",
  motifEchec: null,
  createdAt: "2026-11-01T10:00:00.000Z",
  payeLe: "2026-11-01T10:00:00.000Z",
  dureeMois: 12,
  fiche: {
    id: 10,
    slug: "salon-awa",
    nom: "Awa Ndiaye",
    entreprise: "Salon Awa",
  },
};

describe("PaymentsPage", () => {
  const originalAdapter = api.defaults.adapter;
  let root: Root;
  let host: HTMLDivElement;
  let client: QueryClient;
  let requests: { url?: string; params?: unknown }[];

  beforeEach(() => {
    requests = [];
    client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      requests.push({
        url: config.url,
        params: config.params,
      });
      return {
        status: 200,
        data: { items: [payment], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } },
        statusText: "",
        headers: {},
        config,
      };
    };
  });

  afterEach(() => {
    act(() => root.unmount());
    client.clear();
    host.remove();
    api.defaults.adapter = originalAdapter;
  });

  const render = async () => {
    act(() => {
      root.render(
        h(
          QueryClientProvider,
          { client },
          h(
            MemoryRouter,
            null,
            h(
              Routes,
              null,
              h(
                Route,
                { element: h(Outlet, { context: { user: { name: "Awa Ndiaye", email: "awa@example.sn" } } }) },
                h(Route, { path: "/", element: h(PaymentsPage) }),
              ),
            ),
          ),
        ),
      );
    });
    for (let i = 0; i < 4; i++) {
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    }
  };

  it("loads the current client's history and provides a printable receipt", async () => {
    await render();

    expect(requests[0]).toMatchObject({
      url: "/subscription/payments",
      params: { page: 1, limit: 20 },
    });
    expect(host.textContent).toContain("Mes paiements");
    expect(host.textContent).toContain("27 000");
    expect(host.querySelector<HTMLButtonElement>("button[title]")?.disabled).toBe(
      true,
    );

    const receiptButton = [...host.querySelectorAll("button")].find(button =>
      button.textContent?.trim() === "Reçu",
    );
    act(() => receiptButton?.click());

    expect(host.querySelector('[role="dialog"]')?.textContent).toContain(
      "Reçu de paiement",
    );
    expect(host.textContent).toContain("Ce document n’est pas une facture.");
  });

  it("does not allow receipts for payments that are not confirmed", async () => {
    api.defaults.adapter = async (config: InternalAxiosRequestConfig) => ({
      status: 200,
      data: {
        items: [{ ...payment, statut: "pending" }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
      statusText: "",
      headers: {},
      config,
    });
    await render();

    expect(
      [...host.querySelectorAll<HTMLButtonElement>("button")].find(button =>
        button.textContent?.trim() === "Reçu",
      )?.disabled,
    ).toBe(true);
  });
});
