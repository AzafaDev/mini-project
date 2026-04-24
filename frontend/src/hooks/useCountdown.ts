import { useEffect, useState, useRef } from "react";

/**
 * Interface hasil return dari hook useCountdown
 */
interface CountdownResult {
  timeLeft: string;
  isExpired: boolean;
  totalSeconds: number;
}

/**
 * Custom hook untuk menghitung mundur waktu dengan format HH:MM:SS
 * Update setiap 1 detik, otomatis berhenti ketika waktu habis
 * @param targetDate - Tanggal target akhir countdown dalam format string ISO
 */
export const useCountdown = (targetDate: string | null | undefined): CountdownResult => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  
  // Gunakan useRef untuk menyimpan reference interval agar bisa di-cleanup
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Jika tidak ada target date, reset semua state
    if (!targetDate) {
      setTimeLeft("");
      setIsExpired(false);
      return;
    }

    /**
     * Fungsi kalkulasi selisih waktu dan update state
     */
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      // Jika waktu sudah habis
      if (difference <= 0) {
        setTimeLeft("00:00:00");
        setIsExpired(true);
        setTotalSeconds(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return;
      }

      setTotalSeconds(Math.floor(difference / 1000));

      // Kalkulasi jam, menit, detik dari selisih milidetik
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // Format dengan leading zero 2 digit
      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
      setIsExpired(false);
    };

    // Jalankan sekali saat pertama kali mount
    calculateTime();
    // Jalankan setiap 1 detik
    intervalRef.current = setInterval(calculateTime, 1000);

    // Cleanup interval ketika komponen unmount atau targetDate berubah
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [targetDate]);

  return { timeLeft, isExpired, totalSeconds };
};

/**
 * Custom hook untuk menghitung mundur waktu dalam satuan menit
 * Update setiap 1 menit, lebih hemat performa untuk countdown durasi panjang
 * @param targetDate - Tanggal target akhir countdown dalam format string ISO
 */
export const useCountdownMinutes = (
  targetDate: string | null | undefined
): { minutesLeft: number; isExpired: boolean } => {
  const [minutesLeft, setMinutesLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setMinutesLeft(0);
      setIsExpired(false);
      return;
    }

    /**
     * Kalkulasi sisa menit
     */
    const calculateMinutes = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setMinutesLeft(0);
        setIsExpired(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return;
      }

      setMinutesLeft(Math.floor(difference / (1000 * 60)));
      setIsExpired(false);
    };

    calculateMinutes();
    // Update hanya setiap 60 detik untuk menghemat resource
    intervalRef.current = setInterval(calculateMinutes, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [targetDate]);

  return { minutesLeft, isExpired };
};