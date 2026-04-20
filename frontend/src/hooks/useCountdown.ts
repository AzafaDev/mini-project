import { useEffect, useState, useRef } from "react";

interface CountdownResult {
  timeLeft: string;
  isExpired: boolean;
  totalSeconds: number;
}

export const useCountdown = (targetDate: string | null | undefined): CountdownResult => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft("");
      setIsExpired(false);
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

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

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
      setIsExpired(false);
    };

    calculateTime();
    intervalRef.current = setInterval(calculateTime, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [targetDate]);

  return { timeLeft, isExpired, totalSeconds };
};

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
    intervalRef.current = setInterval(calculateMinutes, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [targetDate]);

  return { minutesLeft, isExpired };
};