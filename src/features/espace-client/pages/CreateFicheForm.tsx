import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { getToken as getSessionToken } from "../../../lib/session";
import "../../../styles/create-fiche-form.css";
import { formatPrice } from "../lib/formatPrice";
import {
  createFiche,
  getFicheCreationStatus,
  getPricingGrid,
  purchaseFiches,
  quoteFichePurchase,
  type FichePurchaseInput,
  type FichePurchaseQuote,
  type PricingGrid,
} from "../espaceClient.service";

// Formulaire de création d’une fiche → POST /api/fiches
// Une fiche Essentielle gratuite est créée avec son identité. Les commandes
// payantes créent des fiches préremplies selon la formule après confirmation.

// ───────── Types ─────────

/** Fiche renvoyée par POST /fiches (seuls les champs utiles ici sont typés). */
export interface CreatedFiche {
  id: number;
  slug: string;
  formule: string;
  statut: string;
  prenom: string;
  nom: string;
  [key: string]: unknown;
}

export interface CreateFicheFormProps {
  /** Retourne le jeton du client connecté. */
  getToken?: () => string | null | undefined;
  /** Appelée avec la fiche créée (ex. rediriger vers l'éditeur). Sans elle, le formulaire affiche l'adresse publique. */
  onCreated?: (fiche: CreatedFiche) => void;
  /** Appelée quand il n'y a pas de token ou que le serveur répond 401 (ex. rediriger vers la connexion). */
  onUnauthorized?: () => void;
  /** Base de l'adresse publique des fiches. */
  publicBaseUrl?: string;
}

type FieldKey =
  | "prenom"
  | "nom"
  | "fonction"
  | "entreprise"
  | "telephone"
  | "whatsapp"
  | "secteur";
type TextKey = Exclude<FieldKey, "secteur">;
type Values = Record<FieldKey, string>;
type Errors = Partial<Record<FieldKey, string>>;

// ───────── Constantes ─────────

const SECTEURS = [
  { value: "restaurant", label: "Restaurant" },
  { value: "immobilier", label: "Immobilier" },
  { value: "commerce", label: "Commerce" },
  { value: "hotel", label: "Hôtel" },
  { value: "independant", label: "Indépendant" },
  { value: "beaute", label: "Beauté" },
] as const;

// Mêmes plafonds que le serveur (createFicheSchema)
const MAX: Record<TextKey, number> = {
  prenom: 100,
  nom: 100,
  fonction: 150,
  entreprise: 150,
  telephone: 30,
  whatsapp: 30,
};

const FIELD_ORDER: FieldKey[] = [
  "prenom",
  "nom",
  "fonction",
  "entreprise",
  "secteur",
  "telephone",
  "whatsapp",
];

const EMPTY: Values = {
  prenom: "",
  nom: "",
  fonction: "",
  entreprise: "",
  telephone: "",
  whatsapp: "",
  secteur: "",
};

const digits = (s: string) => s.replace(/\D/g, "").length;

function validate(v: Values, sameWhatsapp: boolean): Errors {
  const e: Errors = {};
  if (!v.prenom.trim())
    e.prenom = "Indique ton prénom ou le nom de ton activité.";
  (Object.keys(MAX) as TextKey[]).forEach(k => {
    if (k === "whatsapp" && sameWhatsapp) return;
    if (!e[k] && v[k].trim().length > MAX[k])
      e[k] = `${MAX[k]} caractères maximum.`;
  });
  if (v.telephone.trim() && digits(v.telephone) < 6)
    e.telephone = "Numéro trop court. Exemple : +221 77 000 00 00";
  if (!sameWhatsapp && v.whatsapp.trim() && digits(v.whatsapp) < 6)
    e.whatsapp = "Numéro trop court. Exemple : +221 77 000 00 00";
  return e;
}

function durationLabel(months: number) {
  if (months === 1) return "Mensuelle (1 mois)";
  if (months === 3) return "Trimestrielle (3 mois)";
  if (months === 12) return "Annuelle (12 mois)";
  return `${months} mois`;
}

