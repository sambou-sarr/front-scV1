import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminApi } from "../admin.service";
import {
  Badge,
  Empty,
  ErrorBox,
  Icon,
  Loading,
  Pager,
} from "../components/ui";
import { useData, useDebounced } from "../hooks/useData";
import { FORMULES, FORMULE_TONE, fcfa, fdate } from "../lib/format";
import type {
  AbonnementStatut,
  AdminAbonnement,
  AdminPaiement,
  PaiementStatut,
} from "../../../types/admin";

type View = "subscriptions" | "payments";
type BillingData =
  | (Awaited<ReturnType<typeof adminApi.listSubscriptions>> & {
      view: "subscriptions";
    })
  | (Awaited<ReturnType<typeof adminApi.listPayments>> & {
      view: "payments";
    });
const SUB_STATUSES: Record<AbonnementStatut, { label: string; tone: string }> = {
  pending: { label: "En attente", tone: "gold" },
  active: { label: "Actif", tone: "green" },
  expired: { label: "Expiré", tone: "red" },
  canceled: { label: "Annulé", tone: "grey" },
};
const PAYMENT_STATUSES: Record<PaiementStatut, { label: string; tone: string }> =
  {
    pending: { label: "En attente", tone: "gold" },
    succeeded: { label: "Réussi", tone: "green" },
    failed: { label: "Échoué", tone: "red" },
    cancelled: { label: "Annulé", tone: "grey" },
  };

