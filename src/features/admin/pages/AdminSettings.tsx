import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCurrentUser, updateCurrentProfile, changeCurrentPassword } from "../../auth/auth.service";
import { getSession, saveSession } from "../../../lib/session";
import { adminApi, type AdminAppSettings } from "../admin.service";
import {
  Badge,
  Btn,
  Empty,
  ErrorBox,
  Field,
  Loading,
  Tabs,
  useAction,
} from "../components/ui";
import { fdate } from "../lib/format";

type SettingsTab = "profile" | "security" | "team" | "application" | "billing";
const TABS: readonly (readonly [SettingsTab, string])[] = [
  ["profile", "Profil"],
  ["security", "Sécurité"],
  ["team", "Équipe admin"],
  ["application", "Application"],
  ["billing", "Facturation"],
];
export default function AdminSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = TABS.some(([tab]) => tab === searchParams.get("section"))
    ? (searchParams.get("section") as SettingsTab)
    : "profile";
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [profile, setProfile] = useState({ nom: "", email: "" });
  const [password, setPassword] = useState({
    currentPassword: "",
    password: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [invitation, setInvitation] = useState({ nom: "", email: "" });
  const [settings, setSettings] = useState<AdminAppSettings>({
    platformName: "Support Connecté",
    supportEmail: "",
    supportPhone: "",
    socialLinks: { instagram: "", facebook: "", linkedin: "" },
    maintenance: false,
  });
  const queryClient = useQueryClient();
  const run = useAction();
  const session = getSession();

  const accountQuery = useQuery({
    queryKey: ["auth", "me", session?.user.id],
    queryFn: getCurrentUser,
    enabled: Boolean(session),
  });
  const adminsQuery = useQuery({
    queryKey: ["admin", "team"],
    queryFn: async () => adminApi.listUsers({ role: "admin", page: 1, limit: 100 }),
    enabled: tab === "team",
  });
  const settingsQuery = useQuery({
    queryKey: ["admin", "app-settings"],
    queryFn: async () => (await adminApi.getAppSettings()).settings,
    enabled: tab === "application",
  });

  useEffect(() => {
    if (accountQuery.data) {
      setProfile({
        nom: accountQuery.data.nom ?? "",
        email: accountQuery.data.email,
      });
    }
  }, [accountQuery.data]);
  useEffect(() => {
    if (settingsQuery.data) setSettings(settingsQuery.data);
  }, [settingsQuery.data]);
  useEffect(() => {
    document.title = "Paramètres administrateur — Support Connecté";
  }, []);

  const selectTab = (next: SettingsTab) => {
    setTab(next);
    setSearchParams(next === "profile" ? {} : { section: next });
  };

  const submitProfile = async (event: FormEvent) => {
    event.preventDefault();
    const updated = await run(
      () =>
        updateCurrentProfile({
          nom: profile.nom.trim(),
          email: profile.email.trim(),
        }),
      "Profil enregistré.",
    );
    if (!updated || !session) return;
    saveSession({
      token: session.token,
      user: {
        ...session.user,
        name: updated.nom,
        email: updated.email,
        emailVerified: updated.emailVerified,
      },
    });
    await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
  };

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (password.password !== password.confirm) {
      setPasswordError("La confirmation du mot de passe ne correspond pas.");
      return;
    }
    setPasswordError("");
    const result = await run(
      () =>
        changeCurrentPassword({
          currentPassword: password.currentPassword,
          password: password.password,
        }),
      "Mot de passe modifié.",
    );
    if (result !== undefined) {
      setPassword({ currentPassword: "", password: "", confirm: "" });
    }
  };

  const inviteAdmin = async (event: FormEvent) => {
    event.preventDefault();
    const result = await run(
      () =>
        adminApi.createAdmin({
          nom: invitation.nom.trim(),
          email: invitation.email.trim(),
        }),
      "Invitation administrateur envoyée.",
    );
    if (result) {
      setInvitation({ nom: "", email: "" });
      await queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
    }
  };

  const changeAdminStatus = async (id: number, active: boolean) => {
    const result = await run(
      () => adminApi.updateAdminStatus(id, active),
      active ? "Administrateur réactivé." : "Administrateur désactivé.",
    );
    if (result) await queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
  };
  const resendInvitation = async (id: number) => {
    const result = await run(
      () => adminApi.resendAdminInvitation(id),
      "Invitation renvoyée.",
    );
    if (result) await queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
  };
  const deleteAdmin = async (id: number) => {
    if (!window.confirm("Supprimer définitivement ce compte administrateur ?")) return;
    const result = await run(() => adminApi.deleteAdmin(id), "Administrateur supprimé.");
    if (result) await queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
  };

  const updateSettings = async (event: FormEvent) => {
    event.preventDefault();
    const result = await run(
      () => adminApi.updateAppSettings(settings),
      "Paramètres de l’application enregistrés.",
    );
    if (result) {
      setSettings(result.settings);
      await queryClient.invalidateQueries({ queryKey: ["public", "app-settings"] });
    }
  };

  return (
    <>
      <header className="ph">
        <p className="eyebrow">Configuration</p>
        <h1>Paramètres administrateur</h1>
        <p className="lede">
          Gérez votre compte, les accès administrateurs et les informations publiques de la plateforme.
        </p>
      </header>
      <Tabs
        value={tab}
        onChange={selectTab}
        tabs={TABS}
      />
      <div role="tabpanel" className="panel" aria-label={TABS.find(([key]) => key === tab)?.[1]}>
        {tab === "profile" && (
          <section>
            <h2>Profil administrateur</h2>
            {accountQuery.isPending ? (
              <Loading />
            ) : accountQuery.isError ? (
              <ErrorBox message={accountQuery.error.message} onRetry={() => void accountQuery.refetch()} />
            ) : (
              <form className="form" onSubmit={submitProfile}>
                <Field label="Nom complet">
                  <input required minLength={2} maxLength={100} autoComplete="name" value={profile.nom} onChange={event => setProfile(current => ({ ...current, nom: event.target.value }))} />
                </Field>
                <Field label="Adresse e-mail" hint="Une nouvelle adresse devra être vérifiée par e-mail.">
                  <input required type="email" maxLength={254} autoComplete="email" value={profile.email} onChange={event => setProfile(current => ({ ...current, email: event.target.value }))} />
                </Field>
                {accountQuery.data?.emailVerified === false && (
                  <p className="note-gold" role="status">Adresse non vérifiée. Un lien sera envoyé après modification de l’adresse.</p>
                )}
                <div className="form-a"><Btn type="submit" kind="red">Enregistrer le profil</Btn></div>
              </form>
            )}
          </section>
        )}

        {tab === "security" && (
          <section>
            <h2>Sécurité du compte</h2>
            <p className="adm-muted">Saisissez votre mot de passe actuel avant d’en choisir un nouveau.</p>
            <form className="form" onSubmit={submitPassword}>
              <Field label="Mot de passe actuel"><input required type="password" autoComplete="current-password" value={password.currentPassword} onChange={event => setPassword(current => ({ ...current, currentPassword: event.target.value }))} /></Field>
              <Field label="Nouveau mot de passe" hint="8 caractères minimum."><input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={password.password} onChange={event => setPassword(current => ({ ...current, password: event.target.value }))} /></Field>
              <Field label="Confirmer le nouveau mot de passe"><input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={password.confirm} onChange={event => setPassword(current => ({ ...current, confirm: event.target.value }))} /></Field>
              {passwordError && <p className="err" role="alert">{passwordError}</p>}
              <div className="form-a"><Btn type="submit" kind="red" disabled={!password.currentPassword || password.password.length < 8 || password.password !== password.confirm}>Changer le mot de passe</Btn></div>
            </form>
          </section>
        )}

        {tab === "team" && (
          <section>
            <h2>Équipe administrateur</h2>
            <p className="adm-muted">Les administrateurs reçoivent un lien sécurisé pour activer leur compte. Le dernier compte actif ne peut pas être supprimé ou désactivé.</p>
            <form className="form" onSubmit={inviteAdmin}>
              <Field label="Nom complet"><input required minLength={2} maxLength={100} autoComplete="name" value={invitation.nom} onChange={event => setInvitation(current => ({ ...current, nom: event.target.value }))} /></Field>
              <Field label="Adresse e-mail"><input required type="email" maxLength={254} autoComplete="email" value={invitation.email} onChange={event => setInvitation(current => ({ ...current, email: event.target.value }))} /></Field>
              <div className="form-a"><Btn type="submit" kind="red" disabled={!invitation.nom.trim() || !invitation.email.trim()}>Inviter un administrateur</Btn></div>
            </form>
            {adminsQuery.isPending ? <Loading /> : adminsQuery.isError ? (
              <ErrorBox message={adminsQuery.error.message} onRetry={() => void adminsQuery.refetch()} />
            ) : adminsQuery.data.users.length === 0 ? <Empty>Aucun administrateur trouvé.</Empty> : (
              <div className="table-wrap">
                <table className="adm-tbl">
                  <thead><tr><th>Administrateur</th><th>Compte</th><th>Créé le</th><th>Actions</th></tr></thead>
                  <tbody>
                    {adminsQuery.data.users.map(admin => (
                      <tr key={admin.id}>
                        <td data-l="Administrateur"><b>{admin.nom || admin.email}</b><small>{admin.email}</small></td>
                        <td data-l="Compte">{!admin.active ? <Badge tone="red">Désactivé</Badge> : admin.emailVerifie ? <Badge tone="green">Actif</Badge> : <Badge tone="gold">Invitation en attente</Badge>}</td>
                        <td data-l="Créé le">{fdate(admin.createdAt)}</td>
                        <td data-l="Actions">
                          <div className="ph-actions">
                            {!admin.emailVerifie && <Btn onClick={() => void resendInvitation(admin.id)}>Renvoyer l’invitation</Btn>}
                            {admin.id !== session?.user.id && (
                              <>
                                <Btn onClick={() => void changeAdminStatus(admin.id, !admin.active)}>{admin.active ? "Désactiver" : "Réactiver"}</Btn>
                                <Btn kind="red" onClick={() => void deleteAdmin(admin.id)}>Supprimer</Btn>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === "application" && (
          <section>
            <h2>Paramètres de l’application</h2>
            {settingsQuery.isPending ? <Loading /> : settingsQuery.isError ? (
              <ErrorBox message={settingsQuery.error.message} onRetry={() => void settingsQuery.refetch()} />
            ) : (
              <form className="form" onSubmit={updateSettings}>
                <Field label="Nom de la plateforme"><input required minLength={2} maxLength={100} value={settings.platformName} onChange={event => setSettings(current => ({ ...current, platformName: event.target.value }))} /></Field>
                <Field label="E-mail de support"><input type="email" maxLength={254} value={settings.supportEmail} onChange={event => setSettings(current => ({ ...current, supportEmail: event.target.value }))} /></Field>
                <Field label="Téléphone de support"><input type="tel" maxLength={40} value={settings.supportPhone} onChange={event => setSettings(current => ({ ...current, supportPhone: event.target.value }))} /></Field>
                <h3>Réseaux sociaux (liens HTTPS)</h3>
                {(["instagram", "facebook", "linkedin"] as const).map(network => (
                  <Field key={network} label={network[0].toUpperCase() + network.slice(1)}>
                    <input type="url" pattern="https://.*" value={settings.socialLinks[network]} onChange={event => setSettings(current => ({ ...current, socialLinks: { ...current.socialLinks, [network]: event.target.value } }))} />
                  </Field>
                ))}
                <label className="toggle">
                  <input type="checkbox" checked={settings.maintenance} onChange={event => setSettings(current => ({ ...current, maintenance: event.target.checked }))} />
                  <span />
                  <b>Activer le mode maintenance public</b>
                </label>
                <p className="adm-muted">En mode maintenance, le site et l’espace client affichent un message d’indisponibilité. Les administrateurs peuvent toujours accéder au back-office.</p>
                <div className="form-a"><Btn type="submit" kind="red">Enregistrer les paramètres</Btn></div>
              </form>
            )}
          </section>
        )}

        {tab === "billing" && (
          <section>
            <h2>Facturation</h2>
            <p className="adm-muted">Les tarifs et règles de facturation restent gérés dans les pages dédiées. Aucun moyen de paiement ni prix n’est modifié ici.</p>
            <div className="ph-actions">
              <Link className="adm-btn adm-btn-ghost" to="/admin/formules">Gérer les formules et tarifs</Link>
              <Link className="adm-btn adm-btn-ghost" to="/admin/abonnements">Consulter abonnements et paiements</Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
