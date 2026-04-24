import React, { useState, useRef, useCallback } from "react";

interface OtpInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle OTP input changes
  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, "");
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    const fullOtp = newOtp.join("");
    if (fullOtp.length === length && onComplete) {
      onComplete(fullOtp);
    }
  };

  // Handle backspace
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    const pasteArray = pasteData.split("").slice(0, length);

    const newOtp = [...otp];
    pasteArray.forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    const lastFilledIndex = Math.min(pasteArray.length - 1, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();

    // Check if complete after paste
    const fullOtp = newOtp.join("");
    if (fullOtp.length === length && onComplete) {
      onComplete(fullOtp);
    }
  }, [length, onComplete, otp]);

  return (
    <div className="flex justify-between gap-2 sm:gap-3">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          placeholder="0"
          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold bg-dark-darker border-none rounded-lg focus:ring-2 focus:ring-primary text-text-light transition-all placeholder:text-border-muted/20 outline-none"
        />
      ))}
    </div>
  );
};
