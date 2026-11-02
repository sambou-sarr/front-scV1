import { describe, expect, it } from "vitest";
import { carteStatusOptions } from "./production";

describe("carteStatusOptions", () => {
  it("only offers allowed next actions for a card request", () => {
    expect(carteStatusOptions("a_imprimer")).toEqual([
      "a_imprimer",
      "imprimee",
      "annulee",
    ]);
    expect(carteStatusOptions("testee")).toEqual([
      "testee",
      "livree",
      "encodee",
      "annulee",
    ]);
    expect(carteStatusOptions("livree")).toEqual(["livree", "testee"]);
  });
});
