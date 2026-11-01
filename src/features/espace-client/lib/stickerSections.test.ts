import { describe, expect, it } from "vitest";
import type { FicheRecord, Onglet } from "../../../types";
import { visibleTabs } from "../../../lib/plans";
import { FICHES } from "../../../test/fixtures/fiches";
import {
  hasStickers,
  resolveStickerSection,
  sectionKey,
  stickerPath,
  stickerSections,
} from "./stickerSections";

/** Fiche de test dont TOUTES les sections visibles sont activées par l'administration (cas le plus simple). */
const bySlug = (slug: string): FicheRecord => {
  const f = structuredClone(FICHES.find(f => f.slug === slug)!);
  f.stickerSections = visibleTabs(f).map(sectionKey);
  return f;
};
const restaurant = () => bySlug("le-sunset"); // signature, secteur restaurant
const immo = () => bySlug("teranga-immo"); // signature, secteur immobilier
const pro = () => bySlug("mamadou-diop"); // pro
const essentielle = () => bySlug("awa-ndiaye"); // essentielle

describe("droit aux stickers", () => {
  it("Pro et Signature seulement", () => {
    expect([
      hasStickers(essentielle()),
      hasStickers(pro()),
      hasStickers(restaurant()),
    ]).toEqual([false, true, true]);
  });
});

describe("clé de section", () => {
  const tab = (type: Onglet["type"], id = "x1"): Onglet => ({
    id,
    type,
    visible: true,
  });
  it("utilise le type de l'onglet, sauf pour les onglets personnalisés (id)", () => {
    expect(sectionKey(tab("menu"))).toBe("menu");
    expect(sectionKey(tab("texte", "texte-9"))).toBe("texte-9");
  });
  it("construit l'URL avec le préfixe /s et encode les segments", () => {
    expect(stickerPath("le-sunset", "menu")).toBe("/s/le-sunset/menu");
    expect(stickerPath("a b", "c/d")).toBe("/s/a%20b/c%2Fd");
  });
});

describe("resolveStickerSection", () => {
  it("trouve une section par son type", () => {
    const r = resolveStickerSection(restaurant(), "menu");
    expect("tab" in r && r.tab.type).toBe("menu");
  });

  it("trouve une section par l'identifiant de l'onglet", () => {
    const f = restaurant();
    const menu = f.data.onglets!.find(t => t.type === "menu")!;
    const r = resolveStickerSection(f, menu.id);
    expect("tab" in r && r.tab.id).toBe(menu.id);
  });

  it("retombe sur la fiche complète pour la formule Essentielle", () => {
    expect(resolveStickerSection(essentielle(), "presentation")).toEqual({
      fallback: "plan",
    });
  });

  it("retombe sur la fiche complète quand la section est masquée", () => {
    const f = restaurant();
    f.data.onglets = f.data.onglets!.map(t =>
      t.type === "menu" ? { ...t, visible: false } : t,
    );
    expect(resolveStickerSection(f, "menu")).toEqual({ fallback: "missing" });
  });

  it("retombe sur la fiche complète quand la section est supprimée ou inconnue", () => {
    const f = restaurant();
    f.data.onglets = f.data.onglets!.filter(t => t.type !== "menu");
    expect(resolveStickerSection(f, "menu")).toEqual({ fallback: "missing" });
    expect(resolveStickerSection(restaurant(), "n-importe-quoi")).toEqual({
      fallback: "missing",
    });
  });
});

describe("activation par l'administration", () => {
  it("une section non activée n'est PAS servie : repli sur la fiche complète", () => {
    const f = restaurant();
    f.stickerSections = ["horaires"]; // seule « horaires » est activée
    expect(resolveStickerSection(f, "menu")).toEqual({ fallback: "inactive" });
    const r = resolveStickerSection(f, "horaires");
    expect("tab" in r && r.tab.type).toBe("horaires");
  });

  it("aucune section activée (ou serveur sans ce champ) : rien n'est servi", () => {
    const f = restaurant();
    f.stickerSections = [];
    expect(resolveStickerSection(f, "menu")).toEqual({ fallback: "inactive" });
    delete f.stickerSections;
    expect(resolveStickerSection(f, "menu")).toEqual({ fallback: "inactive" });
  });

  it("l'aperçu (administration, éditeur) montre une section même non activée", () => {
    const f = restaurant();
    f.stickerSections = [];
    const r = resolveStickerSection(f, "menu", { requireActive: false });
    expect("tab" in r && r.tab.type).toBe("menu");
  });

  it("l'aperçu ne contourne ni la formule ni une section masquée ou inconnue", () => {
    expect(
      resolveStickerSection(essentielle(), "presentation", {
        requireActive: false,
      }),
    ).toEqual({ fallback: "plan" });
    expect(
      resolveStickerSection(restaurant(), "inconnue", { requireActive: false }),
    ).toEqual({ fallback: "missing" });
  });

  it("une section activée est reconnue aussi par l'identifiant de son onglet", () => {
    const f = restaurant();
    f.stickerSections = ["menu"];
    const menu = f.data.onglets!.find(t => t.type === "menu")!;
    expect("tab" in resolveStickerSection(f, menu.id)).toBe(true);
  });
});

describe("stickerSections (sections proposables)", () => {
  it("place en premier la section du secteur : menu pour un restaurant", () => {
    const s = stickerSections(restaurant());
    expect(s[0]).toMatchObject({ key: "menu", primary: true });
    expect(s.filter(i => i.primary)).toHaveLength(1);
  });

  it("biens pour l'immobilier", () => {
    expect(stickerSections(immo())[0]).toMatchObject({
      key: "biens",
      primary: true,
    });
  });

  it("sans secteur, aucune section n'est mise en avant et l'ordre de la fiche est conservé", () => {
    const f = pro();
    delete f.data.secteur;
    const s = stickerSections(f);
    expect(s.some(i => i.primary)).toBe(false);
    expect(s.map(i => i.tab.id)).toEqual(s.map(i => i.tab.id)); // stable
    expect(s.length).toBeGreaterThan(0);
  });

  it("aucune section pour la formule Essentielle", () => {
    expect(stickerSections(essentielle())).toEqual([]);
  });
});
