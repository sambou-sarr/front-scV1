import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { adminApi } from "../admin.service";
import {
  Badge,
  Empty,
  ErrorBox,
  Icon,
  Loading,
  Pager,
  useAction,
} from "../components/ui";
import { useData, useDebounced } from "../hooks/useData";
import { fdate } from "../lib/format";
import type { LeadRequest, LeadStatus } from "../../../types/admin";

const STATUS: Record<LeadStatus, { label: string; tone: string }> = {
  NEW: { label: "Nouvelle", tone: "gold" },
  CONTACTED: { label: "Contactée", tone: "green" },
  CLOSED: { label: "Clôturée", tone: "grey" },
};

export default function Leads() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [page, setPage] = useState(1);
  const search = useDebounced(text.trim(), 300);
  const run = useAction();
  useEffect(() => setPage(1), [search, status]);
  const [data, reload, err] = useData(
    () =>
      adminApi.listLeads({
        search: search || undefined,
        status: status || undefined,
        page,
        limit: 20,
      }),
    [search, status, page],
  );

  const changeStatus = (lead: LeadRequest, next: LeadStatus) => {
    if (next === lead.status) return;
    void run(
      () => adminApi.updateLeadStatus(lead.id, next),
      "Statut de la demande mis à jour",
    ).then((result) => result && reload());
  };

  return (
    <>
      <header className="ph">
        <p className="eyebrow">Suivi commercial</p>
        <h1>Demandes</h1>
        <p className="lede">
          Devis, questions et demandes de maquette envoyés depuis les pages
          publiques.
        </p>
      </header>
      <div className="filters">
        <label className="search">
          <Icon n="search" />
          <input
            placeholder="Nom, entreprise, e-mail ou téléphone…"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        <select
          value={status}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            setStatus(event.target.value as LeadStatus | "")
          }
          aria-label="Statut de la demande"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS).map(([value, item]) => (
            <option key={value} value={value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      {err ? (
        <ErrorBox message={err} onRetry={reload} />
      ) : !data ? (
        <Loading />
      ) : data.items.length ? (
        <>
          <div className="table-wrap">
            <table className="adm-tbl">
              <thead>
                <tr>
                  <th>Reçue</th>
                  <th>Demande</th>
                  <th>Contact</th>
                  <th>Prestations</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((lead) => (
                  <tr key={lead.id}>
                    <td data-l="Reçue">{fdate(lead.createdAt)}</td>
                    <td data-l="Demande">
                      <b>{lead.name}</b>
                      {lead.company && <small>{lead.company}</small>}
                      <small>{lead.intentLabel}</small>
                      {lead.message && (
                        <details className="lead-message">
                          <summary>Voir le message</summary>
                          <p>{lead.message}</p>
                        </details>
                      )}
                      {lead.design && (
                        <details className="lead-message">
                          <summary>Détails de la maquette</summary>
                          <dl>
                            {Object.entries(lead.design).map(([key, value]) => (
                              <div key={key}>
                                <dt>{key.replace(/_/g, " ")}</dt>
                                <dd>{String(value)}</dd>
                              </div>
                            ))}
                          </dl>
                        </details>
                      )}
                    </td>
                    <td data-l="Contact">
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                      )}
                      {lead.email && (
                        <a href={`mailto:${lead.email}`}>{lead.email}</a>
                      )}
                      {lead.city && <small>{lead.city}</small>}
                      {lead.prefer && <small>Préférence : {lead.prefer}</small>}
                    </td>
                    <td data-l="Prestations">
                      {lead.products.length ? lead.products.join(", ") : "—"}
                      {lead.sector && <small>{lead.sector}</small>}
                    </td>
                    <td data-l="Statut">
                      <Badge tone={STATUS[lead.status].tone}>
                        {STATUS[lead.status].label}
                      </Badge>
                      <select
                        value={lead.status}
                        aria-label={`Statut de la demande ${lead.id}`}
                        onChange={(event) =>
                          changeStatus(
                            lead,
                            event.target.value as LeadStatus,
                          )
                        }
                      >
                        {Object.entries(STATUS).map(([value, item]) => (
                          <option key={value} value={value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            noun="demande"
            onPage={setPage}
          />
        </>
      ) : (
        <Empty>Aucune demande pour ces critères.</Empty>
      )}
    </>
  );
}
