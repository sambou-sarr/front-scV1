// @vitest-environment jsdom
import type { InternalAxiosRequestConfig } from "axios";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../lib/api";
import { clearSession, saveSession } from "../../lib/session";
import RequireAdmin from "../auth/RequireAdmin";
import AdminLayout from "./layout/AdminLayout";
import AdminNotFound from "./pages/AdminNotFound";
import Billing from "./pages/Billing";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import FicheDetail from "./pages/FicheDetail";
import Fiches from "./pages/Fiches";
import Leads from "./pages/Leads";
import Production from "./pages/Production";
import QrCodes from "./pages/QrCodes";
import Relances from "./pages/Relances";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const fiche = (id: number, slug: string, entreprise: string) => ({
  id,
  slug,
  nom: "Awa Ndiaye",
  entreprise,
  statut: "active",
  formule: "pro",
  expiree: false,
  dateEcheance: "2027-01-15T00:00:00Z",
  scansTotal: 42,
  createdAt: "2026-01-01T00:00:00Z",
  proprietaire: { id: 9, email: "awa@sc.sn", nom: "Awa" },
  demandesSticker: [] as {
    id: number;
    section: string;
    quantite: number;
    createdAt: string;
  }[],
});
const stats = {
  fiches: {
    total: 7,
    suspendues: 2,
    expirees: 1,
    expirentBientot: 3,
    sansProprietaire: 1,
    nouvellesSur30Jours: 5,
  },
  formules: { essentielle: 1, pro: 4, signature: 2 },
  scansTotal: 1234,
  clients: 6,
  demandesSticker: 1,
};
const revenus = {
  encaisse: { ceMois: 50000, moisPrecedent: 40000, evolutionPct: 25 },
  mois: [{ mois: "2026-09", montantFcfa: 50000, nbPaiements: 2 }],
  parFormule: {
    essentielle: { montantFcfa: 0, nbPaiements: 0 },
    pro: { montantFcfa: 0, nbPaiements: 0 },
    signature: { montantFcfa: 0, nbPaiements: 0 },
  },
  aRenouveler: { nb: 3, montantEstimeFcfa: 30000 },
  fichesParSemaine: [{ semaine: "2026-09-21", nb: 2 }],
};
const page = { page: 1, limit: 20, total: 1, totalPages: 1 };
const relance = (id: number, slug: string) => ({
  id,
  slug,
  nom: `Contact ${id}`,
  prenom: `Contact ${id}`,
  entreprise: `Entreprise ${id}`,
  formule: "pro",
  dateEcheance: "2027-01-15",
  joursRestants: 80,
  scansTotal: id,
  telephone: null,
  whatsapp: null,
  email: null,
  proprietaire: null,
});
const billingFiche = {
  id: 12,
  slug: "chez-awa",
  nom: "Awa Ndiaye",
  entreprise: "Chez Awa",
  email: "awa@sc.sn",
};
const deletedBillingFiche = {
  id: null,
  slug: "chez-awa",
  nom: "Awa Ndiaye",
  entreprise: "",
  email: null,
};

