"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "error" | "success" | "info";

type Toast = {
  id: number;
  message: string;
  kind: ToastKind;
};

type ToastContextValue = {
  pushToast: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue>({
  pushToast: () => undefined,
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev.slice(-4), { id, message, kind }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        data-testid="toast-region"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(100vw-2rem,22rem)] flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            data-testid="toast"
            data-kind={t.kind}
            className={[
              "pointer-events-auto rounded-[var(--radius-button)] px-4 py-3 text-sm font-medium text-white shadow-lg",
              t.kind === "error"
                ? "bg-[var(--color-danger)]"
                : t.kind === "success"
                  ? "bg-[var(--color-primary)]"
                  : "bg-[var(--color-dark)]",
            ].join(" ")}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
