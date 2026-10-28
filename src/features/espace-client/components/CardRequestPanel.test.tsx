// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../../lib/api";
import { CardRequestPanel } from "./CardRequestPanel";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/* Demande de carte : le client voit le modèle (recto / verso) défini par l'administration. */
const modele = {
  id: 3,
  tier: "signature",
  nom: "Signature or",
  rectoUrl: "https://cdn.exemple.sn/r.png",
  versoUrl: "https://cdn.exemple.sn/v.png",
};
const carte = {
  id: 9,
  statut: "a_imprimer",
  tier: "signature",
  montantFcfa: 15000,
  adresseLivraison: "Dakar",
  telephoneLivraison: "770000000",
};

describe("CardRequestPanel : modèle de carte", () => {
  const original = api.defaults.adapter;
  let payload: Record<string, unknown>;
  let posts: Record<string, unknown>[];
  let root: Root;
  let host: HTMLDivElement;

  beforeEach(() => {
    payload = { carte: null, modele };
    posts = [];
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    api.defaults.adapter = async config => {
      const mk = (data: unknown) => ({
        status: 200,
        data,
        statusText: "",
        headers: {},
        config,
      });
      if (config.method === "post") {
        posts.push(JSON.parse(config.data));
        return mk({ carte });
      }
      return mk(payload);
    };
  });
  afterEach(() => {
    api.defaults.adapter = original;
    act(() => root.unmount());
    host.remove();
  });

  const settle = async () => {
    for (let i = 0; i < 6; i++)
      await act(async () => void (await new Promise(r => setTimeout(r, 0))));
  };
  const open = async (formula = "pro") => {
    await act(async () =>
      root.render(
        h(
          QueryClientProvider,
          {
            client: new QueryClient({
              defaultOptions: { queries: { retry: false } },
            }),
          },
          h(CardRequestPanel, { ficheId: 1, formula }),
        ),
      ),
    );
    await settle();
  };
  const img = () => host.querySelector<HTMLImageElement>("img");
  const faceButton = (label: string) =>
    [...host.querySelectorAll("button")].find(
      b => b.textContent === label,
    ) as HTMLButtonElement;

  it("affiche le recto du modèle défini par l'administration, à la place de l'aperçu par défaut", async () => {
    await open();
    expect(img()?.src).toBe("https://cdn.exemple.sn/r.png");
    expect(img()?.alt).toBe("Carte Signature or — recto");
    expect(host.querySelector('[aria-label^="Aperçu de carte"]')).toBeNull();
  });

  it("le libellé et le prix suivent la formule du modèle (celle que le serveur facture), pas la prop", async () => {
    await open("pro"); // la fiche se dit « pro », le serveur renvoie le modèle Signature
    expect(host.textContent).toContain("Votre carte Signature");
    expect(host.textContent).toContain("15");
  });

  it("bascule entre recto et verso", async () => {
    await open();
    expect(faceButton("Recto").getAttribute("aria-pressed")).toBe("true");
    await act(async () => faceButton("Verso").click());
    expect(img()?.src).toBe("https://cdn.exemple.sn/v.png");
    expect(faceButton("Verso").getAttribute("aria-pressed")).toBe("true");
    await act(async () => faceButton("Recto").click());
    expect(img()?.src).toBe("https://cdn.exemple.sn/r.png");
  });

  it("sans modèle défini, garde l'aperçu par défaut de la formule", async () => {
    payload = { carte: null, modele: null };
    await open("pro");
    expect(img()).toBeNull();
    expect(
      host.querySelector('[aria-label="Aperçu de carte Pro"]'),
    ).toBeTruthy();
  });

  it("réponse d'un ancien serveur (sans champ modele) : aperçu par défaut", async () => {
    payload = { carte: null };
    await open("signature");
    expect(
      host.querySelector('[aria-label="Aperçu de carte Signature"]'),
    ).toBeTruthy();
  });

  it("une adresse d'image cassée affiche « Image indisponible » au lieu d'un cadre vide", async () => {
    await open();
    await act(async () => void img()!.dispatchEvent(new Event("error")));
    expect(host.textContent).toContain("Image indisponible");
    expect(img()).toBeNull();
    await act(async () => faceButton("Verso").click()); // l'autre face reste affichable
    expect(img()?.src).toBe("https://cdn.exemple.sn/v.png");
  });

  it("après l'envoi d'une demande, le modèle reste affiché et le statut apparaît", async () => {
    await open();
    const set = (el: HTMLElement, v: string) => {
      const proto =
        el instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(el, v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };
    await act(async () => {
      set(host.querySelector("textarea")!, "Dakar, Plateau");
      set(host.querySelector('input[type="tel"]')!, "770000000");
    });
    await act(async () =>
      host
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
    await settle();
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      adresseLivraison: "Dakar, Plateau",
      telephoneLivraison: "770000000",
    });
    expect(host.textContent).toContain("En attente de production");
    expect(img()?.src).toBe("https://cdn.exemple.sn/r.png"); // le modèle n'a pas disparu
  });
});
