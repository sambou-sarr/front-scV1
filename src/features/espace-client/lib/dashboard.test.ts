import { describe, expect, it } from "vitest";
import type { ApiFicheSummary } from "../../../types";
import { health } from "./dashboard";

const ficheWithSubscription = (
  startsAt: string,
  endsAt: string,
): ApiFicheSummary =>
  ({
    statut: "ACTIVE",
    subscriptions: [
      {
        startsAt,
        endsAt,
        status: "ACTIVE",
        plan: { type: "PRO" },
      },
    ],
  }) as ApiFicheSummary;

describe("dashboard subscription expiry alerts", () => {
  it.each([
    ["one month", "2026-01-01T00:00:00.000Z", "2026-02-01T00:00:00.000Z"],
    ["three months", "2026-01-01T00:00:00.000Z", "2026-04-01T00:00:00.000Z"],
  ])("warns 7 days before a %s subscription ends", (_label, startsAt, endsAt) => {
    const sevenDaysBefore = Date.parse(endsAt) - 7 * 86_400_000;
    const eightDaysBefore = Date.parse(endsAt) - 8 * 86_400_000;

    expect(health(ficheWithSubscription(startsAt, endsAt), sevenDaysBefore))
      .toBe("soon");
    expect(health(ficheWithSubscription(startsAt, endsAt), eightDaysBefore))
      .toBe("ok");
  });

  it("warns 15 days before a one-year subscription ends", () => {
    const startsAt = "2026-01-01T00:00:00.000Z";
    const endsAt = "2027-01-01T00:00:00.000Z";

    expect(
      health(
        ficheWithSubscription(startsAt, endsAt),
        Date.parse(endsAt) - 15 * 86_400_000,
      ),
    ).toBe("soon");
    expect(
      health(
        ficheWithSubscription(startsAt, endsAt),
        Date.parse(endsAt) - 16 * 86_400_000,
      ),
    ).toBe("ok");
  });

  it("keeps the existing 30-day alert for other or unavailable durations", () => {
    const fiche = ficheWithSubscription(
      "2026-01-01T00:00:00.000Z",
      "2026-07-01T00:00:00.000Z",
    );

    expect(
      health(fiche, Date.parse("2026-06-01T00:00:00.000Z")),
    ).toBe("soon");
  });
});
