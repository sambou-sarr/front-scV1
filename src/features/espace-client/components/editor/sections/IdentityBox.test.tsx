// @vitest-environment jsdom
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FICHES } from "../../../../../test/fixtures/fiches";
import IdentityBox from "./IdentityBox";

vi.mock("../shared", () => ({
  imageInput: (_ficheId: number, onUploaded: (url: string) => void) => () =>
    onUploaded("https://cdn.exemple.sn/couverture.webp"),
}));

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("IdentityBox", () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    host = document.createElement("div");
    root = createRoot(host);
  });
  afterEach(() => act(() => root.unmount()));

  it("permet d'ajouter la couverture depuis Identité sur une fiche Essentielle", () => {
    const fiche = {
      ...structuredClone(FICHES.find(item => item.formule === "essentielle")!),
    };
    const setE = vi.fn();

    act(() =>
      root.render(
        h(IdentityBox, {
          fiche,
          up: vi.fn(),
          entete: {
            disposition: "portrait",
            taille: "m",
            theme: "bleu",
          },
          setE,
        }),
      ),
    );

    const coverInput = host.querySelector(
      ".ed-file.wide input[type=file]",
    ) as HTMLInputElement;
    expect(host.textContent).toContain("Photo de couverture de l'entête");
    act(() =>
      coverInput.dispatchEvent(new Event("change", { bubbles: true })),
    );

    expect(setE).toHaveBeenCalledWith({
      couverture: "https://cdn.exemple.sn/couverture.webp",
    });
  });
});