export default function Billing() {
  const [params, setParams] = useSearchParams();
  const view: View =
    params.get("view") === "payments" ? "payments" : "subscriptions";
  const paymentId = Number(params.get("paymentId")) || undefined;
  const subscriptionId = Number(params.get("subscriptionId")) || undefined;
  const [text, setText] = useState("");
  const [formule, setFormule] = useState("");
  const [statut, setStatut] = useState("");
  const [ficheSupprimee, setFicheSupprimee] = useState<"" | "oui" | "non">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const search = useDebounced(text.trim(), 300);

  useEffect(() => {
    setPage(1);
  }, [search, formule, statut, ficheSupprimee, from, to]);

  const [data, reload, err] = useData<BillingData>(
    async () => {
      if (view === "subscriptions") {
        const result = await adminApi.listSubscriptions({
          search: subscriptionId ? undefined : search || undefined,
          formule: formule || undefined,
          statut: statut || undefined,
          ficheSupprimee: ficheSupprimee || undefined,
          from: from || undefined,
          to: to || undefined,
          subscriptionId,
          page,
          limit: 20,
        });
        return { ...result, view };
      }
      const result = await adminApi.listPayments({
        search: paymentId ? undefined : search || undefined,
        formule: formule || undefined,
        statut: statut || undefined,
        ficheSupprimee: ficheSupprimee || undefined,
        from: from || undefined,
        to: to || undefined,
        paymentId,
        page,
        limit: 20,
      });
      return { ...result, view };
    },
    [
      view,
      search,
      formule,
      statut,
      ficheSupprimee,
      from,
      to,
      page,
      paymentId,
      subscriptionId,
    ],
  );

  const resetFilters = () => {
    setText("");
    setFormule("");
    setStatut("");
    setFicheSupprimee("");
    setFrom("");
    setTo("");
    setPage(1);
  };
  const focusPayment = (id: number) => {
    resetFilters();
    setParams({ view: "payments", paymentId: String(id) });
  };
  const focusSubscription = (id: number) => {
    resetFilters();
    setParams({ subscriptionId: String(id) });
  };
  const changeView = (next: View) => {
    resetFilters();
    setParams(next === "payments" ? { view: next } : {});
  };
  const clearPaymentFocus = () => setParams({ view: "payments" });

  return (
    <>
      <header className="ph">
        <p className="eyebrow">Gestion financière</p>
        <h1>Abonnements &amp; paiements</h1>
        <p className="lede">
          Consultez l’historique des formules et des transactions. Chaque
          abonnement mène à son paiement associé lorsqu’il est disponible.
        </p>
      </header>

      <div className="adm-tabs" role="tablist" aria-label="Type d’historique">
        <button
          type="button"
          role="tab"
          aria-selected={view === "subscriptions"}
          className={view === "subscriptions" ? "on" : ""}
          onClick={() => changeView("subscriptions")}
        >
          Abonnements
          {view === "subscriptions" &&
            data?.view === "subscriptions" && (
              <em>{data.pagination.total}</em>
            )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "payments"}
          className={view === "payments" ? "on" : ""}
          onClick={() => changeView("payments")}
        >
          Paiements
          {view === "payments" && data?.view === "payments" && (
            <em>{data.pagination.total}</em>
          )}
        </button>
      </div>

      {view === "payments" && paymentId && (
        <p className="note-gold">
          Paiement associé à l’abonnement · référence #{paymentId}{" "}
          <button className="link" onClick={clearPaymentFocus}>
            Afficher tous les paiements
          </button>
        </p>
      )}
      {view === "subscriptions" && subscriptionId && (
        <p className="note-gold">
          Abonnement associé au paiement · #{subscriptionId}{" "}
          <button className="link" onClick={() => setParams({})}>
            Afficher tous les abonnements
          </button>
        </p>
      )}

      <div className="filters">
        <label className="search">
          <Icon n="search" />
          <input
            placeholder="Fiche, client ou référence…"
            value={text}
            onChange={event => setText(event.target.value)}
            aria-label="Rechercher dans les abonnements et paiements"
          />
        </label>
        <select
          value={formule}
          onChange={event => setFormule(event.target.value)}
          aria-label="Filtrer par formule"
        >
          <option value="">Toutes les formules</option>
          {Object.entries(FORMULES).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={statut}
          onChange={event => setStatut(event.target.value)}
          aria-label="Filtrer par statut"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(
            view === "subscriptions" ? SUB_STATUSES : PAYMENT_STATUSES,
          ).map(([id, item]) => (
            <option key={id} value={id}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          value={ficheSupprimee}
          onChange={event => {
            const value = event.target.value;
            if (value === "" || value === "oui" || value === "non") {
              setFicheSupprimee(value);
            }
          }}
          aria-label="Filtrer par état de la fiche"
        >
          <option value="">Toutes les fiches</option>
          <option value="non">Fiches existantes</option>
          <option value="oui">Fiches supprimées</option>
        </select>
        <label className="billing-date">
          <span>Du</span>
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={event => setFrom(event.target.value)}
            aria-label="Date de début"
          />
        </label>
        <label className="billing-date">
          <span>Au</span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={event => setTo(event.target.value)}
            aria-label="Date de fin"
          />
        </label>
      </div>

      {err ? (
        <ErrorBox message={err} onRetry={reload} />
      ) : !data || data.view !== view ? (
        <Loading />
      ) : data.items.length === 0 ? (
        <Empty>
          {paymentId
            ? "Aucun paiement associé trouvé."
            : view === "subscriptions"
              ? "Aucun abonnement ne correspond aux filtres."
              : "Aucun paiement ne correspond aux filtres."}
        </Empty>
      ) : (
        <>
          {data.view === "subscriptions" ? (
            <SubscriptionTable
              items={data.items}
              onPayment={focusPayment}
            />
          ) : (
            <PaymentTable
              items={data.items}
              onSubscription={focusSubscription}
            />
          )}
          <Pager
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            noun={view === "subscriptions" ? "abonnement" : "paiement"}
            onPage={setPage}
          />
        </>
      )}
    </>
  );
}

function SubscriptionTable({
  items,
  onPayment,
}: {
  items: AdminAbonnement[];
  onPayment: (id: number) => void;
}) {
  return (
    <div className="table-wrap">
      <table className="adm-tbl">
        <thead>
          <tr>
            <th>Fiche / client</th>
            <th>Formule</th>
            <th>Statut</th>
            <th>Début · fin</th>
            <th>Montant</th>
            <th>Paiement</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td data-l="Fiche / client">
                {item.fiche.id ? (
                  <Link to={`/admin/fiches/${item.fiche.id}`}>
                    <b>{item.fiche.entreprise || item.fiche.nom}</b>
                    <small>{item.fiche.email || `/${item.fiche.slug}`}</small>
                  </Link>
                ) : (
                  <>
                    <b>{item.fiche.nom}</b>
                    <small>
                      Fiche supprimée
                      {item.fiche.slug ? ` · /${item.fiche.slug}` : ""}
                    </small>
                  </>
                )}
              </td>
              <td data-l="Formule">
                <Badge tone={FORMULE_TONE[item.formule]}>
                  {FORMULES[item.formule]}
                </Badge>
              </td>
              <td data-l="Statut">
                <Badge tone={SUB_STATUSES[item.statut].tone}>
                  {SUB_STATUSES[item.statut].label}
                </Badge>
              </td>
              <td data-l="Début · fin">
                {fdate(item.debut)}
                <small>Fin : {fdate(item.fin)}</small>
              </td>
              <td data-l="Montant">{fcfa(item.montantFcfa)}</td>
              <td data-l="Paiement">
                {item.paiementId ? (
                  <button
                    className="adm-btn adm-btn-ghost"
                    onClick={() => {
                      if (item.paiementId) onPayment(item.paiementId);
                    }}
                  >
                    <Icon n="ext" s={15} />
                    Voir paiement
                  </button>
                ) : (
                  <span className="adm-muted small">Non associé</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentTable({
  items,
  onSubscription,
}: {
  items: AdminPaiement[];
  onSubscription: (id: number) => void;
}) {
  return (
    <div className="table-wrap">
      <table className="adm-tbl">
        <thead>
          <tr>
            <th>Fiche / client</th>
            <th>Formule</th>
            <th>Statut</th>
            <th>Fournisseur · date</th>
            <th>Montant</th>
            <th>Référence / abonnement</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td data-l="Fiche / client">
                {item.fiche.id ? (
                  <Link to={`/admin/fiches/${item.fiche.id}`}>
                    <b>{item.fiche.entreprise || item.fiche.nom}</b>
                    <small>{item.fiche.email || `/${item.fiche.slug}`}</small>
                  </Link>
                ) : (
                  <>
                    <b>{item.fiche.nom}</b>
                    <small>
                      Fiche supprimée
                      {item.fiche.slug ? ` · /${item.fiche.slug}` : ""}
                    </small>
                  </>
                )}
              </td>
              <td data-l="Formule">
                <Badge tone={FORMULE_TONE[item.formule]}>
                  {FORMULES[item.formule]}
                </Badge>
              </td>
              <td data-l="Statut">
                <Badge tone={PAYMENT_STATUSES[item.statut].tone}>
                  {PAYMENT_STATUSES[item.statut].label}
                </Badge>
                {item.motifEchec && <small>{item.motifEchec}</small>}
              </td>
              <td data-l="Fournisseur · date">
                {item.fournisseur.replace(/_/g, " ")}
                <small>{fdate(item.createdAt)}</small>
              </td>
              <td data-l="Montant">{fcfa(item.montantFcfa)}</td>
              <td data-l="Référence / abonnement">
                <b>{item.reference || `Paiement #${item.id}`}</b>
                {item.abonnementId ? (
                  <button
                    className="link"
                    onClick={() => {
                      if (item.abonnementId) onSubscription(item.abonnementId);
                    }}
                  >
                    Abonnement #{item.abonnementId}
                  </button>
                ) : (
                  <small>Sans abonnement associé</small>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
