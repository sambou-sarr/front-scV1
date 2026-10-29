import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { toApiError } from "../../../lib/apiError";
import {
  createCardRequest,
  getCardRequest,
  type CardModelPreview,
  type CardRequestState,
} from "../espaceClient.service";

const CARD_DETAILS: Record<
  string,
  { label: string; price: number; style: string }
> = {
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

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-[#e3dfd8] bg-white px-3 py-2 text-sm outline-none focus:border-[#08090A] focus:ring-2 focus:ring-[#08090A]/10";

/** Vue agrandie : fond sombre, fermeture par clic extérieur, bouton ✕ ou Échap. */
function Lightbox({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-xl text-white transition hover:bg-white/30"
      >
        ✕
      </button>
      <div
        className="w-full max-w-4xl"
        onClick={event => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

/** Largeur maximale qui garde la carte entièrement visible (80 % de la hauteur d'écran). */
const LARGE_CARD_STYLE = { width: "min(100%, calc(80dvh * 1.586))" } as const;

/** Carte de repli (dégradé) quand aucun modèle n'est défini par l'administration. */
function FallbackCard({
  plan,
  large = false,
}: {
  plan: { label: string; style: string };
  large?: boolean;
}) {
  return (
    <div
      className={`relative flex aspect-[1.586] w-full flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br ${plan.style} text-white shadow-lg ${
        large ? "p-8 sm:p-10" : "p-4"
      }`}
      aria-label={`Aperçu de carte ${plan.label}`}
    >
      <span
        className={`font-semibold uppercase text-white/75 ${
          large ? "text-sm tracking-[0.25em]" : "text-[11px] tracking-[0.2em]"
        }`}
      >
        Support Connecté
      </span>
      <div>
        <p className={`font-semibold ${large ? "text-3xl" : "text-base"}`}>
          {plan.label}
        </p>
        <p className={`mt-1 text-white/75 ${large ? "text-base" : "text-xs"}`}>
          Carte NFC · 1 fiche
        </p>
      </div>
      <span
        className={`absolute rounded-full border border-white/20 ${
          large ? "-right-16 -top-24 h-72 w-72" : "-right-8 -top-12 h-32 w-32"
        }`}
      />
      <span
        className={`absolute rounded-full border border-white/20 ${
          large ? "-right-2 -top-10 h-48 w-48" : "-right-1 -top-5 h-20 w-20"
        }`}
      />
    </div>
  );
}

/** Bouton recto / verso réutilisé dans l'aperçu et dans la vue agrandie. */
function FaceToggle({
  face,
  onChange,
  dark = false,
}: {
  face: "recto" | "verso";
  onChange: (face: "recto" | "verso") => void;
  dark?: boolean;
}) {
  return (
    <div className="flex gap-2" role="group" aria-label="Face de la carte">
      {(["recto", "verso"] as const).map(f => {
        const active = face === f;
        const activeClass = dark
          ? "border-white bg-white text-[#08090A]"
          : "border-[#08090A] bg-[#08090A] text-white";
        const idleClass = dark
          ? "border-white/40 bg-transparent text-white hover:bg-white/10"
          : "border-[#d9d4cb] bg-white text-[#6d665d]";
        return (
          <button
            key={f}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(f)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              active ? activeClass : idleClass
            }`}
          >
            {f === "recto" ? "Recto" : "Verso"}
          </button>
        );
      })}
    </div>
  );
}

/** Badge « Agrandir » affiché sur l'aperçu. */
function ZoomHint() {
  return (
    <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white">
      🔍 Agrandir
    </span>
  );
}

/** Carte définie par l'administration : recto / verso, clic pour agrandir, repli si une image est cassée. */
function CardFaces({ modele }: { modele: CardModelPreview }) {
  const [face, setFace] = useState<"recto" | "verso">("recto");
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);
  const url = face === "recto" ? modele.rectoUrl : modele.versoUrl;
  const alt = `Carte ${modele.nom} — ${face}`;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Agrandir la carte ${modele.nom}`}
        className="relative block aspect-[1.586] w-full cursor-zoom-in overflow-hidden rounded-xl bg-[#f4f1ea] shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]"
      >
        {broken[url] ? (
          <span className="grid h-full place-items-center text-xs text-[#a11225]">
            Image indisponible
          </span>
        ) : (
          <img
            src={url}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setBroken(b => ({ ...b, [url]: true }))}
          />
        )}
        <ZoomHint />
      </button>
      <div className="mt-2">
        <FaceToggle face={face} onChange={setFace} />
      </div>

      {open && (
        <Lightbox label={`Carte ${modele.nom}`} onClose={() => setOpen(false)}>
          <div className="flex flex-col items-center gap-4">
            <div
              className="aspect-[1.586] overflow-hidden rounded-2xl bg-[#f4f1ea] shadow-2xl"
              style={LARGE_CARD_STYLE}
            >
              {broken[url] ? (
                <p className="grid h-full place-items-center text-sm text-[#a11225]">
                  Image indisponible
                </p>
              ) : (
                <img
                  src={url}
                  alt={alt}
                  className="h-full w-full object-contain"
                />
              )}
            </div>
            <FaceToggle face={face} onChange={setFace} dark />
          </div>
        </Lightbox>
      )}
    </div>
  );
}

/** Carte de repli cliquable. */
function FallbackCardZoomable({
  plan,
}: {
  plan: { label: string; style: string };
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Agrandir la carte ${plan.label}`}
        className="relative block w-full cursor-zoom-in text-left"
      >
        <FallbackCard plan={plan} />
        <ZoomHint />
      </button>
      {open && (
        <Lightbox label={`Carte ${plan.label}`} onClose={() => setOpen(false)}>
          <div className="mx-auto" style={LARGE_CARD_STYLE}>
            <FallbackCard plan={plan} large />
          </div>
        </Lightbox>
      )}
    </>
  );
}

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
    onSuccess: carte => {
      queryClient.setQueryData<CardRequestState>(
        ["card-request", ficheId],
        previous => ({ modele: previous?.modele ?? null, carte })
      );
      setAdresse("");
      setTelephone("");
      setNotes("");
    },
  });

  const card = cardQuery.data?.carte;
  const modele = cardQuery.data?.modele ?? null;
  // Le modèle est celui de la formule que le serveur facturera : on aligne le libellé et le prix dessus.
  const plan =
    CARD_DETAILS[modele?.tier ?? formula.toLowerCase()] ??
    CARD_DETAILS.essentielle;
  const canRequest = !card || terminalStatuses.has(card.statut);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate();
  };

  return (
    <section
      className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-[#e3dfd8] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
      aria-labelledby="card-request-title"
    >
      <header className="flex items-start justify-between gap-3 border-b border-[#eee9e1] px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#EF1733]">
            Carte physique
          </p>
          <h2
            id="card-request-title"
            className="text-lg font-semibold leading-tight tracking-tight text-[#08090A]"
          >
            Votre carte {plan.label}
          </h2>
          <p className="mt-0.5 text-xs text-[#6d665d]">
            Carte NFC liée à cette fiche · paiement à la livraison.
          </p>
        </div>
        <div className="shrink-0 rounded-xl bg-[#f7f5f1] px-3 py-1.5 text-right">
          <p className="text-[10px] uppercase tracking-wide text-[#8d8a85]">
            Prix
          </p>
          <strong className="text-sm text-[#111111]">
            {plan.price.toLocaleString("fr-FR")} FCFA
          </strong>
        </div>
      </header>

      <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,260px)_1fr] md:items-start">
        {/* Aperçu (cliquable pour agrandir) */}
        <div className="mx-auto w-full max-w-[280px] md:mx-0">
          {modele ? (
            <CardFaces modele={modele} />
          ) : (
            <FallbackCardZoomable plan={plan} />
          )}
        </div>

        {/* Statut / formulaire */}
        <div className="min-w-0">
          {cardQuery.isPending ? (
            <p className="text-sm text-[#6d665d]" role="status">
              Vérification de vos demandes…
            </p>
          ) : cardQuery.isError ? (
            <div className="text-sm text-[#a11225]" role="alert">
              <p>Impossible de vérifier l’état de votre demande.</p>
              <button
                type="button"
                onClick={() => void cardQuery.refetch()}
                className="mt-1 font-semibold underline"
              >
                Réessayer
              </button>
            </div>
          ) : card && !canRequest ? (
            <div className="rounded-xl border border-[#e3dfd8] p-3">
              <p className="text-sm font-semibold text-[#111111]">
                {STATUS_LABELS[card.statut] ?? "Demande en cours"}
              </p>
              <p className="mt-1 text-sm text-[#6d665d]">
                Votre demande est suivie par notre équipe. Le paiement est dû à
                la livraison.
              </p>
              {card.adresseLivraison && (
                <p className="mt-2 text-xs text-[#6d665d]">
                  Livraison à : {card.adresseLivraison}
                </p>
              )}
            </div>
          ) : !eligible ? (
            <p className="rounded-xl bg-[#f7f5f1] p-3 text-sm leading-5 text-[#6d665d]">
              La demande est disponible pour une fiche publiée disposant d’un
              abonnement actif. Vous pourrez commander la carte dès que ces
              conditions seront remplies.
            </p>
          ) : (
            <form className="space-y-2.5" onSubmit={submit}>
              {card && (
                <p className="text-xs text-[#6d665d]">
                  Dernière demande : {STATUS_LABELS[card.statut] ?? card.statut}
                  . Vous pouvez en effectuer une nouvelle.
                </p>
              )}
              <label className="block text-sm font-medium text-[#25221e]">
                Adresse de livraison
                <textarea
                  required
                  minLength={5}
                  maxLength={500}
                  rows={2}
                  value={adresse}
                  onChange={event => setAdresse(event.target.value)}
                  className={`${FIELD_CLASS} resize-none`}
                />
              </label>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-[#25221e]">
                  Téléphone
                  <input
                    required
                    type="tel"
                    minLength={6}
                    maxLength={30}
                    value={telephone}
                    onChange={event => setTelephone(event.target.value)}
                    className={`${FIELD_CLASS} min-h-10`}
                  />
                </label>
                <label className="block text-sm font-medium text-[#25221e]">
                  Précisions (facultatif)
                  <input
                    type="text"
                    maxLength={1000}
                    value={notes}
                    onChange={event => setNotes(event.target.value)}
                    className={`${FIELD_CLASS} min-h-10`}
                  />
                </label>
              </div>
              {createMutation.isError && (
                <p className="text-sm text-[#a11225]" role="alert">
                  {
                    toApiError(
                      createMutation.error,
                      "La demande n’a pas pu être envoyée."
                    ).message
                  }
                </p>
              )}
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="min-h-10 w-full rounded-xl bg-[#08090A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c9142b] disabled:cursor-not-allowed disabled:opacity-60"
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
