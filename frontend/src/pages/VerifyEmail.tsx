import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useAuthStore } from "../stores/useAuthStore";
import { verifyEmailSchema } from "../validation/authSchemas";

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [timer, setTimer] = useState<number>(() => {
    const savedTimer = localStorage.getItem("emailVerificationTimer");
    const savedTimestamp = localStorage.getItem("emailVerificationTimerSetAt");

    if (savedTimer && savedTimestamp) {
      const elapsed = Math.floor(
        (Date.now() - parseInt(savedTimestamp, 10)) / 1000,
      );
      const remaining = parseInt(savedTimer, 10) - elapsed;
      return remaining > 0 ? remaining : 0;
    }

    return 59;
  });

  const {
    verifyEmail,
    isLoading,
    error,
    isAuthenticated,
    clearError,
    user,
    resendVerification,
    resendVerificationSuccess,
    clearResendVerificationStatus,
  } = useAuthStore();

  const formik = useFormik({
    initialValues: {
      token: "",
    },
    validationSchema: verifyEmailSchema,
    onSubmit: async (values) => {
      clearError();
      const success = await verifyEmail({ token: values.token });
      if (success) {
        setIsVerified(true);
        localStorage.removeItem("emailVerificationTimer");
        localStorage.removeItem("emailVerificationTimerSetAt");
      }
    },
  });

  // Redirect if already authenticated (verification complete)
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        const newTimer = prev > 0 ? prev - 1 : 0;
        localStorage.setItem("emailVerificationTimer", newTimer.toString());
        localStorage.setItem(
          "emailVerificationTimerSetAt",
          Date.now().toString(),
        );
        return newTimer;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync OTP inputs with Formik values
  const otp = formik.values.token.split("");

  // Handle OTP input changes
  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, "");
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    const newToken = newOtp.join("").slice(0, 6);
    formik.setFieldValue("token", newToken);

    // Focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
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
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    const pasteArray = pasteData.split("").slice(0, 6);
    
    formik.setFieldValue("token", pasteArray.join(""));

    const lastFilledIndex = Math.min(pasteArray.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleResend = async () => {
    clearResendVerificationStatus();
    setResendLoading(true);
    const success = await resendVerification();
    setResendLoading(false);
    if (success) {
      setTimer(59);
      localStorage.setItem("emailVerificationTimer", "59");
      localStorage.setItem(
        "emailVerificationTimerSetAt",
        Date.now().toString(),
      );
    }
  };

  const canSubmit = formik.values.token.length === 6 && !isLoading;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#131313] text-[#e5e2e1] font-['Inter',sans-serif]">
      {/* Subtle Ambient Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#4b4dd8]/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-[#413f82]/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Verify Email Shell Container */}
      <main className="relative z-10 w-full max-w-[440px] px-6">
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="mb-4 p-3 rounded-lg bg-[#2a2a2a]">
            <span className="material-symbols-outlined text-[#c0c1ff] text-4xl">
              mark_email_read
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Verify Your Email
          </h1>
          <p className="text-[#c7c4d8] font-medium tracking-tight text-sm">
            Enter the 6-digit code sent to your email.
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-[#1c1b1b] rounded-lg p-8 shadow-2xl ring-1 ring-white/5">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {resendVerificationSuccess && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
              Verification code resent successfully!
            </div>
          )}
          {isVerified && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
              Email verified successfully! Redirecting to dashboard...
            </div>
          )}

          <form className="flex flex-col gap-6" onSubmit={formik.handleSubmit}>
            {/* OTP Input */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between gap-2 sm:gap-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    value={otp[index] || ""}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    placeholder="0"
                    className={`w-full h-12 text-center text-xl font-bold bg-[#0e0e0e] border-none ring-1 rounded-lg text-[#e5e2e1] transition-all placeholder:text-[#c7c4d8]/40 outline-none ${
                      formik.touched.token && formik.errors.token && formik.values.token.length > 0
                        ? "ring-red-500/50 focus:ring-red-500/50"
                        : "ring-[#464555]/30 focus:ring-[#c0c1ff]/50"
                    }`}
                    disabled={isLoading || isVerified}
                  />
                ))}
              </div>
              {formik.touched.token && formik.errors.token && (
                <p className="text-red-400 text-xs ml-1">{formik.errors.token}</p>
              )}
            </div>

            {/* Primary Action */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="h-12 rounded-lg font-bold text-[#07006c] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#4b4dd8]/20 mt-2 bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </>
              )}
            </button>

            {/* Resend Section */}
            <div className="text-center pt-2">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[#c7c4d8] text-sm">
                  Didn't receive the code?
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={timer > 0 || resendLoading}
                    onClick={handleResend}
                    className={`font-bold text-sm transition-colors ${
                      timer > 0 || resendLoading
                        ? "text-[#c7c4d8] opacity-50 cursor-not-allowed"
                        : "text-[#c0c1ff] hover:underline decoration-2 underline-offset-4"
                    }`}
                  >
                    {resendLoading ? "Sending..." : "Resend Code"}
                  </button>
                  {timer > 0 && (
                    <span className="text-[#464555] h-4 w-[1px] bg-[#464555]/30"></span>
                  )}
                  {timer > 0 && (
                    <span className="text-[#c0c1ff] font-mono text-sm font-medium">
                      0:{timer.toString().padStart(2, "0")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer / Back Link */}
        <div className="mt-8 text-center">
          <p className="text-[#c7c4d8] text-sm font-medium">
            Having trouble?{" "}
            <a
              className="text-[#c0c1ff] font-bold hover:underline decoration-2 underline-offset-4"
              href="/login"
            >
              Back to Login
            </a>
          </p>
        </div>
      </main>

      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] opacity-30"></div>
    </div>
  );
};

export default EmailVerification;
