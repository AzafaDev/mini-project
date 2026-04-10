import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import NavbarNew from "../Components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", { email, password });
  };

  return (
    <div className="min-h-screen bg-[#faf9fc] flex flex-col">
      <NavbarNew />

      <main className="flex-grow flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Background Asymmetry Elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#dde1ff] opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#ffdbcf] opacity-20 blur-3xl"></div>

        {/* Login Card Container */}
        <div className="w-full max-w-md z-10">
          {/* Main Form Card */}
          <div className="bg-white rounded-xl p-8 md:p-10 shadow-[0_20px_40px_rgba(15,61,202,0.08)]">
            <div className="mb-8 text-center md:text-left">
              <h1 className="font-sans font-bold text-2xl md:text-3xl tracking-tight text-[#1a1c1e] mb-2">
                Login
              </h1>
              <p className="text-[#444655] text-sm">
                Welcome back to the kinetic world of events.
              </p>
            </div>

            <form action="#" className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-[#747686]"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-[#f4f3f6] border-none rounded-lg py-4 px-4 text-[#1a1c1e] focus:outline-none focus:ring-2 focus:ring-[#0f3dca] focus:ring-offset-2 transition-all placeholder:text-[#c4c5d7]"
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider text-[#747686]"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="text-xs font-semibold text-[#0f3dca] hover:text-[#3659e3] transition-colors"
                    href="#"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    className="w-full bg-[#f4f3f6] border-none rounded-lg py-4 px-4 pr-12 text-[#1a1c1e] focus:outline-none focus:ring-2 focus:ring-[#0f3dca] focus:ring-offset-2 transition-all placeholder:text-[#c4c5d7]"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#747686] hover:text-[#1a1c1e] transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                className="w-full bg-gradient-to-r from-[#0f3dca] to-[#3659e3] text-white font-sans font-bold py-4 px-6 rounded-lg shadow-lg active:scale-[0.98] transition-transform flex justify-center items-center gap-2 group"
                type="submit"
              >
                Sign In
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-[#f4f3f6] w-full border-t border-[#c4c5d7]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-slate-500">
            © 2024 Eventnique. All rights reserved.
          </span>
          <div className="flex gap-8">
            <a
              className="text-sm text-slate-500 hover:text-[#0f3dca] transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-sm text-slate-500 hover:text-[#0f3dca] transition-colors"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="text-sm text-slate-500 hover:text-[#0f3dca] transition-colors"
              href="#"
            >
              Help Center
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
