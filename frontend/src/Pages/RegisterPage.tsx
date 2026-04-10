import { useState } from "react";
import { User, Ticket, Calendar } from "lucide-react";
import NavbarNew from "../Components/Navbar";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [role, setRole] = useState<"customer" | "organizer">("customer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register:", {
      fullName,
      email,
      password,
      phone,
      referralCode,
      role,
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      <NavbarNew />

      <main className="flex-grow flex flex-col md:flex-row min-h-screen">
        {/* Left Side: Editorial Content & Image */}
        <section className="w-full md:w-1/2 relative bg-indigo-50/30 overflow-hidden pt-32 pb-20 px-8 lg:px-16 flex flex-col justify-center">
          <div className="relative z-10 max-w-xl mx-auto md:mx-0">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#dde1ff] text-[#001356] text-xs font-bold tracking-widest uppercase mb-6">
              Join the Movement
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-[#1a1c1e] leading-[1.05] tracking-tighter mb-8">
              Curate the <br />
              <span className="text-[#0f3dca] italic">Extraordinary</span>.
            </h1>
            <p className="text-[#444655] text-xl leading-relaxed mb-12">
              Step into a world where event discovery meets editorial elegance.
              Join Eventnique today and start your journey as a curator or an
              explorer.
            </p>

            {/* Inspiring Image Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(15,61,202,0.25)] group max-w-md">
              <img
                alt="Vibrant music festival"
                className="w-full aspect-[4/5] object-cover transition-transform duration-1000 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuASotCU7UjVlRTbg3itPtomThhPWUHoxlLYls7dKgoIxGaCDlkzeMqyo43p2EDQaZj3YcR5UCUwPXjdTMUkI0N6GEazVMbX2LUfPlo75bsS7ZQfpcLrjF7Zz9HoQyqyvA3c05AcrdmJUWxwBJKPpb474e26CQm6E1qo-CKkJkXJGudpKUtGRoZ5tJu3_rGxi3RzX55mxmqa7IJ5POrEb3LRxR1Jer_yKtJnOy27MOzXWg7nyiyRxiIqsJOdrCz1STXzAaTKjck-JkmU"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f3dca]/80 via-transparent to-transparent flex flex-col justify-end p-8">
                <div className="bg-white/90 backdrop-blur-xl p-6 rounded-xl border border-white/20">
                  <p className="text-[#0f3dca] font-bold mb-1 text-sm uppercase tracking-wider">
                    Upcoming Premiere
                  </p>
                  <p className="text-[#1a1c1e] font-semibold text-lg leading-snug">
                    Indigo Nights: Jakarta Electronic Week 2024
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Abstract background element */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#0f3dca]/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-[#a93800]/5 rounded-full blur-[100px]"></div>
        </section>

        {/* Right Side: Registration Form */}
        <section className="w-full md:w-1/2 bg-white flex items-center justify-center py-20 px-6 lg:px-16">
          <div className="w-full max-w-lg">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.06)] border border-[#c4c5d7]/40">
              <div className="mb-10">
                <h2 className="text-3xl font-bold tracking-tight text-[#1a1c1e]">
                  Create your account
                </h2>
                <p className="text-[#444655] mt-2">
                  Already have an account?{" "}
                  <a
                    className="text-[#0f3dca] font-semibold hover:underline"
                    href="#"
                  >
                    Log in
                  </a>
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Profile Picture Upload */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#747686]">
                    Profile Picture (Optional)
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-[#f4f3f6] flex items-center justify-center border-2 border-dashed border-[#c4c5d7] group cursor-pointer hover:border-[#0f3dca] transition-all overflow-hidden">
                      <User className="text-[#747686] group-hover:text-[#0f3dca] text-3xl" />
                    </div>
                    <button
                      className="text-sm font-bold text-[#0f3dca] hover:text-[#3659e3] transition-colors"
                      type="button"
                    >
                      Upload Image
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#747686]">
                    I want to...
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      className={`relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-[#c4c5d7]/30 cursor-pointer hover:bg-[#f4f3f6] transition-all ${role === "customer" ? "border-[#0f3dca] bg-[#0f3dca]/[0.03]" : ""}`}
                    >
                      <input
                        checked={role === "customer"}
                        className="sr-only"
                        name="role"
                        type="radio"
                        value="customer"
                        onChange={() => setRole("customer")}
                      />
                      <Ticket
                        className={`w-8 h-8 mb-2 ${role === "customer" ? "text-[#0f3dca]" : "text-[#747686]"} group-hover:text-[#0f3dca]`}
                      />
                      <span
                        className={`text-sm font-bold text-[#1a1c1e] ${role === "customer" ? "text-[#0f3dca]" : ""}`}
                      >
                        Discover
                      </span>
                    </label>
                    <label
                      className={`relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-[#c4c5d7]/30 cursor-pointer hover:bg-[#f4f3f6] transition-all ${role === "organizer" ? "border-[#0f3dca] bg-[#0f3dca]/[0.03]" : ""}`}
                    >
                      <input
                        checked={role === "organizer"}
                        className="sr-only"
                        name="role"
                        type="radio"
                        value="organizer"
                        onChange={() => setRole("organizer")}
                      />
                      <Calendar
                        className={`w-8 h-8 mb-2 ${role === "organizer" ? "text-[#0f3dca]" : "text-[#747686]"} group-hover:text-[#0f3dca]`}
                      />
                      <span
                        className={`text-sm font-bold text-[#1a1c1e] ${role === "organizer" ? "text-[#0f3dca]" : ""}`}
                      >
                        Organize
                      </span>
                    </label>
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label
                      className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#747686]"
                      htmlFor="fullname"
                    >
                      Full Name
                    </label>
                    <input
                      className="w-full px-5 py-4 rounded-xl border border-[#c4c5d7]/30 bg-[#f4f3f6]/50 focus:outline-none focus:ring-2 focus:ring-[#0f3dca] focus:ring-offset-2 text-[#1a1c1e] placeholder:text-[#c4c5d7] transition-all"
                      id="fullname"
                      placeholder="Enter your full name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#747686]"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <input
                      className="w-full px-5 py-4 rounded-xl border border-[#c4c5d7]/30 bg-[#f4f3f6]/50 focus:outline-none focus:ring-2 focus:ring-[#0f3dca] focus:ring-offset-2 text-[#1a1c1e] placeholder:text-[#c4c5d7] transition-all"
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label
                        className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#747686]"
                        htmlFor="password"
                      >
                        Password
                      </label>
                      <input
                        className="w-full px-5 py-4 rounded-xl border border-[#c4c5d7]/30 bg-[#f4f3f6]/50 focus:outline-none focus:ring-2 focus:ring-[#0f3dca] focus:ring-offset-2 text-[#1a1c1e] placeholder:text-[#c4c5d7] transition-all"
                        id="password"
                        placeholder="••••••••"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#747686]"
                        htmlFor="phone"
                      >
                        Phone (Optional)
                      </label>
                      <input
                        className="w-full px-5 py-4 rounded-xl border border-[#c4c5d7]/30 bg-[#f4f3f6]/50 focus:outline-none focus:ring-2 focus:ring-[#0f3dca] focus:ring-offset-2 text-[#1a1c1e] placeholder:text-[#c4c5d7] transition-all"
                        id="phone"
                        placeholder="+62 812..."
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#747686]"
                      htmlFor="referral"
                    >
                      Referral Code (Optional)
                    </label>
                    <input
                      className="w-full px-5 py-4 rounded-xl border border-[#c4c5d7]/30 bg-[#f4f3f6]/50 focus:outline-none focus:ring-2 focus:ring-[#0f3dca] focus:ring-offset-2 text-[#1a1c1e] placeholder:text-[#c4c5d7] transition-all"
                      id="referral"
                      placeholder="KINETIC-2024"
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    className="w-full bg-[#0f3dca] hover:bg-[#3659e3] text-white py-4.5 rounded-xl font-bold text-lg shadow-[0_12px_24px_-4px_rgba(15,61,202,0.3)] transition-all active:scale-[0.98] hover:-translate-y-0.5"
                    type="submit"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 bg-white border-t border-[#c4c5d7]/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-8">
          <div className="font-bold text-xl text-[#0f3dca] tracking-tighter">
            Eventnique
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
            <a
              className="text-[#444655] hover:text-[#0f3dca] transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-[#444655] hover:text-[#0f3dca] transition-colors"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="text-[#444655] hover:text-[#0f3dca] transition-colors"
              href="#"
            >
              Help Center
            </a>
            <a
              className="text-[#444655] hover:text-[#0f3dca] transition-colors"
              href="#"
            >
              Contact
            </a>
          </div>
          <div className="text-[#444655] text-sm font-medium opacity-60">
            © 2024 Eventnique. The Kinetic Curator.
          </div>
        </div>
      </footer>
    </div>
  );
}
