import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { ApiFicheSummary } from "../../../../types";
import { FORMULES } from "../../../../types";
import type { PlanType } from "../../../../types";
import { formatPrice } from "../../lib/formatPrice";
import { getPricingGrid } from "../../espaceClient.service";

export function subscriptionDurationLabel(months: number) {
  if (months === 1) return "Mensuelle";
  if (months === 3) return "Trimestrielle";
  if (months === 12) return "Annuelle";
  return `${months} mois`;
}

export function PlansPanel({ onClose }: { onClose: () => void }) {
  const [activePlan, setActivePlan] = useState<PlanType>("ESSENTIELLE");
  const current = FORMULES.find(plan => plan.id === activePlan) ?? FORMULES[0];
  const { data: pricing, isError } = useQuery({
    queryKey: ["clientPricing"],
    queryFn: getPricingGrid,
  });
  const configured = pricing?.formules.find(
    formula => formula.formule === activePlan.toLowerCase(),
  );
  const durationOptions =
    configured?.durees.map(item => {
      const prixAvantRemise =
        (configured.prixMensuelFcfa ?? 0) * item.dureeMois;
      const prixApresRemise = Math.round(
        (prixAvantRemise * (100 - item.remisePct)) / 100,
      );
      return { ...item, prixAvantRemise, prixApresRemise };
    }) ?? [];
  return (
    <section
      className="min-w-0 overflow-hidden rounded-2xl border border-[#e3dfd8] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
      aria-label="Présentation des formules"
    >
      <div className="flex items-start justify-between border-b border-[#eee9e1] px-5 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#EF1733]">
            Nos formules
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#08090A]">
            Choisissez votre niveau
          </h2>
          <p className="mt-1 text-sm text-[#6d665d]">
            Une formule adaptée à votre activité.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Masquer les formules"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xl text-[#6d665d] transition hover:bg-[#eee9e1] hover:text-[#111111]"
        >
          ×
        </button>
      </div>
      <div
        className="grid grid-cols-3 gap-1 border-b border-[#eee9e1] bg-[#f7f5f1] p-2"
        role="tablist"
        aria-label="Formules disponibles"
      >
        {FORMULES.map(plan => (
          <button
            key={plan.id}
            type="button"
            role="tab"
            id={`plan-tab-${plan.id}`}
            aria-selected={activePlan === plan.id}
            aria-controls="plan-panel"
            onClick={() => setActivePlan(plan.id)}
            className={`rounded-xl px-2 py-3 text-sm font-semibold transition ${activePlan === plan.id ? "bg-white text-[#08090A] shadow-[0_6px_20px_rgba(0,0,0,0.05)] ring-1 ring-[#e3dfd8]" : "text-[#6d665d] hover:text-[#111111]"}`}
          >
            {plan.label}
          </button>
        ))}
      </div>
      <div
        id="plan-panel"
        role="tabpanel"
        aria-labelledby={`plan-tab-${activePlan}`}
        className="p-5"
      >
        <div
          className={`rounded-2xl border ${current.accent} bg-gradient-to-br from-white to-slate-50/80 p-5`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[#08090A]">
                {current.label}
              </h3>
              <p className="mt-1 max-w-xs text-sm leading-6 text-[#6d665d]">
                {current.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold tracking-tight text-[#08090A]">
                {activePlan === "ESSENTIELLE"
                  ? "Gratuite jusqu’à 3 fiches"
                  : configured?.prixMensuelFcfa !== undefined &&
                      configured.prixMensuelFcfa !== null
                    ? `${formatPrice(configured.prixMensuelFcfa)} / mois`
                    : "Tarif non configuré"}
              </p>
              <p className="mt-1 text-xs text-[#6d665d]">
                {activePlan === "ESSENTIELLE"
                  ? pricing?.emplacements.prixUnitaireFcfa !== null &&
                      pricing?.emplacements.prixUnitaireFcfa !== undefined
                    ? `emplacement supplémentaire : ${formatPrice(pricing.emplacements.prixUnitaireFcfa)}`
                    : "prix d’emplacement non configuré"
                  : "prix et durées selon la configuration"}
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-white/80 p-3 text-sm text-[#6d665d] ring-1 ring-[#eee9e1]">
            {isError ? (
              <p role="alert">Impossible de charger la grille tarifaire.</p>
            ) : activePlan === "ESSENTIELLE" ? (
              <p>Les places gratuites restantes sont déduites en priorité.</p>
            ) : configured ? (
              <>
                <p className="font-semibold text-[#111111]">
                  Durées proposées
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {durationOptions.map(item => (
                    <li
                      key={item.dureeMois}
                      className="rounded-lg bg-[#f7f5f1] px-3 py-2"
                    >
                      <span className="block font-medium text-[#111111]">
                        {subscriptionDurationLabel(item.dureeMois)} ·{" "}
                        {formatPrice(item.prixApresRemise)} par fiche
                      </span>
                      <span className="mt-1 block text-xs">
                        {item.remisePct > 0
                          ? `−${item.remisePct}% · économie de ${formatPrice(item.prixAvantRemise - item.prixApresRemise)}`
                          : "Sans remise de durée"}
                      </span>
                    </li>
                  ))}
                </ul>
                {configured.remises.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold text-[#111111]">
                      Remises selon le nombre de fiches commandées
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {configured.remises.map(item => (
                        <li
                          key={item.quantiteMin}
                          className="rounded-lg bg-rose-50 px-3 py-1.5 text-[#a30f23]"
                        >
                          Dès {item.quantiteMin} fiches · −{item.remisePct}%
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs">
                      Ces remises s’appliquent aux commandes groupées, pas aux
                      upgrades d’une fiche individuelle.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p>Cette formule n’est pas disponible actuellement.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export const planLabel = (type?: string | null) => {
  const normalized = type?.toUpperCase();
  if (normalized === "PRO") return "Pro";
  if (normalized === "SIGNATURE") return "Signature";
  if (normalized === "ESSENTIELLE" || normalized === "ESSENTIEL")
    return "Essentiel";
  return "Non renseignée";
};

export const initials = (prenom?: string | null, nom?: string | null) =>
  `${prenom?.trim().charAt(0) ?? ""}${nom?.trim().charAt(0) ?? ""}`.toUpperCase() ||
  "?";

export function getPlan(fiche: ApiFicheSummary): string | undefined {
  return (
    fiche.subscriptions?.[0]?.plan?.type ?? fiche.abonnementActif?.plan?.type
  );
}

export function PlanPill({ plan }: { plan?: string | null }) {
  const value = planLabel(plan);
  const style =
    value === "Signature"
      ? "bg-amber-50 text-amber-800 ring-amber-200"
      : value === "Pro"
        ? "bg-[#fde8eb] text-[#a30f23] ring-[#f6c3cb]"
        : value === "Essentiel"
          ? "bg-[#eee9e1] text-[#4a443c] ring-[#e3dfd8]"
          : "bg-[#f7f5f1] text-[#8d8a85] ring-[#e3dfd8]";
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {value}
    </span>
  );
}
