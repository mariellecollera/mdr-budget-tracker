import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  ToastContext,
  type Toast,
  type ToastContextValue,
} from "./ToastContext";
import ToastViewport from "../components/ToastViewport";

const DEFAULT_DURATION = 3000;

/**
 * `children` is whatever gets put BETWEEN the opening and closing tags —
 * mount this once in main.jsx, wrapping <App />, same as ThemeProvider.
 *
 * Toast state lives here (not per-page) specifically so a toast triggered
 * right before a redirect (e.g. Save on Add Transaction, which navigates
 * to "/") still shows up on the page you land on, instead of getting wiped
 * out when the triggering page unmounts.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // showToast is called from event handlers (onClick/onSubmit), not derived
  // from render/props, so scheduling the timer here directly is fine — no
  // useEffect needed. (Effects are for syncing with state that changes on
  // its own between renders; this is a one-off imperative action.)
  const showToast = useCallback<ToastContextValue["showToast"]>(
    (message, { type = "default", duration = DEFAULT_DURATION } = {}) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismissToast(id), duration);
      return id;
    },
    [dismissToast],
  );

  // Memoized so consumers relying on reference equality don't re-render
  // unless showToast/dismissToast themselves change (they never do, thanks
  // to useCallback with stable deps).
  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
