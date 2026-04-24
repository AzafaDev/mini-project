import { useState, useEffect } from "react";

/**
 * Custom hook untuk menunda (debounce) update nilai state.
 * Sangat berguna untuk input search agar tidak memanggil API setiap ketikan.
 * 
 * @param value - Nilai yang akan di-debounce
 * @param delay - Jeda waktu dalam milidetik (default: 300ms)
 * @returns Nilai yang sudah di-debounce
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout untuk menunggu sampai user berhenti mengetik
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout jika nilai berubah sebelum delay selesai
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}