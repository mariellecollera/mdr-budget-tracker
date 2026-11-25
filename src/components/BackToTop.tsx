import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Floating button that appears after about one screen of scrolling. */
export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function update() {
      setIsVisible(window.scrollY > window.innerHeight);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!isVisible) return null;

  function scrollToTop() {
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      // Scrolling is not "clicking outside" an open form, so don't let this
      // reach the listeners that ask to discard it.
      onMouseDown={(event) => event.stopPropagation()}
      aria-label="Back to top"
      className="fixed right-4 bottom-20 z-40 flex size-10 items-center justify-center rounded-full md:right-8 md:bottom-8"
      style={{
        backgroundColor: "var(--color-btn-primary-bg)",
        color: "var(--color-btn-primary-text)",
      }}
    >
      <ArrowUp size={16} aria-hidden="true" />
    </button>
  );
}
