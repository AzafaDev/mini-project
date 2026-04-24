import { create } from "zustand";

/**
 * Tipe pesan notifikasi Toast
 */
export type ToastType = "success" | "error" | "info";

/**
 * Interface untuk data notifikasi Toast
 */
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

/**
 * Zustand Store untuk mengelola notifikasi Toast sistem.
 * Menangani penambahan dan penghapusan notifikasi dengan auto-dismiss.
 * Ini adalah store paling sederhana tapi paling sering dipakai seluruh aplikasi.
 */
interface ToastStore {
  toasts: Toast[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  
  /**
   * Menambahkan notifikasi toast baru
   * @param type - Tipe notifikasi (success, error, info)
   * @param message - Pesan yang akan ditampilkan
   * Otomatis hilang setelah 4 detik
   */
  addToast: (type, message) => {
    // Generate ID unik untuk setiap toast
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
    
    // Auto remove setelah 4 detik
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  
  /**
   * Menghapus toast secara manual berdasarkan ID
   * @param id - ID toast yang akan dihapus
   */
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
