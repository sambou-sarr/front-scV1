import { lazy, Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { IconSprite } from "./components/Icons";
import { api } from "./lib/api";
import { SECTORS } from "./data/secteurs";
import RequireAdmin from "./features/auth/RequireAdmin";
import RequireAuth from "./features/auth/RequireAuth";
import HomePage from "./pages/HomePage"; // page d'entrée : import direct
import { LEGAL_PATHS } from "./pages/LegalPage"; // à créer (voir plus bas)

/* ---------- Pages publiques ---------- */
const AProposPage = lazy(() => import("./pages/AProposPage"));
const BrandingPage = lazy(() => import("./pages/BrandingPage"));
const CartesPage = lazy(() => import("./pages/CartesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ContenuPage = lazy(() => import("./pages/ContenuPage"));
const ImmobilierPage = lazy(() => import("./pages/ImmobilierPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const PanneauxPage = lazy(() => import("./pages/PanneauxPage"));
const QrSmartPage = lazy(() => import("./pages/QrSmartPage"));
const SecteursPage = lazy(() => import("./pages/SecteursPage"));

/* ---------- Fiches publiques ---------- */
const PublicFichePage = lazy(
  () => import("./features/espace-client/pages/PublicFichePage")
);
const StickerSectionPage = lazy(
  () => import("./features/espace-client/pages/StickerSectionPage")
);

/* ---------- Authentification ---------- */
const LoginPage = lazy(() => import("./features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("./features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() =>
  import("./features/auth/pages/ForgotPasswordPage").then(m => ({
    default: m.ForgotPasswordPage,
  }))
);
const ResetPasswordPage = lazy(() =>
  import("./features/auth/pages/ResetPasswordPage").then(m => ({
    default: m.ResetPasswordPage,
  }))
);
const VerifyMailPage = lazy(() =>
  import("./features/auth/pages/VerifyMailPage").then(m => ({
    default: m.VerifyMailPage,
  }))
);

/* ---------- Espace client ---------- */
const ClientLayout = lazy(
  () => import("./features/espace-client/layout/ClientLayout")
);
const DashboardPage = lazy(
  () => import("./features/espace-client/pages/DashboardPage")
);
const DraftsPage = lazy(
  () => import("./features/espace-client/pages/DraftsPage")
);
const CallbackRequestsPage = lazy(
  () => import("./features/espace-client/pages/CallbackRequestsPage")
);
const FichePage = lazy(() =>
  import("./features/espace-client/pages/FichePage").then(m => ({
    default: m.FichePage,
  }))
);
const EditorPage = lazy(
  () => import("./features/espace-client/pages/EditorPage")
);
const SubscriptionPage = lazy(
  () => import("./features/espace-client/pages/SubscriptionPage")
);
const PaymentsPage = lazy(
  () => import("./features/espace-client/pages/PaymentsPage")
);
const SettingsPage = lazy(
  () => import("./features/espace-client/pages/SettingsPage")
);

/* ---------- Back-office (administrateurs) ---------- */
const AdminLayout = lazy(() => import("./features/admin/layout/AdminLayout"));
const AdminLoginPage = lazy(
  () => import("./features/admin/pages/AdminLoginPage")
);
const AdminDashboard = lazy(() => import("./features/admin/pages/Dashboard"));
const AdminFiches = lazy(() => import("./features/admin/pages/Fiches"));
const AdminFicheDetail = lazy(
  () => import("./features/admin/pages/FicheDetail")
);
const AdminClients = lazy(() => import("./features/admin/pages/Clients"));
const AdminBilling = lazy(() => import("./features/admin/pages/Billing"));
const AdminLeads = lazy(() => import("./features/admin/pages/Leads"));
const AdminRelances = lazy(() => import("./features/admin/pages/Relances"));
const AdminProduction = lazy(() => import("./features/admin/pages/Production"));
const AdminModelesCartes = lazy(
  () => import("./features/admin/pages/ModelesCartes")
);
const AdminQrCodes = lazy(() => import("./features/admin/pages/QrCodes"));
const AdminFormules = lazy(() => import("./features/admin/pages/Formules"));
const AdminActionLogs = lazy(
  () => import("./features/admin/pages/AdminActionLogs")
);
const AdminSettings = lazy(
  () => import("./features/admin/pages/AdminSettings")
);
const AdminNotFound = lazy(
  () => import("./features/admin/pages/AdminNotFound")
);

const SECTOR_IDS: string[] = SECTORS.map(x => x.id);

// Écran d'attente plein écran (layouts et pages hors layout)
const Wait = () => (
  <div style={{ minHeight: "100vh", background: "#08090A" }} aria-busy="true" />
);

// Attente locale à l'intérieur d'un layout (le header reste affiché)
const PageWait = () => <div style={{ minHeight: "60vh" }} aria-busy="true" />;

// Remonte en haut de page à chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Layout pour les pages publiques :
 * Header + contenu de la page (chargé à la demande) + Footer.
 */
type PublicAppSettings = {
  platformName: string;
  supportEmail: string | null;
  supportPhone: string | null;
  socialLinks: { instagram?: string; facebook?: string; linkedin?: string };
  maintenance: boolean;
};

function PublicLayout({ settings }: { settings?: PublicAppSettings }) {
  return (
    <>
      <Header current="" />
      <Suspense fallback={<PageWait />}>
        <Outlet />
      </Suspense>
      {settings && (
        <footer className="border-t border-neutral-200 bg-white px-5 py-7 text-center text-sm text-neutral-600">
          <p className="font-semibold text-neutral-900">{settings.platformName}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {settings.supportEmail && (
              <a href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a>
            )}
            {settings.supportPhone && (
              <a href={`tel:${settings.supportPhone}`}>{settings.supportPhone}</a>
            )}
            {Object.entries(settings.socialLinks ?? {}).map(
              ([network, url]) =>
                url && (
                  <a key={network} href={url} target="_blank" rel="noreferrer">
                    {network[0].toUpperCase() + network.slice(1)}
                  </a>
                ),
            )}
          </div>
        </footer>
      )}
    </>
  );
}

function NotFound() {
  return (
    <>
      <IconSprite />
      <Header current="" />
      <main className="notfound">
        <div>
          <p className="label light">Erreur 404</p>
          <h1>Cette page n’existe pas.</h1>
          <p>Elle a peut-être changé d’adresse.</p>
          <Link className="btn btn-red" to="/">
            Retour à l’accueil
          </Link>
        </div>
      </main>
      <Footer current="" />
    </>
  );
}

// /secteurs/:sector → page Secteurs défilée jusqu'au secteur, sinon 404
function SectorRoute() {
  const { sector } = useParams<{ sector: string }>();
  return sector && SECTOR_IDS.includes(sector) ? (
    <SecteursPage focus={sector} />
  ) : (
    <NotFound />
  );
}

export default function App() {
  const { pathname } = useLocation();
  const publicSettings = useQuery({
    queryKey: ["public", "app-settings"],
    queryFn: async () => {
      const response = await api.get<{ settings: PublicAppSettings }>(
        "/public/settings",
      );
      return response.data.settings;
    },
    staleTime: 60_000,
  });
  const settings = publicSettings.data;

  if (settings?.maintenance && !pathname.startsWith("/admin")) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#08090a] px-5 text-center text-white">
        <section className="max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-500">
            {settings.platformName}
          </p>
          <h1 className="mt-4 text-4xl font-semibold">Maintenance en cours</h1>
          <p className="mt-4 leading-7 text-neutral-300">
            La plateforme est temporairement indisponible. Nous faisons le
            nécessaire pour rétablir le service rapidement.
          </p>
          {(settings.supportEmail || settings.supportPhone) && (
            <p className="mt-6 text-sm text-neutral-300">
              Besoin d’aide ?{" "}
              {settings.supportEmail && (
                <a className="text-white underline" href={`mailto:${settings.supportEmail}`}>
                  {settings.supportEmail}
                </a>
              )}
              {settings.supportEmail && settings.supportPhone && " · "}
              {settings.supportPhone && (
                <a className="text-white underline" href={`tel:${settings.supportPhone}`}>
                  {settings.supportPhone}
                </a>
              )}
            </p>
          )}
        </section>
      </main>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Wait />}>
        <Routes>
          {/* Ouverture publique des fiches connectées (sans le header du site) */}
          <Route path="/f/:slug" element={<PublicFichePage />} />
          <Route path="/s/:slug/:section" element={<StickerSectionPage />} />

          {/* Pages publiques */}
          <Route element={<PublicLayout settings={settings} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/cartes-connectees" element={<CartesPage />} />
            <Route path="/qr-smart" element={<QrSmartPage />} />
            <Route path="/panneaux-baches" element={<PanneauxPage />} />
            <Route path="/branding-intelligent" element={<BrandingPage />} />
            <Route path="/secteurs" element={<SecteursPage />} />
            <Route path="/a-propos" element={<AProposPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/creation-contenu" element={<ContenuPage />} />
            <Route path="/promoteur-immobilier" element={<ImmobilierPage />} />
            {LEGAL_PATHS.map(p => (
              <Route key={p} path={p} element={<LegalPage path={p} />} />
            ))}
            <Route path="/secteurs/immobilier" element={<ImmobilierPage />} />
            <Route path="/secteurs/:sector" element={<SectorRoute />} />
          </Route>

          {/* Pages d'authentification */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<VerifyMailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Espace client */}
          <Route
            path="/espace-client"
            element={
              <RequireAuth>
                <ClientLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="fiche/preview/:id" element={<FichePage />} />
            <Route path="demandes-rappel" element={<CallbackRequestsPage />} />
            <Route path="brouillons" element={<DraftsPage />} />
            <Route path="editeur" element={<EditorPage />} />
            <Route path="editeur/:id" element={<EditorPage />} />
            <Route path="abonnements" element={<SubscriptionPage />} />
            <Route path="paiements" element={<PaymentsPage />} />
            <Route path="parametres" element={<SettingsPage />} />
          </Route>

          {/* Back-office : connexion puis pages réservées aux administrateurs */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="fiches" element={<AdminFiches />} />
            <Route path="fiches/:id" element={<AdminFicheDetail />} />
            <Route path="abonnements" element={<AdminBilling />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="demandes" element={<AdminLeads />} />
            <Route path="relances" element={<AdminRelances />} />
            <Route path="production" element={<AdminProduction />} />
            <Route path="cartes" element={<AdminModelesCartes />} />
            <Route path="qrcodes" element={<AdminQrCodes />} />
            <Route path="formules" element={<AdminFormules />} />
            <Route path="historique" element={<AdminActionLogs />} />
            <Route path="parametres" element={<AdminSettings />} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>

          {/* Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
