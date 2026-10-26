import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toApiError } from "../../../lib/apiError";
import {
  createCardRequest,
  getCardRequest,
} from "../espaceClient.service";

const CARD_DETAILS: Record<string, { label: string; price: number; style: string }> = {
  essentielle: {
    label: "Essentielle",
    price: 10_000,
    style: "from-slate-700 to-slate-950",
  },
  pro: {
    label: "Pro",
    price: 12_000,
    style: "from-rose-600 to-rose-950",
  },
  signature: {
    label: "Signature",
    price: 15_000,
    style: "from-amber-500 to-amber-950",
  },
};

const STATUS_LABELS: Record<string, string> = {
  a_imprimer: "En attente de production",
  imprimee: "Imprimée",
  encodee: "Encodée",
  testee: "Testée",
  livree: "Livrée",
  annulee: "Annulée",
};

const terminalStatuses = new Set(["livree", "annulee"]);

export function CardRequestPanel({
  ficheId,
  formula,
  eligible = true,
}: {
  ficheId: number;
  formula: string;
  eligible?: boolean;
}) {
  const queryClient = useQueryClient();
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [notes, setNotes] = useState("");
  const cardQuery = useQuery({
    queryKey: ["card-request", ficheId],
    queryFn: () => getCardRequest(ficheId),
  });
  const createMutation = useMutation({
    mutationFn: () =>
      createCardRequest(ficheId, {
        adresseLivraison: adresse,
        telephoneLivraison: telephone,
        ...(notes.trim() ? { notesClient: notes.trim() } : {}),
      }),
    onSuccess: card => {
      queryClient.setQueryData(["card-request", ficheId], card);
      setAdresse("");
      setTelephone("");
      setNotes("");
    },
  });

  const card = cardQuery.data;
  const plan = CARD_DETAILS[formula.toLowerCase()] ?? CARD_DETAILS.essentielle;
  const canRequest = !card || terminalStatuses.has(card.statut);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate();
  };

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[#e3dfd8] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
      aria-labelledby="card-request-title"
    >
      <header className="border-b border-[#eee9e1] px-5 py-5 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#EF1733]">
          Carte physique
        </p>
        <h2
          id="card-request-title"
          className="mt-1 text-xl font-semibold tracking-tight text-[#08090A]"
        >
          Votre carte {plan.label}
        </h2>
        <p className="mt-1 text-sm text-[#6d665d]">
          Une carte NFC liée à cette fiche. Le paiement se fait à la livraison.
        </p>
      </header>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)]">
        <div
          className={`relative flex min-h-40 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${plan.style} p-5 text-white shadow-lg`}
          aria-label={`Aperçu de carte ${plan.label}`}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
            Support Connecté
          </span>
          <div>
            <p className="text-lg font-semibold">{plan.label}</p>
            <p className="mt-1 text-xs text-white/75">Carte NFC · 1 fiche</p>
          </div>
          <span className="absolute -right-8 -top-12 h-36 w-36 rounded-full border border-white/20" />
          <span className="absolute -right-1 -top-5 h-24 w-24 rounded-full border border-white/20" />
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f7f5f1] px-4 py-3">
            <span className="text-sm text-[#6d665d]">Prix de la carte</span>
            <strong className="text-base text-[#111111]">
              {plan.price.toLocaleString("fr-FR")} FCFA
            </strong>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#8d8a85]">
            Ce montant est fixe et sera réglé à la réception de la carte.
          </p>

          {cardQuery.isPending ? (
            <p className="mt-5 text-sm text-[#6d665d]" role="status">
              Vérification de vos demandes…
            </p>
          ) : cardQuery.isError ? (
            <div className="mt-5 text-sm text-[#a11225]" role="alert">
              <p>Impossible de vérifier l’état de votre demande.</p>
              <button
                type="button"
                onClick={() => void cardQuery.refetch()}
                className="mt-2 font-semibold underline"
              >
                Réessayer
              </button>
            </div>
          ) : card && !canRequest ? (
            <div className="mt-5 rounded-xl border border-[#e3dfd8] p-4">
              <p className="text-sm font-semibold text-[#111111]">
                {STATUS_LABELS[card.statut] ?? "Demande en cours"}
              </p>
              <p className="mt-1 text-sm text-[#6d665d]">
                Votre demande est suivie par notre équipe. Le paiement est dû à
                la livraison.
              </p>
              {card.adresseLivraison && (
                <p className="mt-3 text-xs text-[#6d665d]">
                  Livraison à : {card.adresseLivraison}
                </p>
              )}
            </div>
          ) : !eligible ? (
            <p className="mt-5 rounded-xl bg-[#f7f5f1] p-4 text-sm leading-6 text-[#6d665d]">
              La demande est disponible pour une fiche publiée disposant d’un
              abonnement actif. Vous pourrez commander la carte dès que ces
              conditions seront remplies.
            </p>
          ) : (
            <form className="mt-5 space-y-3" onSubmit={submit}>
              {card && (
                <p className="text-sm text-[#6d665d]">
                  Dernière demande : {STATUS_LABELS[card.statut] ?? card.statut}.
                  Vous pouvez en effectuer une nouvelle.
                </p>
              )}
              <label className="block text-sm font-medium text-[#25221e]">
                Adresse de livraison
                <textarea
                  required
                  minLength={5}
                  maxLength={500}
                  rows={3}
                  value={adresse}
                  onChange={event => setAdresse(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#e3dfd8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#08090A] focus:ring-2 focus:ring-[#08090A]/10"
                />
              </label>
              <label className="block text-sm font-medium text-[#25221e]">
                Téléphone de livraison
                <input
                  required
                  type="tel"
                  minLength={6}
                  maxLength={30}
                  value={telephone}
                  onChange={event => setTelephone(event.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-lg border border-[#e3dfd8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#08090A] focus:ring-2 focus:ring-[#08090A]/10"
                />
              </label>
              <label className="block text-sm font-medium text-[#25221e]">
                Précisions (facultatif)
                <textarea
                  maxLength={1000}
                  rows={2}
                  value={notes}
                  onChange={event => setNotes(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#e3dfd8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#08090A] focus:ring-2 focus:ring-[#08090A]/10"
                />
              </label>
              {createMutation.isError && (
                <p className="text-sm text-[#a11225]" role="alert">
                  {toApiError(
                    createMutation.error,
                    "La demande n’a pas pu être envoyée.",
                  ).message}
                </p>
              )}
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="min-h-11 w-full rounded-xl bg-[#08090A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c9142b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createMutation.isPending
                  ? "Envoi en cours…"
                  : "Demander cette carte"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
