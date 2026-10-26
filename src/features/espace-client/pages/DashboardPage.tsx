import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import { useDashboardFiches } from "../hooks/useDashboardFiches";
import { useClientUser } from "../layout/useClientUser";

export default function DashboardPage() {
  const user = useClientUser();
  const navigate = useNavigate();
  const { data: fiches = [] } = useDashboardFiches();

  useEffect(() => {
    document.title = "Tableau de bord — Support Connecté";
  }, []);

  return (
    <Dashboard
      user={user}
      onView={slug => {
        const fiche = fiches.find(item => item.slug === slug);
        if (fiche) navigate(`/espace-client/fiche/preview/${fiche.id}`);
      }}
      onEdit={ficheId => {
        navigate(`/espace-client/editeur/${ficheId}`);
      }}
    />
  );
}