// ───────── Composant ─────────

export default function CreateFicheForm({
  getToken = getSessionToken,
  onCreated,
  onUnauthorized,
  publicBaseUrl = "https://supportconnecte.com",
}: CreateFicheFormProps) {
  const uid = useId();
  const refs = useRef<
    Partial<Record<FieldKey, HTMLInputElement | HTMLSelectElement | null>>
  >({});
  const [values, setValues] = useState<Values>(EMPTY);
  const [sameWhatsapp, setSameWhatsapp] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<CreatedFiche | null>(null);
  const [createdQuantity, setCreatedQuantity] = useState(1);
  const [purchaseMode, setPurchaseMode] = useState(false);
  const [purchasePlan, setPurchasePlan] =
    useState<FichePurchaseInput["plan"]>("essentielle");
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(12);
  const queryClient = useQueryClient();

  const set =
    (key: FieldKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = e.target;
      setValues(v => ({ ...v, [key]: value }));
      if (errors[key]) setErrors(er => ({ ...er, [key]: undefined }));
    };

  const focusFirst = (errs: Errors) => {
    const first = FIELD_ORDER.find(k => errs[k]);
    if (first) refs.current[first]?.focus();
  };

  const {
    data: creationStatus,
    isPending: isStatusPending,
    isError: isStatusError,
  } = useQuery({
    queryKey: ["ficheCreationStatus"],
    queryFn: getFicheCreationStatus,
  });

  useEffect(() => {
    if (creationStatus?.freeSlots === 0) setPurchaseMode(true);
  }, [creationStatus?.freeSlots]);

  const {
    data: pricing,
    isPending: isPricingPending,
    isError: isPricingError,
  } = useQuery<PricingGrid>({
    queryKey: ["clientPricing"],
    queryFn: getPricingGrid,
    enabled: purchaseMode,
  });

  const durations =
    pricing?.formules.find(formula => formula.formule === purchasePlan)
      ?.durees ?? [];
  const selectedFormula = pricing?.formules.find(
    formula => formula.formule === purchasePlan,
  );
  const quantityDiscounts = selectedFormula?.remises ?? [];
  const selectedDuration = durations.some(item => item.dureeMois === duration)
    ? duration
    : durations[0]?.dureeMois;
  const purchaseInput: FichePurchaseInput = {
    plan: purchasePlan,
    quantity,
    ...(purchasePlan === "essentielle" || selectedDuration === undefined
      ? {}
      : { dureeMois: selectedDuration }),
  };
  const { data: quote, isPending: isQuotePending, isError: isQuoteError } =
    useQuery<FichePurchaseQuote>({
      queryKey: [
        "fichePurchaseQuote",
        purchasePlan,
        quantity,
        selectedDuration,
      ],
      queryFn: () => quoteFichePurchase(purchaseInput),
      enabled:
        purchaseMode &&
        quantity > 0 &&
        (purchasePlan === "essentielle" || selectedDuration !== undefined),
    });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setFormError("");

    const errs = validate(values, sameWhatsapp);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return focusFirst(errs);

    const token = getToken();
    if (!token) {
      setFormError("Connecte-toi pour créer une fiche.");
      onUnauthorized?.();
      return;
    }

    // On n'envoie que ce qui est rempli.
    const body: Partial<Values> = { prenom: values.prenom.trim() };
    for (const k of [
      "nom",
      "fonction",
      "entreprise",
      "telephone",
      "secteur",
    ] as const) {
      if (values[k].trim()) body[k] = values[k].trim();
    }
    const wa = sameWhatsapp ? values.telephone.trim() : values.whatsapp.trim();
    if (wa) body.whatsapp = wa;

    setLoading(true);
    mutate(body);
  }

  const { mutate } = useMutation({
    mutationFn: createFiche,
    onSuccess: response => {
      setLoading(false);
      void queryClient.invalidateQueries({
        queryKey: ["ficheCreationStatus"],
      });
      const fiche = (response?.fiche ??
        response?.data ??
        response) as CreatedFiche;
      if (fiche?.slug) {
        setCreatedQuantity(1);
        setCreated(fiche);
        onCreated?.(fiche);
      } else {
        setFormError(
          "La fiche a été créée, mais sa réponse est incomplète. Actualise le tableau de bord pour la retrouver."
        );
      }
    },
    onError: error => {
      setLoading(false);
      const details =
        typeof error === "object" && error !== null
          ? (
              error as {
                response?: {
                  status?: number;
                  data?: { error?: { message?: string }; message?: string };
                };
              }
            ).response
          : undefined;
      const message =
        typeof error === "string"
          ? error
          : (details?.data?.error?.message ??
            details?.data?.message ??
            (error instanceof Error
              ? error.message
              : "La création de la fiche a échoué. Réessaie."));
      setFormError(message);
      if (
        details?.status === 401 ||
        /401|non autoris|session|connect/i.test(message)
      )
        onUnauthorized?.();
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: () => purchaseFiches(purchaseInput),
    onSuccess: result => {
      void queryClient.invalidateQueries({
        queryKey: ["ficheCreationStatus"],
      });
      const fiche = result.fiches[0];
      if (!fiche) {
        setFormError(
          "La commande est confirmée, mais aucune fiche n'a été renvoyée. Actualise le tableau de bord."
        );
        return;
      }
      setCreatedQuantity(result.fiches.length);
      setCreated(fiche);
      onCreated?.(fiche);
    },
    onError: error => {
      const details =
        typeof error === "object" && error !== null
          ? (
              error as {
                response?: {
                  status?: number;
                  data?: { error?: { message?: string }; message?: string };
                };
              }
            ).response
          : undefined;
      const message =
        details?.data?.error?.message ??
        details?.data?.message ??
        (error instanceof Error
          ? error.message
          : "La commande a échoué. Réessaie.");
      setFormError(message);
      if (details?.status === 401) onUnauthorized?.();
    },
  });

  if (created) {
    const url = `${publicBaseUrl}/fiche/${created.slug}`;
    const createdPlan: FichePurchaseInput["plan"] =
      created.formule.toLowerCase() === "pro"
        ? "pro"
        : created.formule.toLowerCase() === "signature"
          ? "signature"
          : "essentielle";
    return (
      <div className="cf">
        <PlanBar plan={createdPlan} />
        <div className="cf-box" role="status">
          <h2>
            {createdQuantity > 1
              ? `${createdQuantity} fiches sont créées`
              : "Ta fiche est créée"}
          </h2>
          <p className="cf-sub">Elle est en ligne à cette adresse :</p>
          <a className="cf-link" href={url} target="_blank" rel="noreferrer">
            {url}
          </a>
          <p className="cf-note">
            Ajoute maintenant ta présentation, tes réseaux sociaux et ta
            localisation depuis l'éditeur.
          </p>
        </div>
      </div>
    );
  }

  const id = (k: FieldKey) => `${uid}-${k}`;
  const field = (k: TextKey) => ({
    id: id(k),
    ref: (el: HTMLInputElement | null) => {
      refs.current[k] = el;
    },
    value: values[k],
    onChange: set(k),
    "aria-invalid": errors[k] ? ("true" as const) : undefined,
    "aria-describedby": errors[k] ? `${id(k)}-err` : undefined,
    maxLength: MAX[k] + 20, // le message d'erreur s'affiche avant le blocage dur
  });
  const err = (k: FieldKey): ReactNode =>
    errors[k] ? (
      <p className="cf-err" id={`${id(k)}-err`}>
        {errors[k]}
      </p>
    ) : null;

  return (
    <form className="cf" onSubmit={handleSubmit} noValidate>
      {isStatusPending ? (
        <div className="cf-box" role="status">
          Vérification de vos fiches gratuites…
        </div>
      ) : isStatusError ? (
        <div className="cf-box" role="alert">
          <p>Impossible de vérifier votre nombre de fiches.</p>
          <button
            className="cf-btn"
            type="button"
            onClick={() =>
              void queryClient.invalidateQueries({
                queryKey: ["ficheCreationStatus"],
              })
            }
          >
            Réessayer
          </button>
        </div>
      ) : purchaseMode ? (
        <>
          <PlanBar plan={purchasePlan} />
          <div className="cf-box">
            <h2>Choisir une formule et le nombre de fiches</h2>
            <p className="cf-sub">
              Vos fiches seront créées après confirmation. Vous pourrez les
              compléter ensuite dans l’éditeur.
            </p>
            {formError && (
              <p className="cf-alert" role="alert">
                {formError}
              </p>
            )}

            <div className="cf-field">
              <label htmlFor={`${uid}-plan`}>Formule</label>
              <select
                className="cf-input"
                id={`${uid}-plan`}
                value={purchasePlan}
                onChange={event => {
                  const plan = event.target.value as FichePurchaseInput["plan"];
                  setPurchasePlan(plan);
                  setDuration(
                    pricing?.formules.find(item => item.formule === plan)
                      ?.durees[0]?.dureeMois ?? 12,
                  );
                  setFormError("");
                }}
              >
                <option value="essentielle">Essentielle</option>
                {(pricing?.formules ?? [])
                  .filter(formula => formula.formule !== "essentielle")
                  .map(formula => (
                  <option key={formula.formule} value={formula.formule}>
                    {formula.nom}
                    {formula.prixMensuelFcfa !== null
                      ? ` — ${formatPrice(formula.prixMensuelFcfa)}/mois`
                      : " — tarif à configurer"}
                  </option>
                ))}
              </select>
              {purchasePlan !== "essentielle" &&
                selectedFormula?.prixMensuelFcfa !== null &&
                selectedFormula?.prixMensuelFcfa !== undefined && (
                <p className="cf-note">
                  Tarif de base par fiche :{" "}
                  {formatPrice(selectedFormula.prixMensuelFcfa)} par mois,
                  avant remises.
                </p>
                )}
            </div>

            <div className="cf-field">
              <label htmlFor={`${uid}-quantity`}>Nombre de fiches</label>
              <input
                className="cf-input"
                id={`${uid}-quantity`}
                type="number"
                min={1}
                max={1000}
                step={1}
                value={quantity}
                onChange={event => setQuantity(Number(event.target.value))}
              />
              {purchasePlan !== "essentielle" &&
                quantityDiscounts.length > 0 && (
                  <p className="cf-note">
                    Remises selon le nombre de fiches :{" "}
                    {quantityDiscounts
                      .map(
                        remise =>
                          `dès ${remise.quantiteMin} : −${remise.remisePct}%`,
                      )
                      .join(" · ")}
                  </p>
                )}
            </div>

            {purchasePlan !== "essentielle" && (
              <div className="cf-field">
                <label htmlFor={`${uid}-duration`}>Durée d’abonnement</label>
                <select
                  className="cf-input"
                  id={`${uid}-duration`}
                  value={selectedDuration ?? ""}
                  onChange={event => setDuration(Number(event.target.value))}
                  disabled={durations.length === 0}
                >
                  {durations.map(item => (
                    <option key={item.dureeMois} value={item.dureeMois}>
                      {durationLabel(item.dureeMois)}
                      {item.remisePct > 0
                        ? ` — −${item.remisePct}%`
                        : " — sans remise"}
                    </option>
                  ))}
                </select>
                {durations.length === 0 && (
                  <p className="cf-alert" role="alert">
                    Aucune durée n’est configurée pour cette formule.
                  </p>
                )}
              </div>
            )}

            {isPricingPending ? (
              <p className="cf-note" role="status">
                Chargement des formules et tarifs…
              </p>
            ) : isPricingError ? (
              <p className="cf-alert" role="alert">
                Impossible de charger les tarifs. Réessaie.
              </p>
            ) : isQuotePending ? (
              <p className="cf-note" role="status">
                Calcul du tarif…
              </p>
            ) : isQuoteError ? (
              <p className="cf-alert" role="alert">
                Le tarif ne peut pas être calculé. Vérifie que les paramètres
                de la formule sont configurés.
              </p>
            ) : quote ? (
              <div className="cf-note" aria-live="polite">
                <p>
                  {quote.freeQuantity} fiche(s) gratuite(s) ·{" "}
                  {quote.paidQuantity} fiche(s) payante(s)
                </p>
                {quote.tarif && (
                  <>
                    <p>
                      Prix sans remise :{" "}
                      {formatPrice(quote.tarif.totalSansRemiseFcfa)}
                    </p>
                    <p>
                      Remise durée ({quote.tarif.remiseDureePct}%) : −
                      {formatPrice(
                        quote.tarif.totalSansRemiseFcfa -
                          quote.tarif.prixApresDureeFcfa * quote.quantity,
                      )}
                    </p>
                    <p>
                      Remise quantité ({quote.tarif.remiseQuantitePct}%) : −
                      {formatPrice(
                        (quote.tarif.prixApresDureeFcfa -
                          quote.tarif.prixUnitaireFcfa) *
                          quote.quantity,
                      )}
                    </p>
                    <p>
                      Prix après remises par fiche :{" "}
                      {formatPrice(quote.tarif.prixUnitaireFcfa)}
                    </p>
                    <p>
                      Économie totale :{" "}
                      {formatPrice(quote.tarif.economieFcfa)}
                    </p>
                  </>
                )}
                {quote.emplacements?.economieFcfa ? (
                  <p>
                    Économie sur les packs :{" "}
                    {formatPrice(quote.emplacements.economieFcfa)}
                  </p>
                ) : null}
                <p className="cf-total">
                  Total : {formatPrice(quote.totalFcfa)}
                </p>
              </div>
            ) : null}

            <button
              className="cf-btn"
              type="button"
              disabled={
                !quote ||
                isQuotePending ||
                purchaseMutation.isPending ||
                quantity < 1 ||
                quantity > 1000 ||
                (purchasePlan !== "essentielle" &&
                  selectedDuration === undefined)
              }
              onClick={() => {
                if (!getToken()) {
                  setFormError("Connecte-toi pour créer une fiche.");
                  onUnauthorized?.();
                  return;
                }
                setFormError("");
                purchaseMutation.mutate();
              }}
            >
              {purchaseMutation.isPending
                ? "Création en cours…"
                : quote?.totalFcfa
                  ? `Confirmer la commande · ${formatPrice(quote.totalFcfa)}`
                  : "Créer les fiches"}
            </button>
            <p className="cf-note">
              Mode simulation : aucun paiement réel n’est effectué. Les fiches
              Essentielle utilisent d’abord les places gratuites restantes;
              Pro et Signature n’ajoutent pas de frais d’emplacement.
            </p>
            {creationStatus && creationStatus.freeSlots > 0 && (
              <button
                className="cf-btn cf-secondary"
                type="button"
                onClick={() => {
                  setPurchaseMode(false);
                  setFormError("");
                }}
              >
                Créer une fiche Essentielle gratuite
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <PlanBar plan="essentielle" freeSlots={creationStatus?.freeSlots} />
          <div className="cf-box">
            <h2>Créer ma fiche Essentielle</h2>
            <p className="cf-sub">
              Quelques informations suffisent. Tu complèteras le reste ensuite.
            </p>

            {formError && (
              <p className="cf-alert" role="alert">
                {formError}
              </p>
            )}

            <div className="cf-grid cf-form-grid">
              <div className="cf-field">
                <label htmlFor={id("prenom")}>
                  Prénom ou nom de l'activité
                </label>
                <input
                  className="cf-input"
                  type="text"
                  autoComplete="given-name"
                  required
                  {...field("prenom")}
                />
                {err("prenom")}
              </div>

              <div className="cf-field">
                <label htmlFor={id("nom")}>
                  Nom <span className="cf-opt">(facultatif)</span>
                </label>
                <input
                  className="cf-input"
                  type="text"
                  autoComplete="family-name"
                  {...field("nom")}
                />
                {err("nom")}
              </div>

              <div className="cf-field">
                <label htmlFor={id("fonction")}>
                  Fonction <span className="cf-opt">(facultatif)</span>
                </label>
                <input
                  className="cf-input"
                  type="text"
                  placeholder="Coiffeuse, gérant, architecte…"
                  {...field("fonction")}
                />
                {err("fonction")}
              </div>

              <div className="cf-field">
                <label htmlFor={id("entreprise")}>
                  Entreprise <span className="cf-opt">(facultatif)</span>
                </label>
                <input
                  className="cf-input"
                  type="text"
                  autoComplete="organization"
                  {...field("entreprise")}
                />
                {err("entreprise")}
              </div>

              <div className="cf-field">
                <label htmlFor={id("secteur")}>
                  Secteur <span className="cf-opt">(facultatif)</span>
                </label>
                <select
                  className="cf-input"
                  id={id("secteur")}
                  ref={el => {
                    refs.current.secteur = el;
                  }}
                  value={values.secteur}
                  onChange={set("secteur")}
                >
                  <option value="">Je ne sais pas encore</option>
                  {SECTEURS.map(s => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cf-field">
                <label htmlFor={id("telephone")}>
                  Téléphone <span className="cf-opt">(facultatif)</span>
                </label>
                <input
                  className="cf-input"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+221 77 000 00 00"
                  {...field("telephone")}
                />
                {err("telephone")}
              </div>

              <div className="cf-field cf-field-full">
                <label htmlFor={id("whatsapp")}>
                  WhatsApp <span className="cf-opt">(facultatif)</span>
                </label>
                <input
                  className="cf-input"
                  type="tel"
                  inputMode="tel"
                  placeholder="+221 77 000 00 00"
                  {...field("whatsapp")}
                  value={sameWhatsapp ? values.telephone : values.whatsapp}
                  disabled={sameWhatsapp}
                />
                <label className="cf-check">
                  <input
                    type="checkbox"
                    checked={sameWhatsapp}
                    onChange={e => setSameWhatsapp(e.target.checked)}
                  />
                  Même numéro que le téléphone
                </label>
                {err("whatsapp")}
              </div>
            </div>

            <button className="cf-btn" type="submit" disabled={loading}>
              {loading ? "Création en cours…" : "Créer ma fiche gratuite"}
            </button>

            <p className="cf-note">
              {creationStatus?.freeSlots} place(s) Essentielle gratuite(s)
              restante(s). Pro ou Signature sont disponibles à tout moment.
            </p>
            <button
              className="cf-btn cf-secondary"
              type="button"
              onClick={() => {
                setPurchaseMode(true);
                setFormError("");
              }}
            >
              Choisir une formule ou plusieurs fiches
            </button>
          </div>
        </>
      )}
    </form>
  );
}

function PlanBar({
  plan,
  freeSlots,
}: {
  plan: FichePurchaseInput["plan"];
  freeSlots?: number;
}) {
  const formula =
    plan === "pro" ? "Pro" : plan === "signature" ? "Signature" : "Essentielle";
  return (
    <div className="cf-plan">
      <div>
        <small>Formule</small>
        <b>{formula}</b>
      </div>
      <span>
        {plan === "essentielle" && freeSlots
          ? `${freeSlots} place(s) gratuite(s) restante(s)`
          : plan === "essentielle"
            ? "Emplacement payant"
            : "Abonnement"}
      </span>
    </div>
  );
}
