import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Abonnement, Formule } from "../../../types/admin";
import { adminApi } from "../admin.service";
import {
  Badge,
  Btn,
  ConfirmModal,
  Empty,
  ErrorBox,
  Field,
  Icon,
  Loading,
  Modal,
  Seg,
  useAction,
} from "../components/ui";
import { useData } from "../hooks/useData";
import {
  FORMULES,
  FORMULE_TONE,
  SECTEURS,
  SUB_STATUS,
  fcfa,
  fdate,
  publicUrl,
} from "../lib/format";
import AdminNotFound from "./AdminNotFound";

type Dlg = null | "slug" | "activate" | "delete" | { cancel: Abonnement };
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");
const valable = (a: Abonnement) =>
  a.statut === "active" && (!a.fin || new Date(a.fin) > new Date());

/** Route /admin/fiches/:id : l'identifiant doit être un entier positif, sinon page introuvable. */
export default function FicheDetailPage() {
  const n = Number(useParams().id);
  return Number.isInteger(n) && n > 0 ? (
    <FicheDetail id={n} />
  ) : (
    <AdminNotFound />
  );
}

function FicheDetail({ id }: { id: number }) {
  const navigate = useNavigate();
  const [d, reload, err] = useData(() => adminApi.getFiche(id), [id]);
  const [dlg, setDlg] = useState<Dlg>(null);
  const run = useAction();
  if (err)
    return (
      <>
        <Link className="back" to="/admin/fiches">
          <Icon n="back" s={15} />
          Fiches
        </Link>
        <ErrorBox message={err} onRetry={reload} />
      </>
    );
  if (!d) return <Loading />;

  const { fiche, abonnements } = d;
  const courant = abonnements.find(valable) ?? null;
  const statut = str(fiche.statut);
  const suspendue = statut === "suspendue";
  const nomComplet = [str(fiche.prenom), str(fiche.nom)]
    .filter(Boolean)
    .join(" ");
  const titre = str(fiche.entreprise) || nomComplet || fiche.slug;
  const url = publicUrl(fiche.slug);
  const close = () => setDlg(null);
  const done = () => {
    close();
    reload();
  };
  const patch = (b: Parameters<typeof adminApi.updateFiche>[1], ok: string) =>
    run(() => adminApi.updateFiche(id, b), ok).then(r => {
      if (r) done();
    });

  const rows: [string, ReactNode][] = (
    [
      ["Nom", nomComplet],
      ["Entreprise", str(fiche.entreprise)],
      ["Fonction", str(fiche.fonction)],
      ["Activité", SECTEURS[str(fiche.secteur)] ?? str(fiche.secteur)],
      ["Téléphone", str(fiche.telephone)],
      ["WhatsApp", str(fiche.whatsapp)],
      ["E-mail", str(fiche.email)],
    ] as [string, ReactNode][]
  ).filter(([, v]) => v);

  return (
    <>
      <Link className="back" to="/admin/fiches">
        <Icon n="back" s={15} />
        Fiches
      </Link>
      <header className="ph row">
        <div>
          <p className="eyebrow">/{fiche.slug}</p>
          <h1>{titre}</h1>
          <p className="lede">
            {suspendue ? (
              <Badge tone="grey">Suspendue</Badge>
            ) : statut === "active" ? (
              <Badge tone="green">Active</Badge>
            ) : null}
            {courant ? (
              <Badge tone={FORMULE_TONE[courant.formule]}>
                {FORMULES[courant.formule]}
              </Badge>
            ) : (
              <Badge tone="red">Expirée</Badge>
            )}
            {typeof fiche.scansTotal === "number" && (
              <Badge>{fiche.scansTotal} scans</Badge>
            )}
          </p>
        </div>
        <div className="ph-actions">
          {url && (
            <a
              className="adm-btn adm-btn-ghost"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              <Icon n="ext" s={16} />
              Voir la fiche
            </a>
          )}
          <Btn
            kind="dark"
            onClick={() =>
              patch(
                { statut: suspendue ? "active" : "suspendue" },
                suspendue ? "Fiche réactivée" : "Fiche suspendue"
              )
            }
          >
            {suspendue ? "Réactiver" : "Suspendre"}
          </Btn>
        </div>
      </header>

      <section className="panel">
        <div className="panel-h">
          <h2>Coordonnées</h2>
        </div>
        {rows.length ? (
          <dl className="dl">
            {rows.map(([k, v]) => (
              <div key={k} className="dl-r">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Empty>Aucune coordonnée renseignée.</Empty>
        )}
      </section>

      <section className="panel">
        <div className="panel-h">
          <h2>Abonnements</h2>
          <Btn kind="red" icon="plus" onClick={() => setDlg("activate")}>
            Activer une formule
          </Btn>
        </div>
        {abonnements.length ? (
          <div className="table-wrap flat">
            <table className="adm-tbl adm-mini">
              <thead>
                <tr>
                  <th>Formule</th>
                  <th>Statut</th>
                  <th>Début</th>
                  <th>Fin</th>
                  <th>Montant</th>
                  <th>Référence</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {abonnements.map(a => {
                  const s = SUB_STATUS[a.statut] ?? {
                    label: a.statut,
                    tone: "grey",
                  };
                  return (
                    <tr key={a.id}>
                      <td data-l="Formule">
                        <Badge tone={FORMULE_TONE[a.formule]}>
                          {FORMULES[a.formule] ?? a.formule}
                        </Badge>
                      </td>
                      <td data-l="Statut">
                        <Badge tone={s.tone}>{s.label}</Badge>
                      </td>
                      <td data-l="Début">{fdate(a.debut)}</td>
                      <td data-l="Fin">
                        {a.fin ? fdate(a.fin) : "Sans échéance"}
                      </td>
                      <td data-l="Montant">{fcfa(a.montantFcfa)}</td>
                      <td data-l="Référence">{a.referencePaiement || "—"}</td>
                      <td>
                        {(a.statut === "active" || a.statut === "pending") && (
                          <Btn onClick={() => setDlg({ cancel: a })}>
                            Annuler
                          </Btn>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Aucun abonnement : la fiche apparaît comme expirée.</Empty>
        )}
      </section>

      <section className="panel danger">
        <div className="panel-h">
          <h2>Zone sensible</h2>
        </div>
        <p className="adm-muted">
          La suppression est définitive : contenus, médias et abonnements
          disparaissent avec la fiche.
        </p>
        <Btn icon="trash" onClick={() => setDlg("delete")}>
          Supprimer la fiche
        </Btn>
      </section>

      {dlg === "slug" && (
        <SlugModal
          slug={fiche.slug}
          onClose={close}
          onSave={slug => patch({ slug }, "Adresse modifiée")}
        />
      )}
      {dlg === "activate" && (
        <ActivateModal
          onClose={close}
          onSave={b =>
            run(
              () => adminApi.activateSubscription(id, b),
              "Formule activée"
            ).then(r => {
              if (r) done();
            })
          }
        />
      )}
      {dlg && typeof dlg === "object" && (
        <ConfirmModal
          title="Annuler cet abonnement ?"
          danger
          confirmLabel="Annuler l’abonnement"
          onClose={close}
          onConfirm={() =>
            run(
              () => adminApi.cancelSubscription(id, dlg.cancel.id),
              "Abonnement annulé"
            ).then(r => {
              if (r) done();
            })
          }
        >
          <p>
            Formule <b>{FORMULES[dlg.cancel.formule]}</b>. La fiche apparaîtra
            expirée tant qu’aucun autre abonnement n’est activé.
          </p>
        </ConfirmModal>
      )}
      {dlg === "delete" && (
        <DeleteModal
          slug={fiche.slug}
          onClose={close}
          onConfirm={() =>
            run(
              () => adminApi.deleteFiche(id, fiche.slug),
              "Fiche supprimée"
            ).then(r => {
              if (r) navigate("/admin/fiches");
            })
          }
        />
      )}
    </>
  );
}

function SlugModal({
  slug,
  onClose,
  onSave,
}: {
  slug: string;
  onClose: () => void;
  onSave: (s: string) => void;
}) {
  const [v, setV] = useState(slug);
  return (
    <Modal title="Modifier l’adresse" onClose={onClose}>
      <form
        className="form"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSave(v.trim());
        }}
      >
        <Field
          label="Adresse (slug)"
          hint="L’adresse sera verrouillée après la création du compte client."
        >
          <input
            autoFocus
            required
            minLength={3}
            maxLength={60}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            value={v}
            onChange={e => setV(e.target.value)}
          />
        </Field>
        <div className="form-a">
          <Btn onClick={onClose}>Annuler</Btn>
          <button
            className="adm-btn adm-btn-red"
            type="submit"
            disabled={v.trim() === slug}
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ActivateModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (b: Parameters<typeof adminApi.activateSubscription>[1]) => void;
}) {
  const [plan, setPlan] = useState<Formule>("pro"),
    [mode, setMode] = useState<"duree" | "sans" | "date">("duree");
  const [date, setDate] = useState(""),
    [amount, setAmount] = useState(""),
    [ref, setRef] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      plan,
      endsAt: mode === "duree" ? undefined : mode === "sans" ? null : date,
      amountFcfa: amount === "" ? undefined : Number(amount),
      paymentRef: ref.trim() || undefined,
    });
  };
  return (
    <Modal title="Activer une formule" onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <p className="note-gold">
          À utiliser après un paiement validé. L’abonnement actif actuel est
          annulé.
        </p>
        <Field label="Formule">
          <select
            value={plan}
            onChange={e => setPlan(e.target.value as Formule)}
          >
            {Object.entries(FORMULES).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <div className="field">
          <span className="field-l">Échéance</span>
          <Seg
            value={mode}
            onChange={setMode}
            options={[
              ["duree", "Durée de la formule"],
              ["sans", "Sans échéance"],
              ["date", "Date précise"],
            ]}
          />
          {mode === "date" && (
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          )}
        </div>
        <div className="f2">
          <Field label="Montant (F)" hint="Vide = prix de la formule">
            <input
              type="number"
              min={0}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </Field>
          <Field label="Référence de paiement">
            <input
              maxLength={100}
              placeholder="WAVE-…"
              value={ref}
              onChange={e => setRef(e.target.value)}
            />
          </Field>
        </div>
        <div className="form-a">
          <Btn onClick={onClose}>Annuler</Btn>
          <button className="adm-btn adm-btn-red" type="submit">
            Activer
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteModal({
  slug,
  onClose,
  onConfirm,
}: {
  slug: string;
  onClose: () => void;
  onConfirm: () => Promise<unknown> | void;
}) {
  const [v, setV] = useState("");
  return (
    <Modal title="Supprimer définitivement ?" onClose={onClose}>
      <form
        className="form"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          if (v === slug) void onConfirm();
        }}
      >
        <p>
          Pour confirmer, saisis l’adresse exacte de la fiche : <b>{slug}</b>
        </p>
        <input
          autoFocus
          value={v}
          onChange={e => setV(e.target.value)}
          placeholder={slug}
        />
        <div className="form-a">
          <Btn onClick={onClose}>Annuler</Btn>
          <button
            className="adm-btn adm-btn-red"
            type="submit"
            disabled={v !== slug}
          >
            Supprimer
          </button>
        </div>
      </form>
    </Modal>
  );
}
