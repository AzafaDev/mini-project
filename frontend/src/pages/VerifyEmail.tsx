import React, { useState, useEffect, useRef } from "react";

const EmailVerification: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [timer, setTimer] = useState<number>(59);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle OTP input changes
  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, "");
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Verifying OTP:", otp.join(""));
  };

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex flex-col font-sans selection:bg-[#4b4dd8] selection:text-[#d9d8ff]">
      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-[#c0c1ff]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-[#413f82]/10 rounded-full blur-[100px]" />

        <div className="max-w-md w-full z-10">
          <div className="bg-[#1c1b1b]/80 backdrop-blur-xl p-8 sm:p-12 rounded-xl shadow-2xl border border-[#464555]/10">
            {/* Header & Icon Section */}
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mb-6 ring-8 ring-[#1c1b1b]/50">
                <span className="material-symbols-outlined text-[#c0c1ff] text-3xl">
                  mark_email_read
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#e5e2e1] mb-3">
                Verify Your Email
              </h1>
              <p className="text-[#c7c4d8] text-sm leading-relaxed max-w-[280px]">
                We've sent a 6-digit verification code to your registered email
                address.
              </p>
            </div>

            {/* Verification Form */}
            <form className="space-y-8" onSubmit={handleSubmit}>
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

              <div className="space-y-4">
                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c0c1ff]/20"
                >
                  Verify Email
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                </button>

                <div className="text-center">
                  <div className="inline-flex flex-col items-center gap-1">
                    <span className="text-[#c7c4d8] text-xs uppercase tracking-widest font-semibold">
                      Didn't receive code?
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      <button
                        type="button"
                        disabled={timer > 0}
                        className={`font-medium transition-colors ${
                          timer > 0
                            ? "text-[#c7c4d8] opacity-50 cursor-not-allowed"
                            : "text-[#c0c1ff] hover:text-[#e5e2e1]"
                        }`}
                      >
                        Resend Code
                      </button>
                      <span className="text-[#464555] h-3 w-[1px] bg-[#464555]/30"></span>
                      <span className="text-[#c0c1ff] font-mono font-medium">
                        Resend in 0:{timer.toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer Note */}
            <div className="mt-12 pt-8 border-t border-[#464555]/5 text-center">
              <p className="text-[#c7c4d8]/60 text-xs">
                By verifying, you agree to CuratorEvents{" "}
                <a
                  className="underline hover:text-[#e5e2e1] transition-colors"
                  href="#"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  className="underline hover:text-[#e5e2e1] transition-colors"
                  href="#"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-8 text-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-[#c7c4d8] hover:text-[#e5e2e1] transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">
                keyboard_backspace
              </span>
              Back to Login
            </a>
          </div>
        </div>
      </main>

      {/* Side Backdrop (Hidden on Mobile) */}
      <aside className="hidden lg:block fixed right-0 top-0 bottom-0 w-1/3 overflow-hidden">
        <div className="h-full w-full relative">
          <img
            alt="Event crowd"
            className="h-full w-full object-cover grayscale brightness-[0.2]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB84LAzR_Qv52yJfLqVQgcfSs5wvAF7sOmx1IQYB8xYV5JKZEyW8wwnR6G_1nC9xuPLpB9dE2n9PEvSUtMvaCFRLioWwLtXRCPH8SczsIbZBRfRqNqTi1zHdvjUTly1na272JZaClUeg3FVLSCZdqjRTBxiO_fFqEHeKDmCaiNQojmlUA6exzJP1ChsUo6t7XuSDy6hfZ46qrIlkfD3tqvusyjcoNreFnVNnpTM-iyUaX1AhvrNDthrP6qB9nDzaHnkrRSqHlZ4ctzJ"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#131313] via-transparent to-transparent"></div>
          <div className="absolute bottom-12 left-12 right-12">
            <p className="text-[#c7c4d8] text-sm font-medium tracking-[0.2em] uppercase mb-2">
              CuratorEvents
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-white/90">
              Designing the future of event management.
            </h2>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default EmailVerification;
