/** The 24px initials avatar. Decorative: its parent supplies the name. */
export default function Avatar({ initials }: { initials: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-xl border font-display text-[7px]"
      style={{
        backgroundColor: "var(--color-bg-accent)",
        borderColor: "var(--color-border-soft)",
        color: "var(--color-text-on-accent)",
      }}
    >
      {initials}
    </span>
  );
}
