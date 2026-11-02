// @vitest-environment jsdom
import { AxiosError } from "axios";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../../lib/api";
import { TAB_TYPES } from "../../../lib/plans";
import { FICHES } from "../../../test/fixtures/fiches";
import type { SectionStickerAdmin } from "../../../types/admin";
import { FichePreviewPanel, SectionStickersTab } from "./SectionStickers";
import { ToastProvider } from "./ui";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/*
  Stickers par section, côté administration : traiter les demandes de devis des clients, activer la section,
  aperçu de ce que verra la personne qui scanne, et mini téléphone dans la fiche détail.
*/
const fixture = FICHES.find(f => f.slug === "le-sunset")!; // Signature, restaurant
const demande = (
  over: Partial<SectionStickerAdmin> = {},
): SectionStickerAdmin => ({
  id: 1,
  section: "menu",
  quantite: 20,
  message: null,
  statut: "demande",
  createdAt: "2026-10-29T10:00:00Z",
  activatedAt: null,
  updatedAt: "2026-10-29T10:00:00Z",
  fiche: {
    id: 12,
    slug: "le-sunset",
    prenom: "Rose",
    nom: "Ndiaye",
    entreprise: "Le Sunset",
  },
  client: { id: 7, nom: "Rose", email: "rose@exemple.sn" },
  ...over,
});

