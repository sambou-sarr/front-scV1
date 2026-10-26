import { useRef } from "react";
import {
  migrateLegacySignature,
  planOf,
  resolveHeader,
} from "../../../lib/plans";
import type { EnteteComplete, FicheData, FicheRecord } from "../../../types";
import "./Editor.css";
import AppearanceBox from "./editor/sections/AppearanceBox";
import BlocksBox from "./editor/sections/BlocksBox";
import IdentityBox from "./editor/sections/IdentityBox";
import PlanBanner from "./editor/sections/PlanBanner";
import QrBox from "./editor/sections/QrBox";
import StickerBox from "./editor/sections/StickerBox";
import TemplateBox from "./editor/sections/TemplateBox";

/*
  Espace client (back-office membre) : panneau d'édition d'une fiche.
  Ce fichier ne fait qu'assembler les sections ; chacune est dans `./editor/sections/`.
  Le contenu de chaque type d'onglet est édité par un composant dédié dans `./editor/tabs/`
  (registre : `./editor/ContentEditor.tsx`).

  - « Mon activité » : modèle de page par métier (restaurant, immobilier, commerce, hôtel, indépendant, beauté).
  - Blocs : glisser-déposer au doigt ou à la souris (Pro et Signature), flèches du clavier sur la poignée.
  - Signature : palette de blocs, renommer, supprimer, menu interactif, biens immobiliers, entête modulable.
  - Tout ce qui dépasse la formule est verrouillé et renvoie vers l'offre supérieure.
  Les images et vidéos sont envoyées au stockage via l'API avant d'être référencées dans la fiche.
*/
export default function Editor({
  fiche,
  onChange,
  previewSection = null,
  onPreviewSection,
}: {
  fiche: FicheRecord;
  onChange: (f: FicheRecord) => void;
  /** Section de sticker actuellement prévisualisée dans le téléphone (null = fiche complète). */
  previewSection?: string | null;
  onPreviewSection?: (key: string | null) => void;
}) {
  const plan = planOf(fiche);
  const sig = fiche.formule === "signature";
  // `latest` évite d'écraser une modification précédente quand deux mises à jour s'enchaînent.
  const latest = useRef(fiche);
  latest.current = fiche;
  // Fiche Signature encore à l'ancien modèle (upgrade) : la première modification enregistre aussi ce qui est
  // affiché (onglets et entête Signature), pour que les choix suivants soient respectés.
  const up = (patch: Partial<FicheRecord>) => {
    const migration = migrateLegacySignature(latest.current);
    onChange({
      ...latest.current,
      ...patch,
      ...(migration ? { data: { ...latest.current.data, ...migration } } : {}),
    });
  };
  const upD = (patch: Partial<FicheData>) =>
    onChange({
      ...latest.current,
      data: {
        ...latest.current.data,
        ...migrateLegacySignature(latest.current),
        ...patch,
      },
    });
  const entete: EnteteComplete = resolveHeader(fiche);
  const setE = (patch: Partial<EnteteComplete>) =>
    upD({ entete: { ...entete, ...patch } });

  return (
    <div className="ed">
      <PlanBanner fiche={fiche} plan={plan} sig={sig} />
      <QrBox fiche={fiche} />
      <StickerBox
        fiche={fiche}
        previewSection={previewSection}
        onPreviewSection={onPreviewSection}
      />
      <TemplateBox
        fiche={fiche}
        plan={plan}
        sig={sig}
        entete={entete}
        upD={upD}
      />
      <BlocksBox fiche={fiche} plan={plan} sig={sig} up={up} upD={upD} />
      <IdentityBox fiche={fiche} up={up} />
      <AppearanceBox fiche={fiche} sig={sig} entete={entete} setE={setE} />
    </div>
  );
}
