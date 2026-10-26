import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/*
  Garde-fou : les données fictives n'existent que pour les tests (src/test/fixtures).
  Si du code applicatif les importe, elles repartent dans le bundle de production.
*/
const SRC = join(__dirname, "..");
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
const appFiles = walk(SRC).filter(
  f =>
    /\.tsx?$/.test(f) &&
    !/\.test\.tsx?$/.test(f) &&
    !relative(SRC, f).startsWith("test"),
);

describe("pas de données fictives dans le code applicatif", () => {
  it.each([
    ["importe les fixtures de test", /test\/fixtures/],
    ["utilise le mode démo (VITE_USE_MOCK_FICHES)", /VITE_USE_MOCK/],
    ["référence un module mock", /mock(Fiches|Source)|MOCK_FICHES/],
  ])("aucun fichier ne %s", (_label, pattern) => {
    const offenders = appFiles
      .filter(f => pattern.test(readFileSync(f, "utf8")))
      .map(f => relative(SRC, f));
    expect(offenders).toEqual([]);
  });
});
