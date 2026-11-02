import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { errMsg } from "../../../lib/apiError";
import { CONTACT } from "../../../data/apropos";
import { useClientUser } from "../layout/useClientUser";
import {
  getClientPayments,
  type ClientPayment,
} from "../espaceClient.service";

const STATUS: Record<
  ClientPayment["statut"],
  { label: string; tone: string }
> = {
  pending: { label: "En attente", tone: "border-amber-200 bg-amber-50 text-amber-800" },
  succeeded: { label: "Payé", tone: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  failed: { label: "Échoué", tone: "border-rose-200 bg-rose-50 text-rose-800" },
  cancelled: { label: "Annulé", tone: "border-stone-200 bg-stone-100 text-stone-700" },
};

const amount = (payment: ClientPayment) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: payment.devise,
    maximumFractionDigits: 0,
  }).format(payment.montantFcfa);

const date = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export default function PaymentsPage() {
  const user = useClientUser();
  const [page, setPage] = useState(1);
  const [receipt, setReceipt] = useState<ClientPayment | null>(null);
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["clientPayments", page],
    queryFn: ({ signal }) => getClientPayments(page, 20, signal),
  });

  useEffect(() => {
    document.title = "Mes paiements — Support Connecté";
  }, []);

  return (
    <div className="min-h-full bg-transparent px-4 py-6 text-[#111111] sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-7">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#EF1733]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EF1733]" />
            Espace client
          </div>
          <h1 className="font-[Cormorant_Garamond,Georgia,serif] text-4xl font-semibold tracking-tight text-[#08090A] sm:text-5xl">
            Mes paiements
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d665d] sm:text-base">
            Retrouvez les règlements effectués pour vos fiches et téléchargez
            leur reçu.
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-[#8d8a85]">
            Les factures seront disponibles après ajout des coordonnées légales
            de l’émetteur et des informations de facturation de votre compte.
          </p>
        </header>

        <section
          aria-label="Historique des paiements"
          className="overflow-hidden rounded-2xl border border-[#e3dfd8] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
        >
          {isPending ? (
            <div className="px-6 py-16 text-center text-sm text-[#6d665d]" aria-busy="true">
              Chargement de vos paiements…
            </div>
          ) : isError ? (
            <div className="px-6 py-12 text-center" role="alert">
              <p className="font-semibold text-[#111111]">
                Impossible de charger vos paiements
              </p>
              <p className="mt-2 text-sm text-[#6d665d]">{errMsg(error)}</p>
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="mt-4 rounded-xl bg-[#08090A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isFetching ? "Chargement…" : "Réessayer"}
              </button>
            </div>
          ) : !data?.items.length ? (
            <div className="px-6 py-14 text-center">
              <div
                className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f4f1eb] text-2xl"
                aria-hidden="true"
              >
                ▤
              </div>
              <h2 className="mt-4 font-semibold text-[#111111]">
                Aucun paiement pour le moment
              </h2>
              <p className="mt-1 text-sm text-[#6d665d]">
                Vos paiements apparaîtront ici après leur confirmation.
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-[#eee9e1] px-5 py-4 sm:px-6">
                <p className="text-sm text-[#6d665d]">
                  {data.pagination.total} paiement
                  {data.pagination.total > 1 ? "s" : ""}
                </p>
              </div>
              <div className="divide-y divide-[#eee9e1]">
                {data.items.map(payment => {
                  const status = STATUS[payment.statut];
                  const settled = payment.statut === "succeeded";
                  return (
                    <article
                      key={payment.id}
                      className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-[#111111]">
                            {payment.formuleNom}
                          </h2>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${status.tone}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[#6d665d]">
                          {payment.fiche.entreprise ||
                            payment.fiche.nom ||
                            "Fiche"}{" "}
                          · {payment.dureeMois
                            ? `${payment.dureeMois} mois`
                            : "Sans durée"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8d8a85]">
                          <span>
                            {date(payment.payeLe ?? payment.createdAt)}
                          </span>
                          {payment.reference && (
                            <span>Référence : {payment.reference}</span>
                          )}
                          {payment.fiche.id && (
                            <Link
                              className="font-medium text-[#514a40] underline underline-offset-2"
                              to={`/espace-client/fiche/preview/${payment.fiche.id}`}
                            >
                              Voir la fiche
                            </Link>
                          )}
                        </div>
                        {payment.motifEchec && (
                          <p className="mt-2 text-sm text-rose-700">
                            {payment.motifEchec}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
                        <strong className="text-lg tabular-nums text-[#111111]">
                          {amount(payment)}
                        </strong>
                        <button
                          type="button"
                          onClick={() => setReceipt(payment)}
                          disabled={!settled}
                          className="rounded-xl border border-[#d8d2c8] px-3.5 py-2.5 text-sm font-semibold text-[#25221e] transition hover:bg-[#f4f1eb] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Reçu
                        </button>
                        {/* <button
                          type="button"
                          disabled
                          title="Les coordonnées légales et de facturation sont nécessaires avant l’émission."
                          className="rounded-xl border border-[#d8d2c8] px-3.5 py-2.5 text-sm font-semibold text-[#25221e] opacity-40"
                        >
                          Facture
                        </button> */}
                      </div>
                    </article>
                  );
                })}
              </div>
              {data.pagination.totalPages > 1 && (
                <nav
                  className="flex items-center justify-between border-t border-[#eee9e1] px-5 py-4 sm:px-6"
                  aria-label="Pagination des paiements"
                >
                  <span className="text-sm text-[#6d665d]">
                    Page {data.pagination.page} sur {data.pagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(current => current - 1)}
                      disabled={page <= 1 || isFetching}
                      className="rounded-lg border border-[#e3dfd8] px-3 py-2 text-sm disabled:opacity-40"
                    >
                      Précédent
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(current => current + 1)}
                      disabled={page >= data.pagination.totalPages || isFetching}
                      className="rounded-lg border border-[#e3dfd8] px-3 py-2 text-sm disabled:opacity-40"
                    >
                      Suivant
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </section>
      </div>

      {receipt && (
        <div
          className="payment-print-area fixed inset-0 z-[80] overflow-y-auto bg-black/50 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="Reçu de paiement"
        >
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              .payment-print-area, .payment-print-area * { visibility: visible !important; }
              .payment-print-area { position: fixed; inset: 0; display: block !important; background: white; }
              .payment-print-actions { display: none !important; }
            }
          `}</style>
          <article className="mx-auto my-6 max-w-2xl rounded-2xl border border-[#e3dfd8] bg-white p-8 text-[#111111] shadow-lg print:my-0 print:max-w-none print:border-0 print:shadow-none">
            <div className="flex items-start justify-between gap-4 border-b border-[#e3dfd8] pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#EF1733]">
                  Support Connecté
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Reçu de paiement</h2>
                <p className="mt-1 text-sm text-[#6d665d]">
                  Reçu n° {paymentReference(receipt)}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">
                Payé
              </span>
            </div>
            <dl className="grid gap-4 py-6 sm:grid-cols-2">
              <DocumentField label="Payé par" value={user.name} />
              <DocumentField label="E-mail" value={user.email} />
              <DocumentField
                label="Date du paiement"
                value={date(receipt.payeLe ?? receipt.createdAt)}
              />
              <DocumentField
                label="Référence de transaction"
                value={receipt.reference ?? `PAY-${receipt.id}`}
              />
              <DocumentField label="Formule" value={receipt.formuleNom} />
              <DocumentField
                label="Fiche concernée"
                value={
                  receipt.fiche.entreprise ||
                  receipt.fiche.nom ||
                  "Fiche supprimée"
                }
              />
              <DocumentField label="Moyen de paiement" value={receipt.fournisseur} />
              <DocumentField
                label="Montant réglé"
                value={amount(receipt)}
                strong
              />
            </dl>
            <footer className="border-t border-[#e3dfd8] pt-4 text-sm text-[#6d665d]">
              {CONTACT.email} · {CONTACT.phone}
              <p className="mt-2 text-xs">
                Reçu de paiement. Ce document n’est pas une facture.
              </p>
            </footer>
            <div className="payment-print-actions mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReceipt(null)}
                className="rounded-xl border border-[#e3dfd8] px-4 py-2.5 text-sm font-semibold"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-[#08090A] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Imprimer / enregistrer en PDF
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}

function paymentReference(payment: ClientPayment) {
  return payment.reference ?? `PAY-${payment.id}`;
}

function DocumentField({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[#8d8a85]">{label}</dt>
      <dd className={`mt-1 ${strong ? "text-xl font-bold" : "font-medium"}`}>
        {value}
      </dd>
    </div>
  );
}