let calls: { url?: string; params?: Record<string, unknown> }[] = [];
const original = api.defaults.adapter;
const route = (c: InternalAxiosRequestConfig): unknown => {
  const url = c.url ?? "";
  if (url === "/admin/stats") return stats;
  if (url === "/admin/revenus") return revenus;
  if (url === "/admin/fiches") {
    const params = c.params as Record<string, string> | undefined;
    const row = fiche(12, "chez-awa", "Chez Awa");
    if (params?.sticker === "demande") {
      row.demandesSticker = [
        {
          id: 8,
          section: "menu",
          quantite: 20,
          createdAt: "2026-10-29T10:00:00Z",
        },
        {
          id: 9,
          section: "horaires",
          quantite: 5,
          createdAt: "2026-10-29T11:00:00Z",
        },
      ];
    }
    return { fiches: [row], pagination: page };
  }
  if (url === "/admin/fiches/12")
    return {
      fiche: {
        id: 12,
        slug: "chez-awa",
        nom: "Awa Ndiaye",
        entreprise: "Chez Awa",
        statut: "active",
        compteClientCree: true,
      },
      abonnements: [],
    };
  if (url === "/admin/fiches/13")
    return {
      fiche: {
        id: 13,
        slug: "fiche-libre",
        nom: "Fiche libre",
        statut: "active",
      },
      abonnements: [],
    };
  if (url === "/admin/subscriptions") {
    const params = c.params as Record<string, string> | undefined;
    const currentItem = {
      id: 31,
      formule: "signature",
      statut: "active",
      debut: "2026-10-01T00:00:00.000Z",
      fin: "2027-10-01T00:00:00.000Z",
      montantFcfa: 75000,
      referencePaiement: "PAY-71",
      createdAt: "2026-10-01T00:00:00.000Z",
      fiche: billingFiche,
      paiementId: 71,
    };
    const deletedItem = { ...currentItem, fiche: deletedBillingFiche };
    const items = (
      params?.ficheSupprimee === "oui" ? [deletedItem] : [currentItem]
    ).filter(
      item =>
        !params?.subscriptionId ||
        String(item.id) === String(params.subscriptionId)
    );
    return { items, pagination: { ...page, total: items.length } };
  }
  if (url === "/admin/payments") {
    const params = c.params as Record<string, string> | undefined;
    const currentItem = {
      id: 71,
      formule: "signature",
      statut: "succeeded",
      fournisseur: "wave",
      montantFcfa: 75000,
      devise: "XOF",
      reference: "PAY-71",
      motifEchec: null,
      createdAt: "2026-10-01T00:00:00.000Z",
      payeLe: "2026-10-01T00:00:00.000Z",
      fiche: billingFiche,
      abonnementId: 31,
    };
    const deletedItem = { ...currentItem, fiche: deletedBillingFiche };
    const items = (
      params?.ficheSupprimee === "oui" ? [deletedItem] : [currentItem]
    )
      .filter(
        item =>
          !params?.paymentId || String(item.id) === String(params.paymentId)
      )
      .filter(item => !params?.statut || item.statut === params.statut);
    return { items, pagination: { ...page, total: items.length } };
  }
  if (url === "/admin/users")
    return {
      users: [
        {
          id: 9,
          email: "awa@sc.sn",
          nom: "Awa",
          role: "client",
          emailVerifie: true,
          createdAt: "2026-01-01T00:00:00Z",
          nbFiches: 2,
        },
      ],
      pagination: page,
    };
  if (url === "/admin/leads")
    return {
      items: [
        {
          id: 42,
          intent: "devis",
          intentLabel: "Devis — Création de contenu",
          products: ["Vidéo de présentation"],
          sector: "restaurant",
          name: "Awa Ndiaye",
          role: null,
          company: "Chez Awa",
          phone: "+221771234567",
          email: "awa@example.sn",
          city: "Saly",
          prefer: "WhatsApp",
          message: "Je souhaite un devis vidéo.",
          consentMarketing: false,
          consentText: null,
          consentAt: "2026-10-26T16:00:00.000Z",
          source: "site",
          page: "/contact",
          pole: "contenu",
          services: ["video"],
          production: "reel",
          delai: "mois",
          profil: null,
          projet: null,
          design: null,
          status: "NEW",
          createdAt: "2026-10-26T16:00:00.000Z",
          updatedAt: "2026-10-26T16:00:00.000Z",
        },
      ],
      pagination: page,
    };
  if (url === "/admin/leads/42")
    return { lead: { id: 42, status: "CONTACTED" } };
  if (url === "/admin/production/summary")
    return {
      cartesAImprimer: 0,
      stickersAParametrer: { fonction: 0, telephone: 0 },
      qrSansCible: 1,
      scansQr: 0,
    };
  if (url === "/admin/production/cartes") return { cartes: [] };
  if (url === "/admin/production/stickers") return { stickers: [] };
  if (url === "/admin/production/qr")
    return {
      qr: [
        {
          code: "qr-code-1",
          url: "https://sc.example/q/qr-code-1",
          label: "Menu du restaurant",
          targetUrl: null,
          actif: true,
          scans: 0,
          lastScanAt: null,
          sticker: null,
        },
      ],
    };
  if (url === "/admin/production/section-stickers") return { demandes: [] };
  if (url === "/admin/qrcodes/styles") return { styles: [] };
  if (url === "/admin/relances") {
    const type = (c.params as Record<string, string> | undefined)?.type;
    const items =
      type === "bientot"
        ? [relance(21, "renouvellement"), relance(24, "mixte")]
        : type === "expirees"
          ? [relance(22, "expiree")]
          : [relance(23, "montee"), relance(24, "mixte")];
    return { total: items.length, items };
  }
  throw new Error(`route non simulée : ${url}`);
};

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  localStorage.clear();
  calls = [];
  saveSession({
    token: "T",
    user: { name: "Root", email: "root@sc.sn", role: "ADMIN" },
  });
  api.defaults.adapter = async config => {
    calls.push({
      url: config.url,
      params: config.params as Record<string, unknown>,
    });
    const data = route(config);
    return { status: 200, data, statusText: "", headers: {}, config };
  };
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  clearSession();
  api.defaults.adapter = original;
});

