// @vitest-environment jsdom
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { hasLegacyEssentialTemplate, resolveHeader } from "../../../lib/plans";
import { FICHES } from "../../../test/fixtures/fiches";
import type { FicheRecord } from "../../../types";
import Editor from "./Editor";
import Fiche from "./Fiche";
import StickerSectionView from "./sticker/StickerSectionView";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/** Fiche Signature issue d'une Essentielle : onglets et thème bleu de l'Essentielle encore enregistrés. */
const legacy = (): FicheRecord => {
  const b = structuredClone(FICHES.find(f => f.slug === "le-sunset")!);
  return {
    ...b,
    data: {
      ...b.data,
      onglets: [
        { id: "presentation-a", type: "presentation", visible: true },
        { id: "reseaux-b", type: "reseaux", visible: true },
        { id: "localisation-c", type: "localisation", visible: true },
      ],
      entete: { disposition: "portrait", taille: "m", theme: "bleu" },
    },
  };
};
const html = (el: ReturnType<typeof h>) =>
  renderToString(h(MemoryRouter, null, el));
const themeOf = (s: string) =>
  /fiche[^"]* th-(or|clair|bleu|nuit)/.exec(s)?.[1];

describe("fiche Signature à l'ancien modèle", () => {
  it("la fiche complète et la page sticker affichent le MÊME thème (Signature)", () => {
    const f = legacy();
    const full = themeOf(html(h(Fiche, { fiche: f })));
    const sticker = themeOf(
      html(h(StickerSectionView, { fiche: f, section: "galerie" })),
    );
    expect(full).toBe("or");
    expect(sticker).toBe(full);
  });

  it("la fiche complète montre les onglets Signature, pas les 3 de l'Essentielle", () => {
    const out = html(h(Fiche, { fiche: legacy() }));
    expect(out).toContain("Galerie");
  });
});

describe("Editor : première modification d'une fiche à l'ancien modèle", () => {
  const edit = (act_: (host: HTMLElement) => void) => {
    const host = document.createElement("div");
    const root = createRoot(host);
    const received: FicheRecord[] = [];
    act(() =>
      root.render(
        h(
          MemoryRouter,
          null,
          h(Editor, { fiche: legacy(), onChange: f => received.push(f) }),
        ),
      ),
    );
    act(() => act_(host));
    act(() => root.unmount());
    return received;
  };

  it("choisir le thème « bleu » est respecté et enregistre les onglets Signature", () => {
    const [next] = edit(host =>
      (host.querySelector(".ed-themes .tt-bleu") as HTMLButtonElement).click(),
    );
    expect(next.data.entete?.theme).toBe("bleu");
    expect(next.data.onglets!.every(t => t.id.startsWith("signature-"))).toBe(
      true,
    );
    expect(hasLegacyEssentialTemplate(next)).toBe(false);
    expect(resolveHeader(next).theme).toBe("bleu"); // le bleu choisi n'est plus remplacé
  });

  it("choisir un autre thème enregistre aussi les onglets Signature", () => {
    const [next] = edit(host =>
      (host.querySelector(".ed-themes .tt-nuit") as HTMLButtonElement).click(),
    );
    expect(resolveHeader(next).theme).toBe("nuit");
    expect(next.data.onglets!.length).toBeGreaterThan(3);
  });
});
