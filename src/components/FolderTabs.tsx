import { Link, useLocation } from "react-router-dom";
import Avatar from "./Avatar";
import {
  getCurrentPage,
  NAV_ITEMS,
  PLACEHOLDER_USER,
  type NavItem,
} from "./navigation";

const TAB =
  "flex items-center gap-2 rounded-t-xl font-display text-sm whitespace-nowrap";

const ACTIVE_STYLE = {
  backgroundColor: "var(--color-tab-active-bg)",
  color: "var(--color-tab-active-text)",
  // Michroma has no bold weight, so the design thickens the active label.
  WebkitTextStroke: "0.3px currentColor",
};

const INACTIVE_STYLE = {
  backgroundColor: "var(--color-tab-inactive-bg)",
  color: "var(--color-tab-inactive-text)",
  boxShadow: "var(--shadow-tab-inactive)",
};

function TabContent({ item, title }: { item: NavItem; title: string }) {
  const Icon = item.icon;
  return (
    <>
      {Icon ? (
        <Icon size={16} aria-hidden="true" />
      ) : (
        <Avatar initials={PLACEHOLDER_USER.initials} />
      )}
      <span>{title}</span>
    </>
  );
}

/**
 * The folder tabs joined to the top of the page panel: every section from
 * 768px up, and only the current page's title on phones.
 */
export default function FolderTabs() {
  const { pathname } = useLocation();
  const page = getCurrentPage(pathname);

  return (
    <>
      <nav aria-label="Primary" className="hidden items-end md:flex">
        {NAV_ITEMS.map((item) => {
          const isActive = item === page?.section;
          // The 24px avatar is taller than an icon, so it gets less padding.
          const padding = item.icon ? "py-4" : "py-3.5";
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive ? page.current : undefined}
              aria-label={item.accessibleName}
              className={`nav-focus ${TAB} px-3 lg:px-8 ${padding}`}
              style={isActive ? ACTIVE_STYLE : INACTIVE_STYLE}
            >
              <TabContent item={item} title={item.label} />
            </Link>
          );
        })}
      </nav>

      {page && (
        <div className="flex md:hidden">
          <p
            className={`${TAB} px-8 ${page.section.icon ? "py-4" : "py-3.5"}`}
            style={ACTIVE_STYLE}
          >
            <TabContent item={page.section} title={page.title} />
          </p>
        </div>
      )}
    </>
  );
}