const settle = async () => {
  for (let i = 0; i < 4; i++)
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });
};
const Where = () => {
  const l = useLocation();
  return <i data-testid="where">{l.pathname + l.search}</i>;
};
const app = (path: string) => (
  <MemoryRouter initialEntries={[path]}>
    <Where />
    <Routes>
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="fiches" element={<Fiches />} />
        <Route path="fiches/:id" element={<FicheDetail />} />
        <Route path="abonnements" element={<Billing />} />
        <Route path="clients" element={<Clients />} />
        <Route path="demandes" element={<Leads />} />
        <Route path="production" element={<Production />} />
        <Route path="qrcodes" element={<QrCodes />} />
        <Route path="relances" element={<Relances />} />
        <Route path="*" element={<AdminNotFound />} />
      </Route>
    </Routes>
  </MemoryRouter>
);
const where = () => host.querySelector("[data-testid=where]")!.textContent;
const click = (el: Element | null | undefined) =>
  act(() => void (el as HTMLElement).click());
const byText = (sel: string, text: string) =>
  [...host.querySelectorAll(sel)].find(e => e.textContent?.includes(text));

describe("pages du back-office", () => {
  it("affiche le menu et le tableau de bord (statistiques + revenus)", async () => {
    act(() => root.render(app("/admin")));
    await settle();
    expect(host.textContent).toContain("Tableau de bord");
    expect(host.textContent).toContain("Back-office");
    expect(host.textContent).toContain("Root");
    expect(host.textContent).toContain("Encaissé ce mois");
    expect(host.textContent).toMatch(/50\s000\sF/); // espace (insécable) du format fr-FR
    for (const l of [
      "Fiches",
      "Abonnements & paiements",
      "Clients",
      "Demandes",
      "Relances",
      "Production",
      "QR codes",
      "Formules",
    ])
      expect(byText("aside nav a", l), l).toBeTruthy();
    expect(byText("aside nav a", "Formules")?.getAttribute("href")).toBe(
      "/admin/formules"
    );
  });

  it("un indicateur du tableau de bord ouvre la liste de fiches filtrée", async () => {
    act(() => root.render(app("/admin")));
    await settle();
    click(byText("button.kpi", "Suspendues"));
    await settle();
    expect(where()).toBe("/admin/fiches?statut=suspendue");
    expect(
      calls.filter(c => c.url === "/admin/fiches").at(-1)?.params
    ).toMatchObject({ statut: "suspendue" });
  });

  it("le KPI des stickers ouvre les fiches avec demandes en attente", async () => {
    act(() => root.render(app("/admin")));
    await settle();
    click(byText("button.kpi", "Demandes de stickers"));
    await settle();
    expect(where()).toBe("/admin/fiches?sticker=demande");
    expect(
      calls.filter(c => c.url === "/admin/fiches").at(-1)?.params
    ).toMatchObject({
      sticker: "demande",
    });
    expect(host.textContent).not.toContain("Menu");
    click(byText("button.adm-btn-red", "Voir sections"));
    await settle();
    expect(host.querySelector('[role="dialog"]')?.textContent).toContain(
      "Menu"
    );
    expect(host.querySelector('[role="dialog"]')?.textContent).toContain(
      "Horaires"
    );
    expect(host.querySelector('[role="dialog"]')?.textContent).toContain(
      "20 stickers"
    );
    click(byText('[role="dialog"] button', "Ouvrir la fiche"));
    await settle();
    expect(where()).toBe("/admin/fiches/12");
  });

  it("permet de filtrer les demandes de stickers depuis la page Fiches", async () => {
    act(() => root.render(app("/admin/fiches")));
    await settle();
    const filter = host.querySelector(
      'select[aria-label="Demandes de stickers"]'
    ) as HTMLSelectElement;
    act(() => {
      filter.value = "demande";
      filter.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await settle();
    expect(
      calls.filter(c => c.url === "/admin/fiches").at(-1)?.params
    ).toMatchObject({ sticker: "demande" });
    expect(host.textContent).toContain("Voir sections");
  });

  it("cliquer une ligne de la liste ouvre le détail de la fiche", async () => {
    act(() => root.render(app("/admin/fiches")));
    await settle();
    expect(host.textContent).toContain("Chez Awa");
    click(host.querySelector("tbody tr"));
    await settle();
    expect(where()).toBe("/admin/fiches/12");
    expect(host.textContent).toContain("Abonnements");
    expect(calls.some(c => c.url === "/admin/fiches/12")).toBe(true);
  });

  it("le détail ne permet plus de changer le propriétaire ni de gérer des codes carte", async () => {
    act(() => root.render(app("/admin/fiches/12")));
    await settle();
    expect(host.textContent).not.toContain("Accès client");
    expect(host.textContent).not.toContain("Propriétaire & carte");
    expect(host.textContent).not.toContain("Modifier l’adresse");
    expect(host.textContent).not.toContain("Code de la carte");
    expect(host.textContent).not.toContain("Propriétaire");
    expect(host.textContent).not.toContain("Retirer");
  });

  it("un slug reste modifiable avant la création du compte client", async () => {
    act(() => root.render(app("/admin/fiches/13")));
    await settle();
    expect(host.textContent).toContain("Modifier l’adresse");
  });

  it("un client ouvre la liste de ses fiches (?userId=)", async () => {
    act(() => root.render(app("/admin/clients")));
    await settle();
    click(host.querySelector("tbody tr"));
    await settle();
    expect(where()).toBe("/admin/fiches?userId=9");
    expect(
      calls.filter(c => c.url === "/admin/fiches").at(-1)?.params
    ).toMatchObject({ userId: "9" });
    expect(host.textContent).toContain("Fiches d’un client");
  });

  it("ouvre le paiement associé à un abonnement et filtre la liste", async () => {
    act(() => root.render(app("/admin/abonnements")));
    await settle();
    expect(host.textContent).toContain("Abonnements & paiements");
    expect(host.textContent).toContain("Voir paiement");

    click(byText("button.adm-btn", "Voir paiement"));
    await settle();

    expect(where()).toBe("/admin/abonnements?view=payments&paymentId=71");
    expect(host.textContent).toContain("PAY-71");
    expect(
      calls.filter(call => call.url === "/admin/payments").at(-1)?.params
    ).toMatchObject({ paymentId: 71 });

    const status = host.querySelector<HTMLSelectElement>(
      'select[aria-label="Filtrer par statut"]'
    )!;
    act(() => {
      status.value = "succeeded";
      status.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await settle();
    expect(
      calls.filter(call => call.url === "/admin/payments").at(-1)?.params
    ).toMatchObject({ statut: "succeeded", paymentId: 71 });

    click(byText("button.link", "Abonnement #31"));
    await settle();
    expect(where()).toBe("/admin/abonnements?subscriptionId=31");
    expect(
      calls.filter(call => call.url === "/admin/subscriptions").at(-1)?.params
    ).toMatchObject({ subscriptionId: 31 });
  });

  it("filtre les paiements des fiches supprimées et les identifie", async () => {
    act(() => root.render(app("/admin/abonnements?view=payments")));
    await settle();

    const ficheFilter = host.querySelector<HTMLSelectElement>(
      'select[aria-label="Filtrer par état de la fiche"]'
    )!;
    act(() => {
      ficheFilter.value = "oui";
      ficheFilter.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await settle();

    expect(
      calls.filter(call => call.url === "/admin/payments").at(-1)?.params
    ).toMatchObject({ ficheSupprimee: "oui" });
    expect(host.textContent).toContain("Fiche supprimée");
    expect(host.textContent).toContain("Awa Ndiaye");
  });

  it("l’administration affiche les demandes de contact et leurs coordonnées", async () => {
    act(() => root.render(app("/admin/demandes")));
    await settle();
    expect(host.textContent).toContain("Demandes");
    expect(host.textContent).toContain("Awa Ndiaye");
    expect(host.textContent).toContain("Vidéo de présentation");
    expect(host.textContent).toContain("+221771234567");
    expect(
      host.querySelector('select[aria-label="Statut de la demande 42"]')
    ).toBeTruthy();
    click(byText("summary", "Voir le message"));
    expect(host.textContent).toContain("Je souhaite un devis vidéo.");
  });

  it("un identifiant de fiche invalide ou une adresse inconnue donnent « Page introuvable » dans le cadre", async () => {
    act(() => root.render(app("/admin/fiches/abc")));
    await settle();
    expect(host.textContent).toContain("Page introuvable");
    expect(host.textContent).toContain("Tableau de bord"); // le menu reste affiché
    act(() => root.render(app("/admin/inconnue")));
    await settle();
    expect(host.textContent).toContain("Page introuvable");
  });

  it("affiche toutes les relances par défaut sans doublonner les fiches", async () => {
    act(() => root.render(app("/admin/relances")));
    await settle();
    expect(host.textContent).toContain("Toutes (4)");
    expect(host.textContent).toContain("renouvellement");
    expect(host.textContent).toContain("expiree");
    expect(host.textContent).toContain("montee");
    expect(host.querySelectorAll("tbody tr")).toHaveLength(4);
    expect(host.querySelector(".adm-chip.on")?.textContent).toContain("Toutes");
    expect(calls.filter(c => c.url === "/admin/relances")).toHaveLength(3);
    click(byText("button.adm-chip", "Expirées"));
    expect(host.querySelectorAll("tbody tr")).toHaveLength(1);
    expect(host.textContent).toContain("Entreprise 22");
  });

  it("ouvre les QR codes depuis la production avec le lien dynamique prérempli", async () => {
    act(() => root.render(app("/admin/production")));
    await settle();
    click(byText("button[role=tab]", "QR dynamiques"));
    expect(host.textContent).toContain("Menu du restaurant");

    click(byText("a", "Générer un QR code"));
    await settle();

    expect(where()).toContain("/admin/qrcodes?url=");
    expect(
      host.querySelector<HTMLInputElement>('input[type="url"]')?.value
    ).toBe("https://sc.example/q/qr-code-1");
    expect(
      host.querySelector<HTMLInputElement>('input[placeholder="flyer-salon"]')
        ?.value
    ).toBe("Menu du restaurant");
  });
});
