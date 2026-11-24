import { useEffect, type RefObject } from "react";

/**
 * Tracks whether the user clicks outside of a referenced element
 * (e.g. the floating transaction card) and invokes `onOutsideClick`.
 * Used by Add Transaction / Transaction Detail to surface a confirmation
 * modal before the user accidentally abandons an unsaved form.
 *
 * `ref` is attached to the element to watch, `onOutsideClick` is called when
 * a click lands outside, and `enabled` can be set to false to pause tracking
 * (e.g. while a confirmation modal is already open) without unmounting.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, onOutsideClick, enabled]);
}
