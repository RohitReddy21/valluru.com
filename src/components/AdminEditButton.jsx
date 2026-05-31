import { Link } from 'react-router-dom';
import { isAdminUnlocked } from '../data/cms';

export default function AdminEditButton({ pageKey, sectionId, label = 'Edit section' }) {
  if (!isAdminUnlocked()) return null;

  const params = new URLSearchParams();
  if (pageKey) params.set('page', pageKey);
  if (sectionId) params.set('section', sectionId);

  return (
    <Link
      to={`/admin?${params.toString()}`}
      className="admin-edit-button"
      aria-label={`${label} in admin`}
    >
      {label}
    </Link>
  );
}
