import React, { useState } from "react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#131313] text-[#e5e2e1] font-['Inter',sans-serif]">
      {/* Subtle Ambient Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#4b4dd8]/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-[#413f82]/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Login Shell Container */}
      <main className="relative z-10 w-full max-w-[440px] px-6">
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="mb-4 p-3 rounded-lg bg-[#2a2a2a]">
            <span className="material-symbols-outlined text-[#c0c1ff] text-4xl">
              analytics
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            CuratorEvents
          </h1>
          <p className="text-[#c7c4d8] font-medium tracking-tight text-sm">
            {" "}
            Professional event curation infrastructure.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1c1b1b] rounded-lg p-8 shadow-2xl ring-1 ring-white/5">
          <form className="flex flex-col gap-6" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-semibold tracking-wider text-[#c7c4d8] uppercase ml-1"
                htmlFor="email"
              >
                Work Email
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c4d8] text-xl group-focus-within:text-[#c0c1ff] transition-colors">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-[#0e0e0e] border-none ring-1 ring-[#464555]/30 rounded-lg pl-11 pr-4 text-[#e5e2e1] placeholder:text-[#c7c4d8]/40 focus:ring-2 focus:ring-[#c0c1ff]/50 transition-all outline-none"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label
                  className="text-xs font-semibold tracking-wider text-[#c7c4d8] uppercase"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  className="text-xs font-medium text-[#c0c1ff] hover:text-[#c0c1ff]/80 transition-colors"
                  href="#"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c4d8] text-xl group-focus-within:text-[#c0c1ff] transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-[#0e0e0e] border-none ring-1 ring-[#464555]/30 rounded-lg pl-11 pr-4 text-[#e5e2e1] placeholder:text-[#c7c4d8]/40 focus:ring-2 focus:ring-[#c0c1ff]/50 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Primary Action */}
            <button
              type="submit"
              className="h-12 rounded-lg font-bold text-[#07006c] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#4b4dd8]/20 mt-2 bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8]"
            >
              Sign In
              <span className="material-symbols-outlined text-lg">
                arrow_forward
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-2">
              <div className="h-[1px] flex-1 bg-[#464555]/20"></div>
              <span className="text-[10px] font-bold text-[#c7c4d8] uppercase tracking-widest">
                or continue with
              </span>
              <div className="h-[1px] flex-1 bg-[#464555]/20"></div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-3 h-11 rounded-lg bg-[#2a2a2a] text-[#e5e2e1] text-sm font-semibold hover:bg-[#393939] transition-colors ring-1 ring-white/5"
              >
                <img
                  alt="Google"
                  className="w-5 h-5 grayscale"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvP02xn3zrylFBmeSar0Nxf99C-e5Ui_K9c3BTfQbehty_uTiQmWn72dc_PyTY4puspo34VpCTRun6L0KTVu5QZ6pkO6ibOaA1HrLytgvZDBq0hX7GVwJwtsqMzb7sNHhu1nzmn7ABid80sdrMSe9mNrvh3JA8I9lB1bJ1kzKsPdr9xzSAOHVruf4ACs_sbLcrANevK9Pgm6QWHQ7QVStN2cWYeEBf-Kbn75mj_SMpRXvvJGJKxqYARdcY5u9dh31bq43iu-WRFfJU"
                />
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-3 h-11 rounded-lg bg-[#2a2a2a] text-[#e5e2e1] text-sm font-semibold hover:bg-[#393939] transition-colors ring-1 ring-white/5"
              >
                <svg className="w-5 h-5 fill-[#e5e2e1]" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                </svg>
                GitHub
              </button>
            </div>
          </form>
        </div>

        {/* Footer / Secondary Navigation */}
        <div className="mt-8 text-center flex flex-col gap-4">
          <p className="text-[#c7c4d8] text-sm font-medium">
            Don't have an account?{" "}
            <a
              className="text-[#c0c1ff] font-bold hover:underline decoration-2 underline-offset-4"
              href="#"
            >
              Request Access
            </a>
          </p>
          <nav className="flex justify-center gap-6">
            <a
              className="text-[10px] uppercase tracking-widest font-black text-[#c7c4d8]/50 hover:text-[#e5e2e1] transition-colors"
              href="#"
            >
              Privacy
            </a>
            <a
              className="text-[10px] uppercase tracking-widest font-black text-[#c7c4d8]/50 hover:text-[#e5e2e1] transition-colors"
              href="#"
            >
              Legal
            </a>
            <a
              className="text-[10px] uppercase tracking-widest font-black text-[#c7c4d8]/50 hover:text-[#e5e2e1] transition-colors"
              href="#"
            >
              Architecture
            </a>
          </nav>
        </div>
      </main>

      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] opacity-30"></div>
    </div>
  );
};

export default LoginPage;
