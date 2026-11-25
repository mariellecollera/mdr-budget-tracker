import { Link, useLocation } from "react-router-dom";
import Avatar from "./Avatar";
import { getCurrentPage, NAV_ITEMS, PLACEHOLDER_USER } from "./navigation";

/** The fixed navigation bar shown on phones (below 768px). */
export default function BottomNav() {
  const { pathname } = useLocation();
  const page = getCurrentPage(pathname);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 px-2 pt-2.5 md:hidden"
      style={{ backgroundColor: "var(--color-bg-panel)" }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item === page?.section;
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={isActive ? page.current : undefined}
            aria-label={item.accessibleName}
            className="nav-focus flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg"
            style={{
              color: isActive
                ? "var(--color-text-on-accent)"
                : "var(--color-tab-inactive-bg)",
            }}
          >
            <span className="flex h-5 items-center justify-center">
              {Icon ? (
                <Icon size={20} aria-hidden="true" />
              ) : (
                <Avatar initials={PLACEHOLDER_USER.initials} />
              )}
            </span>
            <span className="text-[10px] tracking-[0.6px] uppercase">
              {item.shortLabel}
            </span>
            {isActive && (
              <span
                aria-hidden="true"
                className="h-0.5 w-6 rounded-full bg-current"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
