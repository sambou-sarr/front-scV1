import { describe, expect, it } from "vitest";
import type { ApiFicheSummary } from "../../../types";
import { isExpiredFiche, renewPath, renewalInfo } from "./renewal";

const NOW = Date.parse("2026-10-26T12:00:00Z");
const day = (n: number) => new Date(NOW + n * 86_400_000).toISOString();

const fiche = (over: Partial<ApiFicheSummary> = {}): ApiFicheSummary =>
  ({
    id: 12,
    slug: "le-sunset",
    statut: "ACTIVE",
    subscriptions: [],
    ...over,
  }) as ApiFicheSummary;
const latest = (
  status: "ACTIVE" | "CANCELED" | "EXPIRED",
  endsAt: string | null,
  plan?: "PRO" | "SIGNATURE" | "ESSENTIELLE",
) => ({
  status,
  endsAt,
  ...(plan ? { plan: { type: plan } } : {}),
});

describe("renewalInfo : une fiche arrivée à terme", () => {
  it("abonnement échu (statut EXPIRED) : renouvelable, avec la formule et la date de fin", () => {
    const f = fiche({ latestSubscription: latest("EXPIRED", day(-5), "PRO") });
    expect(renewalInfo(f, NOW)).toEqual({
      expired: true,
      previousPlan: "PRO",
      endedAt: day(-5),
    });
  });

  it("date dépassée alors que la tâche d'expiration n'est pas encore passée (statut encore ACTIVE)", () => {
    const f = fiche({
      latestSubscription: latest("ACTIVE", day(-1), "SIGNATURE"),
    });
    expect(renewalInfo(f, NOW)).toMatchObject({
      expired: true,
      previousPlan: "SIGNATURE",
    });
  });

  it("abonnement résilié et aucun autre valide : renouvelable", () => {
    expect(
      isExpiredFiche(
        fiche({ latestSubscription: latest("CANCELED", day(-40), "PRO") }),
        NOW,
      ),
    ).toBe(true);
  });

  it("abonnement valide : pas de renouvellement, même à moins de 30 jours de l'échéance", () => {
    const valid = fiche({
      subscriptions: [
        { endsAt: day(10), status: "ACTIVE", plan: { type: "PRO" } },
      ] as never,
    });
    expect(renewalInfo(valid, NOW)).toEqual({
      expired: false,
      previousPlan: null,
      endedAt: null,
    });
  });

  it("fiche sans aucun abonnement (Essentielle gratuite) : rien à renouveler", () => {
    expect(isExpiredFiche(fiche(), NOW)).toBe(false);
  });

  it.each(["BROUILLON", "SUSPENDUE"])(
    "fiche %s : jamais proposée au renouvellement",
    statut => {
      const f = fiche({
        statut: statut as never,
        latestSubscription: latest("EXPIRED", day(-5), "PRO"),
      });
      expect(isExpiredFiche(f, NOW)).toBe(false);
    },
  );

  it("formule inconnue du serveur (ancienne réponse) : renouvelable sans formule à proposer", () => {
    const f = fiche({ latestSubscription: latest("EXPIRED", day(-5)) });
    expect(renewalInfo(f, NOW)).toMatchObject({
      expired: true,
      previousPlan: null,
    });
  });

  it("une ancienne formule Essentielle n'est pas proposée comme formule à renouveler", () => {
    const f = fiche({
      latestSubscription: latest("EXPIRED", day(-5), "ESSENTIELLE"),
    });
    expect(renewalInfo(f, NOW).previousPlan).toBeNull();
  });

  it("ancien format de réponse (abonnementActif)", () => {
    const f = fiche({
      abonnementActif: {
        endsAt: day(-3),
        status: "EXPIRED",
        plan: { type: "SIGNATURE", nom: "Signature" },
      } as never,
    });
    expect(renewalInfo(f, NOW)).toMatchObject({
      expired: true,
      previousPlan: "SIGNATURE",
    });
  });
});

describe("renewPath", () => {
  it("ouvre la page des abonnements sur la fiche à renouveler", () => {
    expect(renewPath(12)).toBe("/espace-client/abonnements?renew=12");
  });
});
