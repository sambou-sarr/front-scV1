import { useState } from "react";
import { adminApi, type AdminActionLog } from "../admin.service";
import { Empty, ErrorBox, Loading, Pager } from "../components/ui";
import { useData } from "../hooks/useData";

const ACTION_NAMES: Record<string, string> = {
  "/admin/settings": "Paramètres de l’application",
  "/admin/formules": "Réglages des formules",
  "/admin/formules/emplacements": "Réglages des emplacements",
  "/auth/me": "Profil administrateur",
  "/auth/me/password": "Mot de passe administrateur",
};

const METHOD_NAMES: Record<string, string> = {
  POST: "Création / action",
  PUT: "Remplacement",
  PATCH: "Modification",
  DELETE: "Suppression",
};

function actionLabel(log: AdminActionLog) {
  const known = ACTION_NAMES[log.path];
  if (known) return known;

  const fiche = /^\/admin\/fiches\/(\d+)(?:\/(.*))?$/.exec(log.path);
  if (fiche) {
    if (fiche[2]?.startsWith("subscription")) return "Abonnement de fiche";
    return `Fiche #${fiche[1]}`;
  }

  const user = /^\/admin\/users\/(\d+)(?:\/(.*))?$/.exec(log.path);
  if (user) {
    if (user[2] === "status") return `Statut de l’administrateur #${user[1]}`;
    if (user[2] === "invitation")
      return `Invitation de l’administrateur #${user[1]}`;
    return `Administrateur #${user[1]}`;
  }

  if (log.path === "/admin/users/admin") return "Invitation d’un administrateur";
  return log.path.replace(/^\/admin\//, "").replace(/\//g, " · ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminActionLogs() {
  const [page, setPage] = useState(1);
  const [data, reload, error] = useData(
    () => adminApi.listActionLogs({ page, limit: 25 }),
    [page]
  );

  return (
    <>
      <header className="ph">
        <p className="eyebrow">Traçabilité</p>
        <h1>Journal d’activité</h1>
        <p className="lede">
          Historique des modifications effectuées par les administrateurs. Les
          données des formulaires et mots de passe ne sont pas enregistrées.
        </p>
      </header>
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data ? (
        <Loading />
      ) : data.items.length ? (
        <>
          <div className="table-wrap">
            <table className="adm-tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Administrateur</th>
                  <th>Action</th>
                  <th>Résultat</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(log => (
                  <tr key={log.id}>
                    <td data-l="Date">{formatDate(log.createdAt)}</td>
                    <td data-l="Administrateur">
                      <b>{log.adminName || log.adminEmail}</b>
                      {log.adminName && <small>{log.adminEmail}</small>}
                    </td>
                    <td data-l="Action">
                      <b>{actionLabel(log)}</b>
                      <small>
                        {METHOD_NAMES[log.method] ?? log.method} · {log.path}
                      </small>
                    </td>
                    <td data-l="Résultat">
                      <span className="badge b-green">{log.statusCode}</span>
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
            noun="action"
            onPage={setPage}
          />
        </>
      ) : (
        <Empty>Aucune action enregistrée pour le moment.</Empty>
      )}
    </>
  );
}
