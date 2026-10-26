import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("../../lib/api", () => ({ api: apiMocks }));

import {
  purchaseFiches,
  quoteFichePurchase,
  quoteSubscription,
  upgradeFichePlan,
} from "./espaceClient.service";

beforeEach(() => vi.clearAllMocks());

describe("parcours d’achat des fiches", () => {
  it("envoie les devis de fiches à l’API", async () => {
    apiMocks.post.mockResolvedValueOnce({
      data: { quote: { totalFcfa: 3000 } },
    });
    const input = { plan: "essentielle", quantity: 4 } as const;

    await expect(quoteFichePurchase(input)).resolves.toEqual({
      totalFcfa: 3000,
    });
    expect(apiMocks.post).toHaveBeenCalledWith("fiches/purchases/quote", input);
  });

  it("attend la confirmation simulée avant de renvoyer les fiches", async () => {
    apiMocks.post
      .mockResolvedValueOnce({
        data: { purchase: { id: 42, status: "pending" } },
      })
      .mockResolvedValueOnce({
        data: {
          purchase: { id: 42, status: "confirmed" },
          fiches: [{ id: 8, slug: "nouvelle-fiche" }],
        },
      });

    const result = await purchaseFiches({
      plan: "pro",
      quantity: 2,
      dureeMois: 12,
    });

    expect(result.fiches).toHaveLength(1);
    expect(apiMocks.post).toHaveBeenNthCalledWith(
      2,
      "fiches/purchases/42/simulate-confirmation",
    );
  });
});

describe("tarif des abonnements", () => {
  it("demande le devis d’un upgrade pour une seule fiche et sa durée", async () => {
    apiMocks.post.mockResolvedValueOnce({
      data: { totalFcfa: 12000, lignes: [{ totalFcfa: 12000 }] },
    });

    await quoteSubscription("SIGNATURE", 12);

    expect(apiMocks.post).toHaveBeenCalledWith(
      "client/parametres/commande/tarif",
      {
        lignes: [
          { formule: "signature", dureeMois: 12, quantite: 1 },
        ],
      },
    );
  });

  it("envoie la durée au serveur avant de confirmer l’upgrade", async () => {
    apiMocks.post
      .mockResolvedValueOnce({
        data: { data: { payment: { id: 9 } } },
      })
      .mockResolvedValueOnce({ data: { data: { payment: { status: "confirmed" } } } });

    await upgradeFichePlan(3, "PRO", 6);

    expect(apiMocks.post).toHaveBeenNthCalledWith(
      1,
      "/subscription/upgrade",
      { ficheId: 3, plan: "pro", dureeMois: 6 },
    );
    expect(apiMocks.post).toHaveBeenNthCalledWith(
      2,
      "/subscription/payments/9/simulate-confirmation",
    );
  });
});
