import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Input Email, 2: Success Message, 3: New Password
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E293B] via-[#A855F7] to-[#FF00E5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
            <KeyRound className="text-sky-500" size={28} />
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {step === 1 && "Forgot password?"}
          {step === 2 && "Check your email"}
          {step === 3 && "Set new password"}
        </h2>
        
        <p className="mt-2 text-center text-sm text-gray-600 px-4">
          {step === 1 && "No worries, we'll send you reset instructions."}
          {step === 2 && "We sent a password reset link to your email address."}
          {step === 3 && "Your new password must be different from previous passwords."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {/* STEP 1: INPUT EMAIL */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-sky-500" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 sm:text-sm transition-all"
                    placeholder="enter your email"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gray-900 hover:bg-sky-600 transition-all active:scale-95"
              >
                Reset Password
              </button>
            </form>
          )}

          {/* STEP 2: SUCCESS STATE (Link Sent) */}
          {step === 2 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="text-green-500" size={32} />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                Didn't receive the email? Check your spam folder or{" "}
                <button onClick={() => setStep(1)} className="text-sky-600 hover:underline">try again.</button>
              </p>
              {/* Tombol simulasi untuk lanjut ke Step 3 (Hanya untuk demo UI) */}
              <button
                onClick={() => setStep(3)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Simulate Link Click (Next Step)
              </button>
            </div>
          )}

          {/* STEP 3: RESET PASSWORD FORM */}
          {step === 3 && (
            <form className="space-y-6" action="#" method="POST">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-sky-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-sky-500" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gray-900 hover:bg-sky-600 transition-all active:scale-95"
              >
                Reset Password
              </button>
            </form>
          )}

          {/* BACK TO LOGIN */}
          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-sky-600 transition-colors">
              <ArrowLeft size={16} />
              Back to log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}