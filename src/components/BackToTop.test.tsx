import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import BackToTop from "./BackToTop";

function scrollPageTo(y: number) {
  vi.stubGlobal("scrollY", y);
  fireEvent.scroll(window);
}

function queryButton() {
  return screen.queryByRole("button", { name: "Back to top" });
}

/** Renders past one screen of scrolling, clicks, and returns the scroll spy. */
function clickWithReducedMotion(matches: boolean) {
  const scrollTo = vi.fn();
  vi.stubGlobal("scrollTo", scrollTo);
  vi.stubGlobal("matchMedia", () => ({ matches }));
  render(<BackToTop />);
  scrollPageTo(window.innerHeight + 1);
  fireEvent.click(screen.getByRole("button", { name: "Back to top" }));
  return scrollTo;
}

describe("BackToTop", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("appears only after one screen of scrolling", () => {
    render(<BackToTop />);
    expect(queryButton()).toBeNull();

    scrollPageTo(window.innerHeight);
    expect(queryButton()).toBeNull();

    scrollPageTo(window.innerHeight + 1);
    expect(queryButton()).toBeTruthy();

    scrollPageTo(0);
    expect(queryButton()).toBeNull();
  });

  it("scrolls smoothly to the top", () => {
    const scrollTo = clickWithReducedMotion(false);

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("jumps to the top when reduced motion is preferred", () => {
    const scrollTo = clickWithReducedMotion(true);

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });

  it("does not count as a click outside an open form", () => {
    const outsideClick = vi.fn();
    document.addEventListener("mousedown", outsideClick);
    render(<BackToTop />);
    scrollPageTo(window.innerHeight + 1);

    fireEvent.mouseDown(screen.getByRole("button", { name: "Back to top" }));

    expect(outsideClick).not.toHaveBeenCalled();
    document.removeEventListener("mousedown", outsideClick);
  });
});
