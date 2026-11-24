import { createContext, useContext } from "react";

export interface ToastOptions {
  type?: string;
  duration?: number;
}

export interface Toast {
  id: string;
  message: string;
  type: string;
}

export interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined,
);

export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast() must be used inside a <ToastProvider>");
  }

  return context;
}
