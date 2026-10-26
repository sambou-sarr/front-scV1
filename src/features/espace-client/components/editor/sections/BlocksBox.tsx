import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRef, useState } from "react";
import { TAB_TYPES, newId } from "../../../../../lib/plans";
import type {
  FicheData,
  FicheRecord,
  Onglet,
  Plan,
  TabType,
} from "../../../../../types";
import { I } from "../../fiche/Icon";
import ContentEditor, { isEditable } from "../ContentEditor";
import { Lock } from "../shared";
import { tabsOf } from "../tabsOf";
import { useDnD } from "../useDnD";

interface Props {
  fiche: FicheRecord;
  plan: Plan;
  sig: boolean;
  up: (patch: Partial<FicheRecord>) => void;
  upD: (patch: Partial<FicheData>) => void;
}

/** « Blocs de ma page » : liste ordonnable des onglets, panneau d'édition et palette (Signature). */
export default function BlocksBox({ fiche, plan, sig, up, upD }: Props) {
  const [sel, setSel] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const latest = useRef(fiche);
  latest.current = fiche;
  const tabs = tabsOf(fiche);
  const setTabs = (t: Onglet[]) => upD({ onglets: t });
  const customCount = tabs.filter(t => t.type === "texte").length;
  const palette = (Object.keys(TAB_TYPES) as TabType[]).filter(
    k =>
      plan.tabs.includes(k) &&
      (k === "texte"
        ? customCount < (plan.maxCustomTabs || 0)
        : !tabs.some(t => t.type === k)),
  );
  const mk = (type: TabType): Onglet => ({
    id: newId(type),
    type,
    visible: true,
    ...(type === "texte" ? { titre: "Nouvel onglet", contenu: "" } : {}),
  });

  const [drag, start] = useDnD(listRef, d => {
    const cur = tabsOf(latest.current);
    if (d.kind === "new") {
      if (!d.moved) {
        upD({ onglets: [...cur, mk(d.type)] });
        return;
      }
      if (d.over == null) return;
      const t = [...cur];
      t.splice(d.over, 0, mk(d.type));
      upD({ onglets: t });
    } else if (d.over != null && d.moved) {
      const from = cur.findIndex(x => x.id === d.id);
      let to = d.over;
      if (to > from) to -= 1;
      if (from < 0 || to === from) return;
      const t = [...cur];
      const [m] = t.splice(from, 1);
      t.splice(to, 0, m);
      upD({ onglets: t });
    }
  });
  const keyMove =
    (i: number) => (ev: ReactKeyboardEvent<HTMLButtonElement>) => {
      const j =
        ev.key === "ArrowUp" ? i - 1 : ev.key === "ArrowDown" ? i + 1 : null;
      if (j === null || j < 0 || j >= tabs.length) return;
      ev.preventDefault();
      const t = [...tabs];
      [t[i], t[j]] = [t[j], t[i]];
      setTabs(t);
    };
  return (
    <details open className="ed-box">
      <summary>Blocs de ma page</summary>
      {!plan.canReorder && (
        <Lock to="Pro">
          L’Essentielle affiche Présentation, Réseaux et Localisation.
          Glisser-déposer, galerie, produits et avis : dès la Pro.
        </Lock>
      )}
      {plan.canReorder && (
        <p className="ed-hint">
          <I n="drag" s={14} /> Faites glisser la poignée pour changer l’ordre
          {sig ? ", ou glissez un bloc de la palette dans la page." : "."}
        </p>
      )}
      <ul className={`ed-tabs${drag ? " dragging" : ""}`} ref={listRef}>
        {tabs.map((t, i) => (
          <li
            key={t.id}
            data-row
            className={`${sel === t.id ? "sel " : ""}${drag?.over === i && drag.moved ? "drop-before " : ""}${drag?.id === t.id && drag.moved ? "ghosted" : ""}`}
          >
            <div className="ed-tab-h">
              {plan.canReorder && (
                <button
                  className="ed-handle"
                  aria-label={`Déplacer ${t.titre || TAB_TYPES[t.type].label} (flèches haut et bas)`}
                  onPointerDown={ev =>
                    start(ev, {
                      kind: "move",
                      id: t.id,
                      label: t.titre || TAB_TYPES[t.type].label,
                    })
                  }
                  onKeyDown={keyMove(i)}
                >
                  <I n="drag" s={16} />
                </button>
              )}
              <span className="ed-ic">
                <I n={TAB_TYPES[t.type].icon} s={14} />
              </span>
              {plan.canRename ? (
                <input
                  className="ed-title"
                  value={t.titre ?? TAB_TYPES[t.type].label}
                  onChange={ev =>
                    setTabs(
                      tabs.map(x =>
                        x.id === t.id ? { ...x, titre: ev.target.value } : x,
                      ),
                    )
                  }
                  aria-label="Titre du bloc"
                />
              ) : (
                <b>{TAB_TYPES[t.type].label}</b>
              )}
              {plan.canHide && (
                <label className="ed-tg" title="Afficher">
                  <input
                    type="checkbox"
                    checked={t.visible !== false}
                    onChange={ev =>
                      setTabs(
                        tabs.map(x =>
                          x.id === t.id
                            ? { ...x, visible: ev.target.checked }
                            : x,
                        ),
                      )
                    }
                  />
                  <span />
                </label>
              )}
              {isEditable(t.type) && (
                <button
                  className="ed-edit"
                  onClick={() => setSel(sel === t.id ? null : t.id)}
                >
                  {sel === t.id ? "Fermer" : "Modifier"}
                </button>
              )}
              {plan.canAdd && (
                <button
                  className="ed-del"
                  onClick={() => setTabs(tabs.filter(x => x.id !== t.id))}
                  aria-label="Retirer le bloc"
                >
                  ×
                </button>
              )}
            </div>
            {sel === t.id && (
              <ContentEditor
                tab={t}
                fiche={fiche}
                plan={plan}
                up={up}
                upD={upD}
                setTabs={setTabs}
                tabs={tabs}
              />
            )}
          </li>
        ))}
        {drag?.moved && drag.over === tabs.length && (
          <li className="ed-drop-end" />
        )}
      </ul>
      {sig ? (
        <div className="ed-pal">
          <p className="ed-k">Palette : glissez un bloc dans la page</p>
          <div className="ed-pal-l">
            {palette.map(k => (
              <button
                key={k}
                className="ed-chip"
                onPointerDown={ev =>
                  start(ev, {
                    kind: "new",
                    type: k,
                    label: TAB_TYPES[k].label,
                  })
                }
              >
                <I n={TAB_TYPES[k].icon} s={14} />
                {TAB_TYPES[k].label}
                <I n="plus" s={12} />
              </button>
            ))}
            {!palette.length && (
              <small>Tous les blocs sont déjà sur la page.</small>
            )}
          </div>
          <small>
            {customCount}/{plan.maxCustomTabs} onglets personnalisés
          </small>
        </div>
      ) : fiche.formule === "pro" ? (
        <Lock>
          Ajouter des blocs (menu vidéo, biens immobiliers, rendez-vous,
          formulaire, texte libre) : en Signature.
        </Lock>
      ) : null}
      {drag?.moved && (
        <div className="ed-ghost" style={{ left: drag.x, top: drag.y }}>
          <I n={drag.kind === "new" ? "plus" : "drag"} s={14} />
          {drag.label}
        </div>
      )}
    </details>
  );
}
