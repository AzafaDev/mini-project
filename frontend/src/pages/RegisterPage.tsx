import React, { useState } from "react";

const RegistrationPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("attendee");

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex flex-col font-['Inter',sans-serif]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#131313] z-50">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="text-xl font-bold tracking-tighter text-white">
            EventPulse
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-6 items-center text-sm tracking-tight">
              <a
                className="text-[#C7C4D8] hover:bg-[#2A2A2A] transition-colors px-3 py-2 rounded"
                href="#"
              >
                Home
              </a>
              <a
                className="text-[#C7C4D8] hover:bg-[#2A2A2A] transition-colors px-3 py-2 rounded"
                href="#"
              >
                Events
              </a>
              <a
                className="text-[#C0C1FF] font-semibold px-3 py-2 rounded"
                href="#"
              >
                Register
              </a>
            </div>
            <div className="flex items-center gap-4 text-[#C0C1FF]">
              <span className="material-symbols-outlined cursor-pointer hover:bg-[#2A2A2A] p-2 rounded transition-colors">
                language
              </span>
              <span className="material-symbols-outlined cursor-pointer hover:bg-[#2A2A2A] p-2 rounded transition-colors">
                help_outline
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Canvas */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 bg-[#131313]">
        <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Decoration: Editorial Context */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-6 pr-8">
            <h1 className="text-5xl font-extrabold tracking-tighter leading-none text-white">
              Curate <br />
              <span className="text-[#c0c1ff]">Exceptional</span> Moments.
            </h1>
            <p className="text-[#c7c4d8] text-lg leading-relaxed">
              Join the premier ecosystem for architecting high-impact events.
              Designed for precision, built for scale.
            </p>
            <div className="mt-4 p-6 rounded bg-[#1c1b1b] border border-[#464555]/15">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-[#2a2a2a]">
                  <img
                    className="w-full h-full object-cover"
                    alt="Marcus Thorne"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO9JKhp4QnWMIg6fJ2faIm3P8RxaVwBAC9-6ETHLtn-iXwG-XoKO_WFwXgo28-2NmmOHCLXla6CFsTrI7O0lvoJrFhJ_Tz9Oo4bc6_Dq5OfyGccgmhsZ0bQr-DJPF7eelgkSxBuq0SV0dDM3yAbxOghjadOx5awIMfsPuD4J9TZoYtwMLJFoLX91vtJkrmCOQiYuNyZ_EKASo9epl52BbNjIOC9nVUxm7454LeCkx311uhCY-KeCj41Oin1K0lAiR2DC7S2CqD0DjF"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#e5e2e1]">
                    Marcus Thorne
                  </p>
                  <p className="text-xs text-[#c7c4d8]">
                    Lead Architect, Global Pulse
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm italic text-[#c7c4d8]/80">
                "The Midnight Architect system allowed us to scale our
                registration 4x without losing the premium editorial feel our
                clients expect."
              </p>
            </div>
          </div>

          {/* Registration Card */}
          <div className="lg:col-span-7 w-full max-w-md mx-auto">
            <div className="bg-[#2a2a2a]/80 backdrop-blur-xl p-8 rounded-lg shadow-2xl border border-[#464555]/10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Create Account
                </h2>
                <p className="text-sm text-[#c7c4d8] mt-1">
                  Start your journey with CuratorEvents.
                </p>
              </div>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-[0.75rem] font-medium text-[#c7c4d8] ml-1">
                    Full Name
                  </label>
                  <input
                    className="w-full bg-[#0e0e0e] border-none text-[#e5e2e1] px-4 py-3 rounded-lg focus:ring-1 focus:ring-[#c0c1ff] placeholder:text-[#353534] text-sm transition-all outline-none"
                    placeholder="Enter your full name"
                    type="text"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-[0.75rem] font-medium text-[#c7c4d8] ml-1">
                    Email Address
                  </label>
                  <input
                    className="w-full bg-[#0e0e0e] border-none text-[#e5e2e1] px-4 py-3 rounded-lg focus:ring-1 focus:ring-[#c0c1ff] placeholder:text-[#353534] text-sm transition-all outline-none"
                    placeholder="name@company.com"
                    type="email"
                  />
                </div>

                {/* Role Selection */}
                <div className="space-y-1.5">
                  <label className="block text-[0.75rem] font-medium text-[#c7c4d8] ml-1">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("attendee")}
                      className={`flex items-center justify-center p-3 rounded-lg text-xs font-semibold transition-all border ${
                        selectedRole === "attendee"
                          ? "border-[#c0c1ff] bg-[#c0c1ff]/10 text-[#c0c1ff]"
                          : "border-transparent bg-[#0e0e0e] text-[#c7c4d8]"
                      }`}
                    >
                      Attendee
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("organizer")}
                      className={`flex items-center justify-center p-3 rounded-lg text-xs font-semibold transition-all border ${
                        selectedRole === "organizer"
                          ? "border-[#c0c1ff] bg-[#c0c1ff]/10 text-[#c0c1ff]"
                          : "border-transparent bg-[#0e0e0e] text-[#c7c4d8]"
                      }`}
                    >
                      Organizer
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5 relative">
                  <label className="block text-[0.75rem] font-medium text-[#c7c4d8] ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full bg-[#0e0e0e] border-none text-[#e5e2e1] px-4 py-3 rounded-lg focus:ring-1 focus:ring-[#c0c1ff] placeholder:text-[#353534] text-sm transition-all outline-none"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                    />
                    <span
                      className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#c7c4d8] cursor-pointer text-xl"
                      onClick={togglePassword}
                    >
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </div>
                </div>

                {/* Referral Code */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="block text-[0.75rem] font-medium text-[#c7c4d8]">
                      Referral Code
                    </label>
                    <span className="text-[0.65rem] text-[#c0c1ff] bg-[#c0c1ff]/10 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                      Mandatory
                    </span>
                  </div>
                  <input
                    className="w-full bg-[#0e0e0e] border-none text-[#e5e2e1] px-4 py-3 rounded-lg focus:ring-1 focus:ring-[#c0c1ff] placeholder:text-[#353534] text-sm transition-all border-l-2 border-[#c0c1ff] outline-none"
                    placeholder="XYZ-12345"
                    type="text"
                  />
                </div>

                {/* CTA Button */}
                <button className="w-full mt-4 py-4 rounded-lg bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#c0c1ff]/20">
                  Create Account
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#464555]/15"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#1C1B1B] px-4 text-[#c7c4d8] font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Signup */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-3 rounded-lg bg-[#353534] border border-[#464555]/10 text-[#e5e2e1] text-xs font-semibold hover:bg-[#393939] transition-colors">
                  <img
                    className="w-4 h-4"
                    alt="Google"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBARFNj6vbCnAX242h8cpfNZc7gr7iArFPHfekqKLLWu1s2rLA68iyqIOoMHRJUXUkbDvoIW4NEgneOLrJae1oBKnLPNgnAeVkUXDDykCfq5c8s2b92VUctAPo9520XcoN04FtwMIpcY5iKJ-FdEhUESSi53a823h-SpMHnEczlGuWC-HjkQP-p-F6m8PPuePl7mI8Ef8TPSVeBDibKvNYg0AlrgMEssBuZE0q6qvWLYuyN1-Y4P15RRli9Sy9jH4EVJhs7tO6lw-wr"
                  />
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 py-3 rounded-lg bg-[#353534] border border-[#464555]/10 text-[#e5e2e1] text-xs font-semibold hover:bg-[#393939] transition-colors">
                  <span className="material-symbols-outlined text-lg">
                    apple
                  </span>
                  Apple
                </button>
              </div>

              <p className="mt-8 text-center text-xs text-[#c7c4d8]">
                Already have an account?{" "}
                <a
                  className="text-[#c0c1ff] font-semibold hover:underline"
                  href="#"
                >
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0E0E0E] w-full py-8 mt-auto border-t border-[#464555]/15">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-4 text-xs font-medium">
          <div className="text-lg font-black text-white">EventPulse</div>
          <div className="text-[#C7C4D8]">
            © 2024 EventPulse Architecture. All rights reserved.
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
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegistrationPage;
