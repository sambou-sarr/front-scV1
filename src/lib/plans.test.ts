import { describe, expect, it } from "vitest";
import {
  configuredTabs,
  defaultTabs,
  signatureHeader,
  visibleTabs,
} from "./plans";
import { FICHES } from "../test/fixtures/fiches";
import type { FicheRecord } from "../types";

const essentialDefaults = [
  { id: "one", type: "presentation" as const, visible: true },
  { id: "two", type: "reseaux" as const, visible: true },
  { id: "three", type: "localisation" as const, visible: true },
];

describe("Signature template fallback", () => {
  it("uses Signature blocks and theme when an upgraded fiche still has Essentielle defaults", () => {
    const base = FICHES[0];
    const fiche = {
      ...base,
      formule: "signature" as const,
      data: {
        ...base.data,
        onglets: essentialDefaults,
        entete: {
          disposition: "portrait" as const,
          taille: "m" as const,
          theme: "bleu" as const,
        },
      },
    };

    expect(configuredTabs(fiche).map(tab => tab.type)).toEqual(
      defaultTabs("signature").map(tab => tab.type),
    );
    expect(visibleTabs(fiche).map(tab => tab.type)).toContain("galerie");
    expect(signatureHeader(fiche)?.theme).toBe("or");
  });

  it("preserves customized blocks and header choices", () => {
    const base = FICHES[0];
    const customTabs = [
      {
        id: "custom",
        type: "presentation" as const,
        visible: true,
        titre: "À propos",
      },
      { id: "links", type: "liens" as const, visible: true },
    ];
    const fiche = {
      ...base,
      formule: "signature" as const,
      data: {
        ...base.data,
        onglets: customTabs,
        entete: {
          disposition: "duo" as const,
          taille: "l" as const,
          theme: "bleu" as const,
        },
      },
    };

    expect(configuredTabs(fiche)).toBe(customTabs);
    expect(visibleTabs(fiche).map(tab => tab.type)).toEqual([
      "presentation",
      "liens",
    ]);
    expect(signatureHeader(fiche)).toEqual(fiche.data.entete);
  });
});

/* ───── robustesse du correctif : ancien modèle, migration, entête unique ───── */
import {
  hasLegacyEssentialTemplate,
  migrateLegacySignature,
  resolveHeader,
} from "./plans";

const legacySignature = (): FicheRecord => {
  const base = structuredClone(FICHES.find(f => f.slug === "le-sunset")!);
  return {
    ...base,
    formule: "signature" as const,
    data: {
      ...base.data,
      // onglets enregistrés par un modèle sectoriel de l'Essentielle : identifiants aléatoires
      onglets: [
        {
          id: "presentation-mk1a0",
          type: "presentation" as const,
          visible: true,
        },
        { id: "reseaux-mk1a1", type: "reseaux" as const, visible: true },
        {
          id: "localisation-mk1a2",
          type: "localisation" as const,
          visible: true,
        },
      ],
      entete: {
        disposition: "portrait" as const,
        taille: "m" as const,
        theme: "bleu" as const,
      },
    },
  };
};

describe("reconnaître l'ancien modèle Essentielle", () => {
  it("reconnaît les onglets enregistrés par l'Essentielle (identifiants aléatoires)", () => {
    expect(hasLegacyEssentialTemplate(legacySignature())).toBe(true);
  });

  it("ne prend pas pour un ancien modèle une page Signature réduite volontairement à ces 3 onglets", () => {
    const f = legacySignature();
    f.data.onglets = defaultTabs("signature").filter(t =>
      ["presentation", "reseaux", "localisation"].includes(t.type),
    );
    expect(hasLegacyEssentialTemplate(f)).toBe(false);
    expect(visibleTabs(f).map(t => t.type)).toEqual([
      "presentation",
      "reseaux",
      "localisation",
    ]);
  });

  it("ne concerne que les fiches Signature", () => {
    expect(
      hasLegacyEssentialTemplate({ ...legacySignature(), formule: "pro" }),
    ).toBe(false);
  });
});

describe("migrateLegacySignature", () => {
  it("renvoie null quand la fiche n'est pas à l'ancien modèle", () => {
    expect(
      migrateLegacySignature(
        structuredClone(FICHES.find(f => f.slug === "le-sunset")!),
      ),
    ).toBeNull();
  });

  it("renvoie les onglets et l'entête Signature, identifiants déterministes", () => {
    const m = migrateLegacySignature(legacySignature())!;
    expect(m.onglets!.map(t => t.type)).toEqual(
      defaultTabs("signature").map(t => t.type),
    );
    expect(m.onglets!.every(t => t.id.startsWith("signature-"))).toBe(true);
    expect(m.entete?.theme).toBe("or");
  });

  it("après migration, un thème « bleu » choisi par l'utilisateur est respecté", () => {
    const f = legacySignature();
    expect(resolveHeader(f).theme).toBe("or"); // avant : l'ancien bleu par défaut est remplacé
    const migrated = {
      ...f,
      data: {
        ...f.data,
        ...migrateLegacySignature(f),
        entete: { ...resolveHeader(f), theme: "bleu" as const },
      },
    };
    expect(hasLegacyEssentialTemplate(migrated)).toBe(false);
    expect(resolveHeader(migrated).theme).toBe("bleu");
  });

  it("la migration est stable : appliquée deux fois, elle ne change plus rien", () => {
    const f = legacySignature();
    const once = { ...f, data: { ...f.data, ...migrateLegacySignature(f) } };
    expect(migrateLegacySignature(once)).toBeNull();
  });
});

describe("resolveHeader", () => {
  it("Signature à l'ancien modèle : thème Signature", () => {
    expect(resolveHeader(legacySignature()).theme).toBe("or");
  });

  it("Pro et Essentielle ignorent l'entête enregistré", () => {
    const pro = structuredClone(FICHES.find(f => f.slug === "mamadou-diop")!);
    pro.data.entete = { disposition: "duo", taille: "l", theme: "nuit" };
    expect(resolveHeader(pro)).toMatchObject({
      disposition: "portrait",
      taille: "m",
    });
  });

  it("corrige un thème ou une disposition interdits par la formule", () => {
    const f = structuredClone(FICHES.find(f => f.slug === "le-sunset")!);
    f.data.entete = {
      disposition: "inconnue" as never,
      taille: "m",
      theme: "inconnu" as never,
    };
    const h = resolveHeader(f);
    expect(h.disposition).toBe("portrait");
    expect(["or", "clair", "bleu", "nuit"]).toContain(h.theme);
  });
});
