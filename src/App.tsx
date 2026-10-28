import { lazy, Suspense, useEffect } from "react";
import {
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { IconSprite } from "./components/Icons";
import { SECTORS } from "./data/secteurs";
import RequireAdmin from "./features/auth/RequireAdmin";
import RequireAuth from "./features/auth/RequireAuth";
import { ForgotPasswordPage } from "./features/auth/pages/ForgotPasswordPage";
import LoginPage from "./features/auth/pages/LoginPage"; // Importez votre page de connexion
import RegisterPage from "./features/auth/pages/RegisterPage";
import { ResetPasswordPage } from "./features/auth/pages/ResetPasswordPage";
import { VerifyMailPage } from "./features/auth/pages/VerifyMailPage";
import DashboardPage from "./features/espace-client/pages/DashboardPage";
import DraftsPage from "./features/espace-client/pages/DraftsPage";

import ClientLayout from "./features/espace-client/layout/ClientLayout";
import CallbackRequestsPage from "./features/espace-client/pages/CallbackRequestsPage";
import { FichePage } from "./features/espace-client/pages/FichePage";
import PublicFichePage from "./features/espace-client/pages/PublicFichePage";
import StickerSectionPage from "./features/espace-client/pages/StickerSectionPage";
import SettingsPage from "./features/espace-client/pages/SettingsPage";
import SubscriptionPage from "./features/espace-client/pages/SubscriptionPage";
import AProposPage from "./pages/AProposPage";
import BrandingPage from "./pages/BrandingPage";
import CartesPage from "./pages/CartesPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import LegalPage, { LEGAL_PATHS } from "./pages/LegalPage";
import PanneauxPage from "./pages/PanneauxPage";
import QrSmartPage from "./pages/QrSmartPage";
import SecteursPage from "./pages/SecteursPage";

// Pages chargées à la demande
const ContenuPage = lazy(() => import("./pages/ContenuPage"));
const ImmobilierPage = lazy(() => import("./pages/ImmobilierPage"));
const EditorPage = lazy(
  () => import("./features/espace-client/pages/EditorPage")
);

// Back-office (administrateurs) : chargé à la demande, il n'alourdit ni le site public ni l'espace client
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
const AdminLeads = lazy(() => import("./features/admin/pages/Leads"));
const AdminRelances = lazy(() => import("./features/admin/pages/Relances"));
const AdminProduction = lazy(() => import("./features/admin/pages/Production"));
const AdminQrCodes = lazy(() => import("./features/admin/pages/QrCodes"));
const AdminFormules = lazy(() => import("./features/admin/pages/Formules"));
const AdminNotFound = lazy(() => import("./features/admin/pages/AdminNotFound"));

const SECTOR_IDS: string[] = SECTORS.map(x => x.id);

// Écran d'attente pendant le chargement d'une page lazy
const Wait = () => (
  <div style={{ minHeight: "100vh", background: "#08090A" }} aria-busy="true" />
);

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
 * Inclut le Header et le Footer autour du contenu rendu par <Outlet />.
 */
function PublicLayout() {
  return (
    <>
      <Header current="" />
      <Outlet />
      {/* <Footer current="" /> */}
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
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Wait />}>
        <Routes>
          {/* Ouverture publique des fiches connectées (sans le header du site) */}
          <Route path="/f/:slug" element={<PublicFichePage />} />

          
          <Route path="/s/:slug/:section" element={<StickerSectionPage />} />

          {/* Pages publiques */}
          <Route element={<PublicLayout />}>
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

          {/* Pages espace client */}
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
            <Route path="clients" element={<AdminClients />} />
            <Route path="demandes" element={<AdminLeads />} />
            <Route path="relances" element={<AdminRelances />} />
            <Route path="production" element={<AdminProduction />} />
            <Route path="qrcodes" element={<AdminQrCodes />} />
            <Route path="formules" element={<AdminFormules />} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>

          {/* Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
