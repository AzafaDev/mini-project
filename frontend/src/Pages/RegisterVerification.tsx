import { useState, useRef, useEffect } from "react";
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function VerifyEmail() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(59);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Logic untuk Countdown Resend Code
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Pindah ke input berikutnya jika angka diisi
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Pindah ke input sebelumnya jika tombol Backspace ditekan
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalOtp = otp.join("");
    console.log("Verifying OTP:", finalOtp);
    // Tambahkan logic API di sini
    setTimeout(() => setIsSubmitting(false), 2000); // Simulasi loading
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E293B] via-[#A855F7] to-[#FF00E5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mb-4">
            <Mail className="text-sky-600" size={32} />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Verify your email</h2>
        <p className="mt-2 text-center text-sm text-gray-600 px-8">
          We've sent a 6-digit verification code to <span className="font-semibold text-gray-900">user@example.com</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100 text-center">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* OTP INPUTS */}
            <div className="flex justify-between gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  ref={(el) => {(inputRefs.current[index] = el)}}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={otp.some((v) => v === "") || isSubmitting}
              className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gray-900 hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isSubmitting ? <RefreshCw className="animate-spin mr-2" size={20} /> : "Verify Account"}
            </button>
          </form>

          {/* RESEND SECTION */}
          <div className="mt-8">
            <p className="text-sm text-gray-500">
              Didn't receive the code?{" "}
              {timer > 0 ? (
                <span className="text-gray-400 font-medium">Resend in {timer}s</span>
              ) : (
                <button 
                  onClick={() => setTimer(59)}
                  className="text-sky-600 font-bold hover:text-sky-500 transition-colors"
                >
                  Resend Code
                </button>
              )}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50">
            <Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-sky-600 transition-colors">
              <ArrowLeft size={16} />
              Back to registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}