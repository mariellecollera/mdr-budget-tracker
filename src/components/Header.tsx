import mdr from "../assets/mdr.svg";

const logoMask = `url("${mdr}") center / contain no-repeat`;

export default function Header() {
  return (
    <header className="flex items-center gap-3 p-4 md:h-12 md:px-3 md:py-0">
      {/* Masked so the one logo file can take each theme's color. */}
      <span
        aria-hidden="true"
        className="h-6 w-12 shrink-0 md:h-7 md:w-[55px]"
        style={{ backgroundColor: "var(--color-logo)", mask: logoMask }}
      />
      <span className="sr-only font-display text-xs md:not-sr-only">
        MICRODATA REFINEMENT
      </span>
    </header>
  );
}
