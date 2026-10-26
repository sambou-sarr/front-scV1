// @vitest-environment jsdom
import { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../../lib/api";
import { FICHE_DATA_KEYS, type ApiFicheDetail } from "../../../types";
import {
  fetchFiche,
  patchFiche,
  publishFiche,
  toFicheRecord,
} from "./ficheApi";

const dto = (over: Partial<ApiFicheDetail> = {}): ApiFicheDetail => ({
  id: 7,
  slug: "awa-ndiaye",
  formule: "SIGNATURE",
  statut: "ACTIVE",
  enLigneSeule: false,
  prenom: "Awa",
  nom: "Ndiaye",
  fonction: null as unknown as string, // le serveur peut renvoyer null malgré le type
  entreprise: "Studio",
  photo: "",
  logo: "",
  telephone: "",
  whatsapp: "",
  email: "",
  site: "",
  adresse: "",
  googlePlaceId: "",
  dateEcheance: null,
  scansTotal: 3,
  data: {},
  ...over,
});

describe("toFicheRecord", () => {
  it("passe la formule et le statut en minuscules", () => {
    const f = toFicheRecord(dto());
    expect([f.formule, f.statut]).toEqual(["signature", "active"]);
  });

  it("remplace les valeurs nulles par des chaînes vides", () => {
    expect(toFicheRecord(dto()).fonction).toBe("");
  });

  it("ne reprend que les clés connues de FicheData", () => {
    const f = toFicheRecord(
      dto({
        data: {
          presentation: "Bonjour",
          ancienChamp: "à ignorer",
        } as ApiFicheDetail["data"],
      }),
    );
    expect(f.data.presentation).toBe("Bonjour");
    expect(f.data).not.toHaveProperty("ancienChamp");
  });

  it("filtre les médias de type inconnu et renvoie toujours une galerie", () => {
    const f = toFicheRecord(
      dto({
        data: {
          galerie: [
            { type: "image", url: "/a.jpg", alt: "A" },
            { type: "pdf", url: "/b.pdf" },
            { type: "video", url: "/c.mp4" },
          ],
        },
      }),
    );
    expect(f.data.galerie).toEqual([
      { type: "image", url: "/a.jpg", alt: "A" },
      { type: "video", url: "/c.mp4", alt: undefined },
    ]);
    expect(toFicheRecord(dto()).data.galerie).toEqual([]);
  });

  it("tolère une fiche sans `data`", () => {
    expect(
      toFicheRecord(
        dto({ data: undefined as unknown as ApiFicheDetail["data"] }),
      ).data.galerie,
    ).toEqual([]);
  });
});

describe("FICHE_DATA_KEYS", () => {
  it("ne contient aucun doublon", () => {
    expect(new Set(FICHE_DATA_KEYS).size).toBe(FICHE_DATA_KEYS.length);
  });
});

describe("fetchFiche / patchFiche", () => {
  const original = api.defaults.adapter;
  let seen: { method?: string; url?: string; body?: unknown }[] = [];
  beforeEach(() => {
    seen = [];
    api.defaults.adapter = async config => {
      seen.push({
        method: config.method,
        url: config.url,
        body: config.data && JSON.parse(config.data),
      });
      const response = {
        status: 200,
        data: { fiche: dto() },
        statusText: "",
        headers: {},
        config,
      };
      if (config.url === "fiches/404") {
        throw new AxiosError("nf", "404", config, undefined, {
          ...response,
          status: 404,
        });
      }
      return response;
    };
  });
  afterEach(() => {
    api.defaults.adapter = original;
  });

  it("fetchFiche lit `{ fiche }` et renvoie un FicheRecord", async () => {
    const f = await fetchFiche("fiches/7");
    expect(seen[0]).toMatchObject({ method: "get", url: "fiches/7" });
    expect(f.formule).toBe("signature");
  });

  it("patchFiche envoie le corps et renvoie la fiche enregistrée", async () => {
    const f = await patchFiche(7, { prenom: "Awa" });
    expect(seen[0]).toMatchObject({
      method: "patch",
      url: "fiches/7",
      body: { prenom: "Awa" },
    });
    expect(f.slug).toBe("awa-ndiaye");
  });

  it("publie la fiche via la route dédiée", async () => {
    const f = await publishFiche(7);
    expect(seen[0]).toMatchObject({
      method: "post",
      url: "fiches/7/publish",
    });
    expect(f.statut).toBe("active");
  });

  it("laisse remonter l'AxiosError d'origine (lue par toFicheError)", async () => {
    await expect(fetchFiche("fiches/404")).rejects.toMatchObject({
      response: { status: 404 },
    });
  });
});
