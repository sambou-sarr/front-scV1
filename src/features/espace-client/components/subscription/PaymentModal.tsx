import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { FORMULES } from "../../../../types";
import type { PlanType } from "../../../../types";
import type { ApiFicheSummary } from "../../../../types";
import { formatPrice } from "../../lib/formatPrice";
import {
  getPricingGrid,
  quoteSubscription,
  upgradeFichePlan,
} from "../../espaceClient.service";
import { getPlan, subscriptionDurationLabel } from "./PlansPanel";

const PLAN_RANK: Record<string, number> = {
  ESSENTIELLE: 0,
  ESSENTIEL: 0,
  PRO: 1,
  SIGNATURE: 2,
};

export function PaymentModal({
  fiche,
  onClose,
  onSuccess,
}: {
  fiche: ApiFicheSummary;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const currentPlan = (getPlan(fiche) ?? "ESSENTIELLE").toUpperCase();
  const currentRank = PLAN_RANK[currentPlan] ?? 0;
  const queryClient = useQueryClient();
  const { data: pricing, isError: pricingError } = useQuery({
    queryKey: ["clientPricing"],
    queryFn: getPricingGrid,
  });
  const availablePlans = FORMULES.filter(
    item =>
      PLAN_RANK[item.id] > currentRank &&
      pricing?.formules.some(
        formula => formula.formule === item.id.toLowerCase(),
      ),
  );
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    currentPlan === "PRO" ? "SIGNATURE" : "PRO"
  );
  const [duration, setDuration] = useState(12);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (
      availablePlans.length > 0 &&
      !availablePlans.some(item => item.id === selectedPlan)
    )
      setSelectedPlan(availablePlans[0].id);
  }, [availablePlans, selectedPlan]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const plan =
    availablePlans.find(item => item.id === selectedPlan) ??
    availablePlans[0] ??
    FORMULES[2];
  const paidPlan =
    plan.id === "ESSENTIELLE" ? null : plan.id;
  const durations =
    pricing?.formules.find(
      formula => formula.formule === paidPlan?.toLowerCase(),
    )?.durees ?? [];
  const selectedDuration = durations.some(item => item.dureeMois === duration)
    ? duration
    : durations[0]?.dureeMois;
  const quoteQuery = useQuery({
    queryKey: ["subscriptionQuote", fiche.id, paidPlan, selectedDuration],
    queryFn: () => {
      if (!paidPlan || selectedDuration === undefined)
        throw new Error("Formule ou durée indisponible");
      return quoteSubscription(paidPlan, selectedDuration);
    },
    enabled:
      availablePlans.length > 0 &&
      paidPlan !== null &&
      selectedDuration !== undefined,
  });
  const quoteLine = quoteQuery.data?.lignes[0];

  const upgradeMutation = useMutation({
    mutationFn: () => {
      if (!paidPlan || selectedDuration === undefined)
        throw new Error("Formule ou durée indisponible");
      return upgradeFichePlan(fiche.id, paidPlan, selectedDuration);
    },
    onSuccess: () => {
      setNotice("Upgrade confirmé en mode simulation. La nouvelle formule est maintenant active.");
      void queryClient.invalidateQueries({
        queryKey: ["client", "dashboard", "fiches"],
      });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = isAxiosError(error)
        ? error.response?.data?.error?.message ?? "Impossible de changer la formule. Réessayez."
        : "Une erreur inattendue est survenue.";
      setNotice(message);
    },
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#08090A]/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-title"
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between border-b border-[#eee9e1] px-6 py-5 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#EF1733]">
              Abonnement
            </p>
            <h2
              id="payment-title"
              className="mt-1 text-xl font-semibold tracking-tight text-[#08090A]"
            >
              Choisir une formule
            </h2>
            <p className="mt-1 text-sm text-[#6d665d]">
              Fiche de {fiche.prenom} {fiche.nom}
            </p>
            <p className="mt-1 text-xs text-[#6d665d]">
              Formule actuelle : {currentPlan === "ESSENTIELLE" ? "Essentielle" : currentPlan === "PRO" ? "Pro" : "Signature"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="grid h-10 w-10 place-items-center rounded-full bg-[#eee9e1] text-2xl text-[#6d665d] transition hover:bg-[#e3dfd8]"
          >
            ×
          </button>
        </div>
        <div className="space-y-6 px-6 py-6 sm:px-7">
          {availablePlans.length > 0 ? (
            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-[#111111]">
                Choisissez la formule supérieure
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {availablePlans.map(item => {
                  const itemPrice = pricing?.formules.find(
                    formula => formula.formule === item.id.toLowerCase(),
                  )?.prixMensuelFcfa;
                  return (
                    <label
                      key={item.id}
                      className={`relative cursor-pointer rounded-2xl border p-3 transition ${selectedPlan === item.id ? "border-[#08090A] bg-[#f4f1eb] ring-1 ring-[#08090A]" : "border-[#e3dfd8] hover:border-[#08090A]"}`}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="subscription-plan"
                        value={item.id}
                        checked={selectedPlan === item.id}
                        onChange={() => {
                          setSelectedPlan(item.id);
                          setDuration(
                            pricing?.formules.find(
                              formula =>
                                formula.formule === item.id.toLowerCase(),
                            )?.durees[0]?.dureeMois ?? 12,
                          );
                          setNotice("");
                        }}
                      />
                      <span className="block text-sm font-semibold text-[#111111]">
                        {item.label}
                      </span>
                      <span className="mt-2 block text-sm font-bold text-[#08090A]">
                        {itemPrice !== null && itemPrice !== undefined
                          ? `${formatPrice(itemPrice)} / mois`
                          : "Tarif non configuré"}
                      </span>
                      <span className="mt-1 block text-xs text-[#6d665d]">
                        Tarif mensuel indicatif; total selon la durée choisie
                      </span>
                      {selectedPlan === item.id && (
                        <span
                          className="absolute right-2 top-2 text-sm text-[#EF1733]"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <p className="rounded-xl bg-[#f4f1eb] px-4 py-3 text-sm leading-6 text-[#4a443c]">
              {currentRank >= PLAN_RANK.SIGNATURE
                ? "Votre fiche utilise déjà la formule la plus élevée, Signature."
                : pricingError
                  ? "Impossible de charger les formules disponibles."
                  : pricing
                    ? "Aucune formule payante n’est actuellement configurée."
                    : "Chargement des formules disponibles…"}
            </p>
          )}

          {availablePlans.length > 0 && (
            <>
              <label className="block text-sm font-semibold text-[#111111]">
                Durée d’abonnement
                <select
                  className="mt-2 block w-full rounded-xl border border-[#e3dfd8] bg-white px-3 py-3 text-sm font-normal"
                  value={selectedDuration ?? ""}
                  onChange={event => setDuration(Number(event.target.value))}
                  disabled={durations.length === 0}
                >
                  {durations.map(item => (
                    <option key={item.dureeMois} value={item.dureeMois}>
                      {subscriptionDurationLabel(item.dureeMois)} (
                      {item.dureeMois} mois)
                      {item.remisePct > 0
                        ? ` — −${item.remisePct}%`
                        : " — sans remise"}
                    </option>
                  ))}
                </select>
              </label>
              {pricingError ? (
                <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
                  Impossible de charger les durées et tarifs.
                </p>
              ) : durations.length === 0 ? (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
                  Aucune durée n’est configurée pour cette formule.
                </p>
              ) : quoteQuery.isPending ? (
                <p className="text-sm text-[#6d665d]" role="status">
                  Calcul du tarif…
                </p>
              ) : quoteQuery.isError ? (
                <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
                  Le tarif de cette durée ne peut pas être calculé.
                </p>
              ) : quoteQuery.data ? (
                <div className="rounded-xl bg-[#f4f1eb] px-4 py-3 text-sm text-[#4a443c]" aria-live="polite">
                  <p>
                    Prix de base pour {selectedDuration} mois :{" "}
                    {formatPrice(quoteQuery.data.totalSansRemiseFcfa)}
                  </p>
                  {quoteLine && (
                    <>
                      <p className="mt-1">
                        Remise de durée ({quoteLine.remiseDureePct}%) : −
                        {formatPrice(
                          quoteLine.totalSansRemiseFcfa -
                            quoteLine.prixApresDureeFcfa *
                              quoteLine.quantite,
                        )}
                      </p>
                      {quoteLine.remiseQuantitePct > 0 && (
                        <p className="mt-1">
                          Remise de quantité ({quoteLine.remiseQuantitePct}%) :
                          −
                          {formatPrice(
                            quoteLine.prixApresDureeFcfa *
                              quoteLine.quantite -
                              quoteLine.totalFcfa,
                          )}
                        </p>
                      )}
                    </>
                  )}
                  <p className="mt-1 font-semibold text-[#08090A]">
                    Économie totale :{" "}
                    {formatPrice(quoteQuery.data.economieFcfa)}
                  </p>
                  <p className="mt-1 font-semibold text-[#08090A]">
                    Total pour cette fiche :{" "}
                    {formatPrice(quoteQuery.data.totalFcfa)}
                  </p>
                </div>
              ) : null}
            </>
          )}

          {availablePlans.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              <strong>Mode simulation :</strong> aucun paiement Wave ou Orange Money ne sera effectué. Le serveur enregistrera une tentative de paiement, la confirmera en mode simulation, puis activera la nouvelle formule. Aucun paiement réel n’est effectué.
            </div>
          )}

          {notice && (
            <p
              role="status"
              className="rounded-xl bg-[#eee9e1] px-4 py-3 text-sm text-[#4a443c]"
            >
              {notice}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setNotice("");
              upgradeMutation.mutate();
            }}
            disabled={
              availablePlans.length === 0 ||
              selectedDuration === undefined ||
              !quoteQuery.data ||
              upgradeMutation.isPending ||
              upgradeMutation.isSuccess
            }
            className="w-full rounded-xl bg-[#08090A] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-[#c9142b] focus:outline-none focus:ring-2 focus:ring-[#EF1733] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {upgradeMutation.isPending
              ? "Activation en cours…"
              : upgradeMutation.isSuccess
                ? "Formule activée"
                : quoteQuery.data
                  ? `Confirmer l’upgrade · ${formatPrice(quoteQuery.data.totalFcfa)}`
                  : "Confirmer l’upgrade simulé"}
          </button>
          <p className="text-center text-xs leading-5 text-[#8d8a85]">
            Pour cette fiche, le tarif tient compte de la durée et des remises
            configurées. Les remises de quantité concernent les commandes
            groupées. La formule sera activée après confirmation du serveur.
          </p>
        </div>
      </section>
    </div>
  );
}
