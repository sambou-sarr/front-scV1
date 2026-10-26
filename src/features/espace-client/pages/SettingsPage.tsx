import { useEffect } from "react";
import "../../../styles/dashboard.css";
import { useClientUser } from "../layout/useClientUser";

// Page Paramètres : socle prêt à accueillir profil, mot de passe, notifications.
export default function SettingsPage() {
  const user = useClientUser();
  useEffect(() => {
    document.title = "Paramètres — Support Connecté";
  }, []);
  return (
    <div className="db">
      <header className="db-head">
        <p className="db-k">Espace client</p>
        <h1>Paramètres</h1>
        <p className="db-sub">Gérez votre compte.</p>
      </header>
      <section className="db-card" aria-labelledby="st-compte">
        <h2 id="st-compte">Mon compte</h2>
        <dl className="st-dl">
          <div>
            <dt>Nom</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>Adresse e-mail</dt>
            <dd>{user.email}</dd>
          </div>
        </dl>
        <p className="db-sub2">
          La modification du profil et du mot de passe arrive prochainement.
        </p>
      </section>
    </div>
  );
}
