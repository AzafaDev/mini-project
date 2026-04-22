import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary";
  children?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyles =
    confirmVariant === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-blue-600 hover:bg-blue-700";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-[#1a1a2e] border border-[#2d2d44] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
          >
            <h2 className="text-xl font-semibold text-text-light mb-3">{title}</h2>
            <p className="text-[#a09bb3] mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg border border-[#2d2d44] text-[#a09bb3] hover:bg-[#2d2d44] transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center gap-2 ${buttonStyles} ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading && (
                  <span className="material-symbols-outlined text-lg animate-spin">
                    sync
                  </span>
                )}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}