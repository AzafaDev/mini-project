import { useToastStore, type ToastType } from "../../stores/useToastStore";

const toastIcons: Record<ToastType, string> = {
  success: "check_circle",
  error: "error",
  info: "info",
};

const toastStyles: Record<ToastType, string> = {
  success: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20",
  error: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20",
  info: "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20",
};

export function Toast() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 flex flex-col gap-3 items-end md:left-auto md:right-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
            animate-slide-in min-w-[280px] max-w-[400px] w-full md:w-auto
            ${toastStyles[toast.type]}
          `}
        >
          <span className="material-symbols-outlined text-xl flex-shrink-0">
            {toastIcons[toast.type]}
          </span>
          <span className="text-sm font-medium flex-1 text-text-light break-words">
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-text-muted hover:text-text-light transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close notification"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      ))}
    </div>
  );

}
