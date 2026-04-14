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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
            animate-slide-in min-w-[280px] max-w-[400px]
            ${toastStyles[toast.type]}
          `}
        >
          <span className="material-symbols-outlined text-xl">
            {toastIcons[toast.type]}
          </span>
          <span className="text-sm font-medium flex-1 text-[#e5e2e1]">
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#c7c4d8] hover:text-[#e5e2e1] transition-colors p-1"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
