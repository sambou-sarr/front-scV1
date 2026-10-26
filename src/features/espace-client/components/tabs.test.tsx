// @vitest-environment jsdom
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TAB_TYPES, planOf } from "../../../lib/plans";
import type { Onglet, TabType } from "../../../types";
import { FICHES } from "../../../test/fixtures/fiches";
import Editor from "./Editor";
import Fiche from "./Fiche";
import ContentEditor, { isEditable } from "./editor/ContentEditor";
import SectionBody from "./fiche/SectionBody";

/*
  Tests de non-régression de rendu : chaque type d'onglet doit se rendre, dans l'éditeur comme
  sur la fiche publique, pour chaque fiche de démonstration. Ils protègent le découpage en
  `editor/tabs/*` et `fiche/views/*` (un oubli dans un registre fait aussi échouer le typecheck).
*/
const render = (
  el: Parameters<typeof h>[0] extends never ? never : ReturnType<typeof h>,
) => renderToString(h(MemoryRouter, null, el));
const noop = () => {};
const types = Object.keys(TAB_TYPES) as TabType[];
const tabOf = (type: TabType): Onglet => ({
  id: `t-${type}`,
  type,
  visible: true,
  titre: "Titre",
  contenu: "Contenu",
});

describe.each(FICHES.map(f => [f.slug, f] as const))(
  "fiche %s",
  (_slug, fiche) => {
    it("rend la fiche publique et l'éditeur complets", () => {
      expect(render(h(Fiche, { fiche })).length).toBeGreaterThan(0);
      expect(
        render(h(Editor, { fiche, onChange: noop })).length,
      ).toBeGreaterThan(0);
    });

    it.each(types)("rend la vue publique de l'onglet %s", type => {
      expect(() =>
        render(h(SectionBody, { tab: tabOf(type), fiche })),
      ).not.toThrow();
    });

    it.each(types)("rend l'éditeur de l'onglet %s", type => {
      const tab = tabOf(type);
      const props = {
        tab,
        fiche,
        plan: planOf(fiche),
        up: noop,
        upD: noop,
        setTabs: noop,
        tabs: [tab],
      };
      expect(() => render(h(ContentEditor, props))).not.toThrow();
    });
  },
);

describe("registres", () => {
  it("tous les types d'onglets sont éditables", () => {
    expect(types.filter(t => !isEditable(t))).toEqual([]);
  });
});
