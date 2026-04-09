import { useState } from "react";
import { Mail, Lock, User, Ticket, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("customer");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E293B] via-[#A855F7] to-[#FF00E5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#DDB7FF]">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-[#DDB7FF]">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-sky-600 hover:text-sky-500">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {/* ROLE SELECTOR */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
            <button
              onClick={() => setRole("customer")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                role === "customer" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setRole("organizer")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                role === "organizer" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Organizer
            </button>
          </div>

          <form className="space-y-5">
            {/* FULL NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-sky-500" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 sm:text-sm transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* EMAIL */}
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
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* REFERRAL CODE (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Referral Code <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="mt-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Ticket className="h-5 w-5 text-gray-400 group-focus-within:text-sky-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 sm:text-sm transition-all uppercase placeholder:normal-case"
                  placeholder="e.g. EVENT123"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Use a referral code to get a discount coupon!
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gray-900 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all active:scale-95"
              >
                Get Started
                <ArrowRight size={18} />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 px-4">
              By signing up, you agree to our{" "}
              <a href="#" className="underline hover:text-sky-600">Terms of Service</a> and{" "}
              <a href="#" className="underline hover:text-sky-600">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}