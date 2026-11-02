// @vitest-environment jsdom
import type { InternalAxiosRequestConfig } from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import AdminSettings from "./pages/AdminSettings";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import FicheDetail from "./pages/FicheDetail";
import Fiches from "./pages/Fiches";
import Leads from "./pages/Leads";
import Production from "./pages/Production";
import AdminActionLogs from "./pages/AdminActionLogs";
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
  demandesCarte: 3,
  derniersClients: [
    { id: 21, nom: "Awa Ndiaye", email: "awa@example.sn", createdAt: "2026-11-02T10:00:00Z" },
  ],
  derniersAbonnements: [
    {
      id: 31,
      formule: "pro",
      statut: "active",
      createdAt: "2026-11-02T11:00:00Z",
      montantFcfa: 25000,
      fiche: { id: 12, slug: "chez-awa", nom: "Awa Ndiaye", entreprise: "Chez Awa" },
    },
  ],
};
const revenus = {
  encaisse: { montantFcfa: 50000, periodePrecedenteFcfa: 40000, evolutionPct: 25 },
  grouping: "month",
  encaissements: [{ periode: "2026-09-01", montantFcfa: 50000, nbPaiements: 2 }],
  nouvellesFiches: [{ periode: "2026-09-01", nombre: 2 }],
  parFormule: {
    essentielle: { montantFcfa: 0, nbPaiements: 0 },
    pro: { montantFcfa: 0, nbPaiements: 0 },
    signature: { montantFcfa: 0, nbPaiements: 0 },
  },
  aRenouveler: { nb: 3, montantEstimeFcfa: 30000 },
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

let calls: {
  method?: string;
  url?: string;
  params?: Record<string, unknown>;
  data?: unknown;
}[] = [];
let productionCartes: Record<string, unknown>[] = [];
let productionStickers: Record<string, unknown>[] = [];
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
          active: true,
          emailVerifie: true,
          createdAt: "2026-01-01T00:00:00Z",
          nbFiches: 2,
        },
      ],
      pagination: page,
    };
  if (url === "/admin/users/admin")
    return { created: true, message: "Invitation administrateur envoyée." };
  if (url === "/admin/settings")
    return {
      settings: {
        platformName: "Support Connecté",
        supportEmail: "support@sc.sn",
        supportPhone: "",
        socialLinks: { instagram: "", facebook: "", linkedin: "" },
        maintenance: false,
      },
    };
  if (url === "/admin/action-logs")
    return {
      items: [
        {
          id: 100,
          adminName: "Root",
          adminEmail: "root@sc.sn",
          method: "PATCH",
          path: "/admin/settings",
          statusCode: 200,
          createdAt: "2026-11-02T14:00:00.000Z",
        },
      ],
      pagination: { ...page, total: 1 },
    };
  if (url === "/auth/me")
    return {
      user: {
        id: 1,
        email: "root@sc.sn",
        nom: "Root",
        role: "ADMIN",
        emailVerified: true,
      },
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
  if (url === "/admin/production/cartes") return { cartes: productionCartes };
  if (url === "/admin/production/modeles-cartes")
    return {
      modeles: [
        {
          id: 8,
          tier: "pro",
          nom: "Modèle Pro actif",
          rectoUrl: "https://cdn.example/pro-recto.webp",
          versoUrl: "https://cdn.example/pro-verso.webp",
          actif: true,
        },
      ],
    };
  if (url === "/admin/production/modeles-cartes/images")
    return {
      url: "http://localhost:4000/api/media/cartes/0a1b2c3d-0000-4000-8000-000000000001.webp",
    };
  if (url === "/admin/production/cartes/55" && c.method === "patch") {
    const body = JSON.parse(c.data as string) as Record<string, unknown>;
    productionCartes = productionCartes.map(card => ({ ...card, ...body }));
    return { carte: productionCartes[0] };
  }
  if (url === "/admin/production/stickers")
    return { stickers: productionStickers };
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
let queryClient: QueryClient;
beforeEach(() => {
  localStorage.clear();
  calls = [];
  productionCartes = [];
  productionStickers = [];
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  saveSession({
    token: "T",
    user: { name: "Root", email: "root@sc.sn", role: "ADMIN" },
  });
  api.defaults.adapter = async config => {
    calls.push({
      method: config.method,
      url: config.url,
      params: config.params as Record<string, unknown>,
      data: config.data,
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
  <QueryClientProvider client={queryClient}>
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
          <Route path="parametres" element={<AdminSettings />} />
          <Route path="historique" element={<AdminActionLogs />} />
          <Route path="demandes" element={<Leads />} />
          <Route path="production" element={<Production />} />
          <Route path="qrcodes" element={<QrCodes />} />
          <Route path="relances" element={<Relances />} />
          <Route path="*" element={<AdminNotFound />} />
        </Route>
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>
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
    expect(host.textContent).toContain("Encaissé sur la période");
    expect(host.textContent).toMatch(/50\s000\sF/); // espace (insécable) du format fr-FR
    expect(host.textContent).toContain("10 derniers clients inscrits");
    expect(host.textContent).toContain("Awa Ndiaye");
    expect(host.textContent).toContain("10 derniers abonnements");
    expect(host.textContent).toContain("Encaissé sur la période");
    for (const l of [
      "Fiches",
      "Abonnements & paiements",
      "Clients",
      "Demandes",
      "Relances",
      "Production",
      "QR codes",
      "Formules",
      "Journal d’activité",
    ])
      expect(byText("aside nav a", l), l).toBeTruthy();
    expect(byText("aside nav a", "Formules")?.getAttribute("href")).toBe(
      "/admin/formules"
    );
  });

  it("filtre les graphiques par dates et permet de passer en courbe", async () => {
    act(() => root.render(app("/admin")));
    await settle();
    expect(
      calls.filter(call => call.url === "/admin/revenus").at(-1)?.params
    ).toMatchObject({ from: expect.any(String), to: expect.any(String) });
    const from = host.querySelector<HTMLInputElement>('input[aria-label="Date de début"]')!;
    const to = host.querySelector<HTMLInputElement>('input[aria-label="Date de fin"]')!;
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(from, "2026-10-01");
      from.dispatchEvent(new Event("input", { bubbles: true }));
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(to, "2026-10-31");
      to.dispatchEvent(new Event("input", { bubbles: true }));
    });
    click(byText("button", "Appliquer"));
    await settle();
    expect(
      calls.filter(call => call.url === "/admin/revenus").at(-1)?.params
    ).toMatchObject({ from: "2026-10-01", to: "2026-10-31" });

    const mode = host.querySelector<HTMLSelectElement>(
      'select[aria-label="Type de graphique"]'
    )!;
    act(() => {
      mode.value = "line";
      mode.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(host.querySelectorAll(".adm-line-chart")).toHaveLength(2);
  });

  it("met clairement en évidence la période de 30 jours sélectionnée", async () => {
    act(() => root.render(app("/admin")));
    await settle();
    const thirtyDays = byText('button[aria-pressed]', "30 jours");
    expect(thirtyDays?.getAttribute("aria-pressed")).toBe("false");
    click(thirtyDays);
    await settle();

    expect(thirtyDays?.getAttribute("aria-pressed")).toBe("true");
    expect(host.textContent).toContain("Filtre actif : 30 jours");
    expect(
      calls.filter(call => call.url === "/admin/revenus").at(-1)?.params
    ).toMatchObject({ from: expect.any(String), to: expect.any(String) });
  });

  it("affiche le journal d’activité et le logo dans l’en-tête mobile", async () => {
    act(() => root.render(app("/admin/historique")));
    await settle();

    expect(host.textContent).toContain("Journal d’activité");
    expect(host.textContent).toContain("Paramètres de l’application");
    expect(host.textContent).toContain("Root");
    expect(host.querySelector('.top-mob img[alt="Support Connecté"]')?.getAttribute("src"))
      .toBe("/images/logo-noir.webp");
    expect(calls.some(call => call.url === "/admin/action-logs")).toBe(true);
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

  it("le KPI des demandes de cartes ouvre la page Production", async () => {
    act(() => root.render(app("/admin")));
    await settle();

    expect(host.textContent).toContain("Demandes de cartes");
    const cardKpi = byText("button.kpi", "Demandes de cartes");
    expect(cardKpi?.textContent).toContain("3");
    click(cardKpi);
    await settle();

    expect(where()).toBe("/admin/production");
    expect(host.textContent).toContain("Production");
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

  it("ne propose pas de modifier l’adresse de la fiche", async () => {
    act(() => root.render(app("/admin/fiches/13")));
    await settle();
    expect(host.textContent).not.toContain("Modifier l’adresse");
  });

  it("affiche les coordonnées, l'aperçu du modèle actif et filtre les cartes par statut sans upload", async () => {
    productionCartes = [
      {
        id: 55,
        ficheId: 12,
        tier: "pro",
        nfcUrl: "https://sc.example/f/chez-awa",
        adresseChangee: false,
        rectoUrl: null,
        versoUrl: null,
        design: null,
        encodedAt: null,
        statut: "a_imprimer",
        notes: null,
        printedAt: null,
        testedAt: null,
        createdAt: "2026-10-01T00:00:00.000Z",
        adresseLivraison: "Dakar, Plateau",
        telephoneLivraison: "770000000",
        notesClient: "Appeler à l'arrivée",
        montantFcfa: 12000,
        fiche: {
          id: 12,
          slug: "chez-awa",
          nom: "Awa Ndiaye",
          entreprise: "Chez Awa",
          telephone: "770000000",
          email: "awa@example.sn",
          fonction: "Gérante",
        },
      },
      {
        id: 56,
        ficheId: 12,
        tier: "pro",
        nfcUrl: "https://sc.example/f/autre",
        adresseChangee: false,
        rectoUrl: null,
        versoUrl: null,
        design: null,
        encodedAt: null,
        statut: "livree",
        notes: null,
        printedAt: null,
        testedAt: null,
        createdAt: "2026-10-02T00:00:00.000Z",
        adresseLivraison: null,
        telephoneLivraison: null,
        notesClient: null,
        montantFcfa: null,
        fiche: {
          id: 13,
          slug: "autre",
          nom: "Autre client",
          entreprise: "Autre client",
          telephone: null,
          email: null,
          fonction: null,
        },
      },
    ];
    act(() => root.render(app("/admin/production")));
    await settle();
    expect(host.textContent).not.toContain("Nouvelle carte");
    expect(host.textContent).toContain("Nouveau sticker");
    expect(host.textContent).toContain("Livraison : Dakar, Plateau");
    expect(host.textContent).toContain("Tél. livraison : 770000000");
    expect(host.textContent).toContain("Appeler à l'arrivée");
    expect(host.textContent).toContain("12 000 FCFA");
    expect(host.querySelectorAll('input[type="file"]')).toHaveLength(0);
    expect(host.textContent).toContain("Modèle Pro actif");
    expect(host.querySelectorAll("tbody tr")).toHaveLength(2);
    const filter = host.querySelector<HTMLSelectElement>(
      'select[aria-label="Filtrer les cartes par statut"]'
    )!;
    act(() => {
      filter.value = "livree";
      filter.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await settle();
    expect(host.querySelectorAll("tbody tr")).toHaveLength(1);
    expect(host.textContent).toContain("Autre client");

    click(byText("button.adm-btn", "Aperçu"));
    await settle();
    expect(host.textContent).toContain("Recto · modèle actif Modèle Pro actif");
    expect(host.querySelector('img[src="https://cdn.example/pro-recto.webp"]')).toBeTruthy();
  });

  it("filtre les stickers à fonction par statut de production", async () => {
    const sticker = {
      id: 1,
      kind: "fonction",
      fonction: "lien",
      tailleMm: 30,
      forme: "rond",
      theme: "classique",
      quantite: 1,
      options: null,
      parametres: { lien: "https://sc.example" },
      personnalisation: null,
      qrMode: "dynamique",
      ficheSlug: "chez-awa",
      ficheUrl: null,
      qr: {
        code: "qr-code-1",
        url: "https://sc.example/q/qr-code-1",
        targetUrl: "https://sc.example",
        actif: true,
        scans: 0,
      },
      statut: "parametre",
      notes: null,
      createdAt: "2026-10-01T00:00:00.000Z",
      fiche: {
        id: 12,
        slug: "chez-awa",
        nom: "Awa Ndiaye",
        entreprise: "Chez Awa",
      },
    };
    productionStickers = [sticker, { ...sticker, id: 2, statut: "a_parametrer" }];
    act(() => root.render(app("/admin/production")));
    await settle();
    click(byText('button[role="tab"]', "Stickers à fonction"));
    expect(host.querySelectorAll(".prod-card")).toHaveLength(2);
    const filter = host.querySelector<HTMLSelectElement>(
      'select[aria-label="Filtrer les stickers par statut"]'
    )!;
    act(() => {
      filter.value = "parametre";
      filter.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await settle();
    expect(host.querySelectorAll(".prod-card")).toHaveLength(1);
    expect(host.textContent).toContain("Paramétré");
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

  it("ouvre la gestion de l’équipe admin depuis la page Clients", async () => {
    act(() => root.render(app("/admin/clients")));
    await settle();
    click(byText("button.adm-btn", "Gérer l’équipe admin"));
    await settle();

    expect(where()).toBe("/admin/parametres?section=team");
    expect(host.textContent).toContain("Équipe administrateur");
    expect(host.textContent).toContain("Inviter un administrateur");
    expect(calls.some(call => call.url === "/admin/users")).toBe(true);
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
