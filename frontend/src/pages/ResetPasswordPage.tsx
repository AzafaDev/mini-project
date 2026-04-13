import React, { useState } from "react";

const ResetPassword: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password update requested", formData);
  };

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex flex-col font-['Inter',sans-serif] selection:bg-[#4b4dd8] selection:text-[#d9d8ff]">
      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Atmospheric Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-[#4b4dd8]"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full blur-[100px] bg-[#413f82]"></div>
        </div>

        <div className="w-full max-w-md z-10">
          {/* Brand Anchor */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold tracking-tighter text-[#e5e2e1] mb-2">
              CuratorEvents
            </h1>
            <p className="text-sm tracking-wide text-[#c7c4d8] uppercase">
              Security Protocol
            </p>
          </div>

          {/* Central Reset Card */}
          <div className="bg-[#1c1b1b] p-8 lg:rounded shadow-2xl relative overflow-hidden group">
            {/* Architectural Accent */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c0c1ff] to-transparent opacity-50"></div>

            <header className="mb-8">
              <h2 className="text-xl font-bold tracking-tight mb-2">
                Reset Password
              </h2>
              <p className="text-[#c7c4d8] text-sm leading-relaxed">
                Choose a strong, unique password to secure your account and
                curation data.
              </p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Field: New Password */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs uppercase tracking-widest text-[#c7c4d8] ml-1"
                  htmlFor="new_password"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-[#0e0e0e] border-none focus:ring-1 focus:ring-[#c0c1ff] text-[#e5e2e1] p-3.5 lg:rounded text-sm placeholder-[#918fa1] outline-none"
                    id="new_password"
                    name="new_password"
                    placeholder="••••••••••••"
                    type={showPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c7c4d8] hover:text-[#c0c1ff] transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Password Strength Indicators */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { label: "Lowercase", icon: "error", active: true },
                  { label: "Uppercase", icon: "circle", active: false },
                  { label: "Number", icon: "circle", active: false },
                  { label: "Special Char", icon: "circle", active: false },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-2 py-1.5 bg-[#353534] rounded-lg border border-transparent"
                  >
                    <span
                      className={`material-symbols-outlined text-sm ${item.active ? "text-[#ffb4ab]" : "text-[#c7c4d8]"}`}
                      style={{
                        fontVariationSettings: item.active
                          ? "'FILL' 1"
                          : "'FILL' 0",
                      }}
                    >
                      {item.icon}
                    </span>
                    <span className="text-[10px] uppercase tracking-tighter text-[#c7c4d8]">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Field: Confirm Password */}
              <div className="space-y-1.5 pt-2">
                <label
                  className="block text-xs uppercase tracking-widest text-[#c7c4d8] ml-1"
                  htmlFor="confirm_password"
                >
                  Confirm New Password
                </label>
                <input
                  className="w-full bg-[#0e0e0e] border-none focus:ring-1 focus:ring-[#c0c1ff] text-[#e5e2e1] p-3.5 lg:rounded text-sm placeholder-[#918fa1] outline-none"
                  id="confirm_password"
                  name="confirm_password"
                  placeholder="••••••••••••"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>

              {/* Primary Action */}
              <div className="pt-4">
                <button
                  className="w-full bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] py-4 lg:rounded font-bold tracking-tight text-sm active:scale-[0.98] transition-transform duration-150 shadow-lg shadow-[#c0c1ff]/10"
                  type="submit"
                >
                  Update Password
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-[#464555]/10 flex justify-center">
              <a
                className="flex items-center gap-2 text-[#c0c1ff] hover:text-white transition-colors text-xs uppercase tracking-widest group"
                href="#"
              >
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                Back to Login
              </a>
            </div>
          </div>

          {/* Technical Detail */}
          <div className="mt-8 flex justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span className="text-[10px] uppercase tracking-widest">
                End-to-End Encrypted
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                verified_user
              </span>
              <span className="text-[10px] uppercase tracking-widest">
                Identity Verified
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 flex flex-col md:flex-row justify-center items-center gap-6 mt-auto pb-10 text-xs uppercase tracking-widest">
        <div className="text-sm font-black text-[#E5E2E1]">
          Linear Event Dark System
        </div>
        <div className="flex gap-6">
          <a
            className="text-[#C7C4D8] hover:text-white transition-opacity opacity-80 hover:opacity-100"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="text-[#C7C4D8] hover:text-white transition-opacity opacity-80 hover:opacity-100"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="text-[#C7C4D8] hover:text-white transition-opacity opacity-80 hover:opacity-100"
            href="#"
          >
            Security
          </a>
        </div>
        <div className="text-[#C7C4D8] opacity-60">
          © 2024 Linear Event Dark System
        </div>
      </footer>
    </div>
  );
};

export default ResetPassword;
