import type { ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";

const base =
  "inline-flex items-center gap-1.5 text-xs font-semibold font-display transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-70";

interface TextLinkProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** When set, renders a router link (button props are ignored). */
  to?: string;
}

export default function TextLink({
  children,
  to,
  className = "",
  style,
  ...rest
}: TextLinkProps) {
  const combinedClassName = `${base} ${className}`;
  const combinedStyle = { color: "var(--color-btn-navigation-text)", ...style };

  if (to) {
    return (
      <Link to={to} className={combinedClassName} style={combinedStyle}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={combinedClassName}
      style={combinedStyle}
      {...rest}
    >
      {children}
    </button>
  );
}
