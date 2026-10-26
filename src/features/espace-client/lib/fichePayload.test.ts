import { describe, expect, it } from "vitest";
import { planOf } from "../../../lib/plans";
import type { FicheRecord } from "../../../types";
import { FICHES } from "../../../test/fixtures/fiches";
import { buildUpdatePayload, labelForChamp } from "./fichePayload";

const base = (): FicheRecord => structuredClone(FICHES[0]);
const withData = (
  f: FicheRecord,
  data: Partial<FicheRecord["data"]>,
): FicheRecord => ({
  ...f,
  data: { ...f.data, ...data },
});

describe("buildUpdatePayload", () => {
  it("renvoie null quand rien n'a changé", () => {
    const f = base();
    expect(buildUpdatePayload(f, structuredClone(f)).payload).toBeNull();
  });

  it("n'envoie que les champs d'identité modifiés (nettoyés)", () => {
    const f = base();
    const { payload } = buildUpdatePayload(f, { ...f, prenom: "  Awa  " });
    expect(payload).toMatchObject({ prenom: "Awa" });
    expect(Object.keys(payload!).filter(k => k !== "baseUpdatedAt")).toEqual([
      "prenom",
    ]);
  });

  it("n'envoie dans `data` que les clés modifiées", () => {
    const f = base();
    const { payload } = buildUpdatePayload(
      f,
      withData(f, { presentation: "  Bonjour " }),
    );
    expect(payload?.data).toEqual({ presentation: "Bonjour" });
  });

  it("joint la version vue au chargement (détection de conflit)", () => {
    const f = { ...base(), updatedAt: "2026-01-01T00:00:00.000Z" };
    const { payload } = buildUpdatePayload(f, { ...f, nom: "Autre" });
    expect(payload?.baseUpdatedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("retire les lignes incomplètes et les signale dans `skipped`", () => {
    const f = base();
    const draft = withData(f, {
      liens: [
        { label: "Site", url: "https://exemple.sn" },
        { label: "   ", url: "https://vide.sn" },
      ],
    });
    const { payload, skipped } = buildUpdatePayload(f, draft);
    expect((payload?.data as { liens: unknown[] }).liens).toEqual([
      { label: "Site", url: "https://exemple.sn" },
    ]);
    expect(skipped).toEqual(["1 lien sans libellé"]);
  });

  it("n'envoie pas les prix du catalogue si la formule les interdit", () => {
    const f = base();
    const draft = withData(f, {
      sections: [
        { titre: "Produits", articles: [{ nom: "Thé", prix: "1500" }] },
      ],
    });
    const plan = { ...planOf(f), catalogPrices: false };
    const { payload, ignored } = buildUpdatePayload(f, draft, plan);
    const sections = (
      payload?.data as { sections: { articles: Record<string, unknown>[] }[] }
    ).sections;
    expect(sections[0].articles[0]).not.toHaveProperty("prix");
    expect(ignored).toContain("prix du catalogue");
  });

  it("signale les images locales (blob:/data:) pas encore envoyées", () => {
    const f = base();
    const { pendingUploads } = buildUpdatePayload(f, {
      ...f,
      logo: "blob:http://localhost/abc",
    });
    expect(pendingUploads).toEqual(["logo"]);
  });
});

describe("labelForChamp", () => {
  it("traduit un chemin d'erreur serveur en libellé lisible", () => {
    expect(labelForChamp("data.liens.2.label")).toBe(
      "Liens · ligne 3 · libellé",
    );
    expect(labelForChamp("prenom")).toBe("Prénom");
    expect(labelForChamp("")).toBe("Données");
  });
});
