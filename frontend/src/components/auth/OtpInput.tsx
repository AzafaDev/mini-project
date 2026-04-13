import React, { useState, useRef } from "react";

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
    newOtp[index] = value.substring(value.length - 1);
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
          placeholder="0"
          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold bg-[#0e0e0e] border-none rounded-lg focus:ring-2 focus:ring-[#c0c1ff] text-[#e5e2e1] transition-all placeholder:text-[#464555]/20 outline-none"
        />
      ))}
    </div>
  );
};
