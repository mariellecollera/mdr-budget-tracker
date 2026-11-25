import type { ReactNode, Ref } from "react";

interface LayoutProps {
  children: ReactNode;
  variant?: "panel" | "modal";
  clickOutsideRef?: Ref<HTMLDivElement>;
}

export default function Layout({
  children,
  variant = "panel",
  clickOutsideRef,
}: LayoutProps) {
  return (
    <div
      ref={clickOutsideRef}
      className="rounded-tr-[32px] rounded-b-2xl px-3 py-5 md:p-8"
      style={{
        backgroundColor: "var(--color-bg-panel)",
        boxShadow: "var(--shadow-panel)",
      }}
    >
      {variant === "panel" ? (
        <div
          className="p-4 md:p-8"
          style={{
            backgroundColor: "var(--color-bg-card)",
            boxShadow: "var(--shadow-card)",
            border: "1px solid var(--color-border-soft)",
          }}
        >
          {children}
        </div>
      ) : (
        <div
          className="flex justify-center px-4 pb-16 pt-10 sm:px-6"
          style={{ minHeight: "calc(100vh - 96px)" }}
        >
          <div
            className="h-fit w-full max-w-lg rounded-2xl p-6 sm:p-9"
            style={{
              backgroundColor: "var(--color-bg-card)",
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--color-border-soft)",
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