describe("stickers par section (administration)", () => {
  const original = api.defaults.adapter;
  let store: SectionStickerAdmin[];
  let calls: {
    method?: string;
    url?: string;
    params?: Record<string, unknown>;
    body?: Record<string, unknown>;
  }[];
  let failFiche = false;
  let failPatch: string | null = null;
  let failList = false;
  let root: Root;
  let host: HTMLDivElement;

  beforeEach(() => {
    store = [];
    calls = [];
    failFiche = false;
    failPatch = null;
    failList = false;
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    api.defaults.adapter = async config => {
      const url = (config.url ?? "").replace(/^\//, "");
      const body =
        typeof config.data === "string" ? JSON.parse(config.data) : undefined;
      calls.push({ method: config.method, url, params: config.params, body });
      const mk = (data: unknown, status = 200) => ({
        status,
        data,
        statusText: "",
        headers: {},
        config,
      });
      const fail = (message: string, status: number) =>
        new AxiosError(
          "fail",
          String(status),
          config,
          undefined,
          mk({ error: { message } }, status),
        );
      if (
        url === "admin/production/section-stickers" &&
        config.method === "get"
      ) {
        if (failList) throw fail("Liste indisponible", 500);
        const id = config.params?.ficheId as number | undefined;
        return mk({
          demandes: id ? store.filter(d => d.fiche.id === id) : store,
        });
      }
      if (
        /^admin\/production\/section-stickers\/\d+$/.test(url) &&
        config.method === "patch"
      ) {
        if (failPatch) throw fail(failPatch, 409);
        const id = Number(url.split("/").pop());
        store = store.map(d =>
          d.id === id
            ? { ...d, statut: body!.statut as SectionStickerAdmin["statut"] }
            : d,
        );
        return mk({ demande: store.find(d => d.id === id) });
      }
      if (url === "fiches/12" && config.method === "get") {
        if (failFiche) throw fail("Fiche indisponible", 500);
        return mk({
          fiche: {
            ...fixture,
            id: 12,
            whatsapp: "",
            formule: fixture.formule.toUpperCase(),
            statut: fixture.statut.toUpperCase(),
            stickerSections: [],
          },
        });
      }
      return mk({});
    };
  });
  afterEach(() => {
    api.defaults.adapter = original;
    act(() => root.unmount());
    host.remove();
  });

  const settle = async () => {
    for (let i = 0; i < 8; i++)
      await act(async () => void (await new Promise(r => setTimeout(r, 0))));
  };
  const wrap = (el: ReturnType<typeof h>) =>
    h(ToastProvider, null, h(MemoryRouter, null, el));
  const mount = async (el: ReturnType<typeof h>) => {
    await act(async () => root.render(wrap(el)));
    await settle();
  };
  const btn = (scope: ParentNode, label: string) =>
    [...scope.querySelectorAll("button")].find(
      b => b.textContent?.trim() === label,
    ) as HTMLButtonElement | undefined;
  const click = async (el: HTMLElement) => {
    await act(async () => el.click());
    await settle();
  };
  const choose = async (el: HTMLSelectElement, value: string) => {
    await act(async () => {
      el.value = value;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await settle();
  };
  const dialog = () =>
    document.body.querySelector<HTMLElement>('[role="dialog"]');
  const patches = () => calls.filter(c => c.method === "patch");

  describe("onglet « Stickers par section » (Production)", () => {
    const all = () => [
      demande({ id: 1, statut: "demande" }),
      demande({ id: 2, statut: "active", section: "horaires", quantite: 5 }),
      demande({ id: 3, statut: "desactivee", section: "avis" }),
      demande({ id: 4, statut: "refusee", section: "galerie" }),
    ];
    const tab = (
      extra: Partial<Parameters<typeof SectionStickersTab>[0]> = {},
    ) =>
      h(SectionStickersTab, {
        data: all(),
        error: null,
        onChanged: () => {},
        ...extra,
      });

    it("n'affiche d'abord que les demandes À TRAITER, avec fiche, section, nombre et client", async () => {
      await mount(tab());
      const rows = host.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(1);
      const text = rows[0].textContent ?? "";
      expect(text).toContain("Le Sunset");
      expect(text).toContain("/le-sunset");
      expect(text).toContain("Menu");
      expect(text).toContain("20");
      expect(text).toContain("rose@exemple.sn");
      expect(text).toContain("À traiter");
      expect(rows[0].querySelector("a")?.getAttribute("href")).toBe(
        "/admin/fiches/12",
      );
    });

    it("les filtres montrent les demandes activées, puis toutes", async () => {
      await mount(tab());
      const filter = host.querySelector<HTMLSelectElement>(
        'select[aria-label="Filtrer les demandes par statut"]',
      )!;
      await choose(filter, "active");
      expect(host.querySelectorAll("tbody tr")).toHaveLength(1);
      expect(host.textContent).toContain("Activée");
      await choose(filter, "all");
      expect(host.querySelectorAll("tbody tr")).toHaveLength(4);
      await choose(filter, "refusee");
      expect(host.querySelectorAll("tbody tr")).toHaveLength(1);
      expect(host.textContent).toContain("Refusée");
    });

    it("propose les bonnes décisions selon l'état de la demande", async () => {
      await mount(tab());
      await choose(
        host.querySelector<HTMLSelectElement>(
          'select[aria-label="Filtrer les demandes par statut"]',
        )!,
        "all",
      );
      const labels = (i: number) =>
        [
          ...host.querySelectorAll("tbody tr")[i].querySelectorAll("button"),
        ].map(b => b.textContent);
      expect(labels(0)).toEqual(["Aperçu", "Activer la section", "Refuser"]); // à traiter
      expect(labels(1)).toEqual(["Aperçu", "Désactiver"]); // activée
      expect(labels(2)).toEqual(["Aperçu", "Réactiver"]); // désactivée
      expect(labels(3)).toEqual(["Aperçu"]); // refusée : plus rien à décider
    });

    it("« Activer la section » envoie la décision, prévient l'administrateur et recharge", async () => {
      store = all();
      const onChanged = vi.fn();
      await mount(tab({ onChanged }));
      await click(btn(host, "Activer la section")!);
      expect(patches()).toHaveLength(1);
      expect(patches()[0]).toMatchObject({
        url: "admin/production/section-stickers/1",
        body: { statut: "active" },
      });
      expect(document.body.textContent).toContain(
        "le client voit maintenant son lien et son QR",
      );
      expect(onChanged).toHaveBeenCalledTimes(1);
    });

    it("refuser et désactiver envoient la bonne décision", async () => {
      store = all();
      await mount(tab());
      await click(btn(host, "Refuser")!);
      expect(patches()[0].body).toEqual({ statut: "refusee" });
      await choose(
        host.querySelector<HTMLSelectElement>(
          'select[aria-label="Filtrer les demandes par statut"]',
        )!,
        "all",
      );
      await click(
        [
          ...host.querySelectorAll("tbody tr")[1].querySelectorAll("button"),
        ].find(b => b.textContent === "Désactiver")!,
      );
      expect(patches()[1]).toMatchObject({
        url: "admin/production/section-stickers/2",
        body: { statut: "desactivee" },
      });
    });

    it("une décision refusée par le serveur affiche l'erreur et ne recharge pas", async () => {
      store = all();
      failPatch =
        "Une autre demande est déjà ouverte pour cette section de la fiche.";
      const onChanged = vi.fn();
      await mount(tab({ onChanged }));
      await click(btn(host, "Activer la section")!);
      expect(document.body.textContent).toContain(
        "Une autre demande est déjà ouverte",
      );
      expect(onChanged).not.toHaveBeenCalled();
    });

    it("« Aperçu » ouvre ce que verra la personne qui scanne, même si la section n'est pas activée", async () => {
      await mount(tab());
      await click(btn(host, "Aperçu")!);
      expect(dialog()).toBeTruthy();
      expect(dialog()!.getAttribute("aria-label")).toContain("Menu");
      expect(calls.some(c => c.url === "fiches/12")).toBe(true); // la fiche est lue avec la session de l'administrateur
      expect(dialog()!.querySelector(".fiche-preview-device")).toBeTruthy(); // mini téléphone
      expect(dialog()!.querySelector(".ss-head")).toBeTruthy(); // en-tête logo + nom de la page sticker
      expect(dialog()!.textContent).toContain("Voir la fiche complète"); // bouton vers la fiche complète
      expect(dialog()!.querySelector(".f-hero")).toBeNull(); // pas la fiche entière
      await click(
        btn(dialog()!, "Fermer") ??
          dialog()!.querySelector<HTMLElement>("button")!,
      );
    });

    it("aucune demande à traiter : message clair", async () => {
      await mount(tab({ data: [demande({ statut: "active" })] }));
      expect(host.textContent).toContain("Aucune demande à traiter");
    });

    it("erreur de chargement : message et nouvel essai ; chargement en cours sans erreur", async () => {
      const onChanged = vi.fn();
      await mount(tab({ data: null, error: "Liste indisponible", onChanged }));
      expect(host.textContent).toContain("Liste indisponible");
      await click(btn(host, "Réessayer")!);
      expect(onChanged).toHaveBeenCalled();
      await mount(tab({ data: null, error: null }));
      expect(host.textContent).not.toContain("Liste indisponible");
      expect(host.querySelector("table")).toBeNull();
    });
  });

  describe("fiche détail (/admin/fiches/:id) : mini téléphone et demandes de la fiche", () => {
    const panel = () =>
      h(FichePreviewPanel, { ficheId: 12, whatsapp: fixture.whatsapp });
    beforeEach(() => {
      store = [
        demande({ id: 1, statut: "demande" }),
        demande({
          id: 9,
          statut: "demande",
          section: "menu",
          fiche: {
            id: 99,
            slug: "autre",
            prenom: "A",
            nom: "B",
            entreprise: null,
          },
        }),
      ];
    });

    it("liste les demandes de CETTE fiche et affiche la fiche complète dans le mini téléphone", async () => {
      await mount(panel());
      expect(
        calls.find(c => c.url === "admin/production/section-stickers")?.params,
      ).toMatchObject({ ficheId: 12 });
      expect(host.textContent).toContain("Menu");
      expect(host.textContent).toContain("20 stickers");
      expect(host.textContent).not.toContain("/autre");
      expect(host.querySelector(".fiche-preview-device")).toBeTruthy();
      expect(host.querySelector(".f-hero")).toBeTruthy(); // fiche complète par défaut
      expect(
        [...host.querySelectorAll(".f-acts a")].map(link => link.textContent),
      ).toEqual(["WhatsApp", "Appeler", "E-mail"]);
      expect(host.querySelector(".f-acts a.primary")?.textContent).toBe("WhatsApp");
    });

    it("« Aperçu » montre la section dans le téléphone, puis on revient à la fiche", async () => {
      await mount(panel());
      await click(btn(host, "Aperçu")!);
      expect(host.querySelector(".ss-head")).toBeTruthy();
      expect(host.querySelector(".f-hero")).toBeNull();
      expect(host.textContent).toContain(
        `Aperçu de la section « ${TAB_TYPES.menu.label} »`,
      );
      await click(btn(host, "Revenir à la fiche")!);
      expect(host.querySelector(".f-hero")).toBeTruthy();
      expect(host.querySelector(".ss-head")).toBeNull();
    });

    it("« Voir la fiche » (même bouton) ramène aussi à la fiche complète", async () => {
      await mount(panel());
      await click(btn(host, "Aperçu")!);
      await click(btn(host, "Voir la fiche")!);
      expect(host.querySelector(".f-hero")).toBeTruthy();
    });

    it("activer depuis la fiche envoie la décision et met la liste à jour", async () => {
      await mount(panel());
      await click(btn(host, "Activer la section")!);
      expect(patches()[0]).toMatchObject({
        url: "admin/production/section-stickers/1",
        body: { statut: "active" },
      });
      expect(host.textContent).toContain("Activée");
      expect(btn(host, "Activer la section")).toBeUndefined();
      expect(btn(host, "Désactiver")).toBeTruthy();
    });

    it("sans demande : message, mais le mini téléphone reste affiché", async () => {
      store = [];
      await mount(panel());
      expect(host.textContent).toContain(
        "Aucune demande de stickers pour cette fiche",
      );
      expect(host.querySelector(".f-hero")).toBeTruthy();
    });

    it("fiche illisible : erreur dans la zone du téléphone, la liste des demandes reste utilisable", async () => {
      failFiche = true;
      await mount(panel());
      expect(host.textContent).toContain("Fiche indisponible. Réessayez.");
      expect(host.querySelector(".fiche-preview-device")).toBeNull();
      expect(btn(host, "Activer la section")).toBeTruthy();
    });

    it("liste des demandes illisible : erreur, mais le mini téléphone s'affiche quand même", async () => {
      failList = true;
      await mount(panel());
      expect(host.textContent).toContain(
        "Impossible de charger les demandes de stickers. Réessayez.",
      );
      expect(host.querySelector(".f-hero")).toBeTruthy();
    });
  });
});
