import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color?: string;
  backgroundColor?: string;
}

export default function Badge({
  children,
  color,
  backgroundColor,
}: BadgeProps) {
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        backgroundColor: backgroundColor || "var(--color-badge-bg)",
        color: color || "var(--color-badge-text)",
      }}
    >
      {children}
    </span>
  );
}
