import { Link } from 'react-router-dom';
import { Icon } from '../components/ui';

/** Page introuvable à l'intérieur du back-office (le menu reste affiché). */
export default function AdminNotFound() {
  return (
    <div className="empty-page">
      <h2>Page introuvable</h2>
      <Link className="adm-btn adm-btn-red" to="/admin"><Icon n="back" s={16} />Tableau de bord</Link>
    </div>
  );
}
