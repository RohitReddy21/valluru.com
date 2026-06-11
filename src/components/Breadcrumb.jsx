import { Link, useLocation } from 'react-router-dom';
import { breadcrumbMap } from '../data/seoConfig';

/**
 * Visual breadcrumb navigation component.
 * Automatically renders based on current route.
 * Not shown on the home page.
 */
export default function Breadcrumb() {
  const { pathname } = useLocation();
  const crumbs = breadcrumbMap[pathname];

  if (!crumbs || crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="breadcrumb-nav"
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      <ol className="breadcrumb-list">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li
              key={index}
              className="breadcrumb-item"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {crumb.href && !isLast ? (
                <>
                  <Link to={crumb.href} className="breadcrumb-link" itemProp="item">
                    <span itemProp="name">{crumb.label}</span>
                  </Link>
                  <meta itemProp="position" content={String(index + 1)} />
                  <span className="breadcrumb-sep" aria-hidden="true">›</span>
                </>
              ) : (
                <>
                  <span className="breadcrumb-current" aria-current="page" itemProp="name">
                    {crumb.label}
                  </span>
                  <meta itemProp="position" content={String(index + 1)} />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
