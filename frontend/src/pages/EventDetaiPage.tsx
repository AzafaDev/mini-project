import React, { useState } from "react";
import { motion } from "framer-motion";

const EventDetailPage: React.FC = () => {
  // State untuk manajemen tiket
  const [tickets, setTickets] = useState({
    general: 0,
    architect: 1,
  });

  const PRICE_GENERAL = 450000;
  const PRICE_ARCHITECT = 1250000;

  const total =
    tickets.general * PRICE_GENERAL + tickets.architect * PRICE_ARCHITECT;

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("Rp", "IDR ");
  };

  const handleUpdateTicket = (type: "general" | "architect", delta: number) => {
    setTickets((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta),
    }));
  };

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen font-sans selection:bg-[#c0c1ff]/30">
      <main className="pt-16 min-h-screen">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[614px] overflow-hidden">
          <img
            alt="Main Event Hero"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdRDS19K5BkPJR_o2gLhL_xSButi1v__xH0YgKvN3kq9-HtpAvjR_2gAdUFjid84mEd0CaTu2Sq-c2J4pwmljaPxupQub4NmuRrlvhQpBgg2VnBlUlURuheitOpwPORiqygxSyVPs8qDWcudVps9rRxX1SIXgjUUBZj_yQzZFY27qefC5xmU9u0trPGRuD6wL-eHP_1j5Bf1CBqxODn823AnAbiLnf39GZwrsUL0CGfEoVnugGWZnzXmh1eqwNnOXh4TzEcX6BmU-X"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/40 to-transparent"></div>

          <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="bg-[#4b4dd8]/20 text-[#c0c1ff] px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg">
                Featured Event
              </span>
              <span className="bg-[#353534] text-[#c7c4d8] px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg">
                Architecture & Sound
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#e5e2e1] mb-6 leading-none">
              NEON ARCHITECTS:
              <br />
              AURAL SPACES
            </h1>

            <div className="flex flex-wrap gap-8 text-[#c7c4d8]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#c0c1ff]">
                  calendar_today
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold">
                    Date & Time
                  </p>
                  <p className="text-[#e5e2e1] font-medium">
                    Saturday, Dec 14 • 20:00 - 04:00
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#c0c1ff]">
                  location_on
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold">
                    Location
                  </p>
                  <p className="text-[#e5e2e1] font-medium">
                    Gelora Bung Karno, Jakarta
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="px-8 py-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Kolom Kiri */}
          <div className="lg:col-span-7 space-y-12">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#c0c1ff] mb-6">
                The Experience
              </h2>
              <div className="text-lg text-[#c7c4d8] leading-relaxed space-y-6">
                <p>
                  Join us for an immersive journey where architectural precision
                  meets sonic depth. Neon Architects is a curated audiovisual
                  showcase featuring world-class digital artists and electronic
                  music pioneers.
                </p>
                <p>
                  The performance utilizes a custom-built 360-degree spatial
                  audio system, designed specifically for the unique geometry of
                  the venue.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1c1b1b] p-6 rounded-lg border border-white/5">
                <span className="material-symbols-outlined text-[#c0c1ff] mb-4">
                  groups
                </span>
                <h4 className="font-bold text-[#e5e2e1]">Capacity</h4>
                <p className="text-sm text-[#c7c4d8]">
                  Limited to 500 attendees for an intimate experience.
                </p>
              </div>
              <div className="bg-[#1c1b1b] p-6 rounded-lg border border-white/5">
                <span className="material-symbols-outlined text-[#c0c1ff] mb-4">
                  verified
                </span>
                <h4 className="font-bold text-[#e5e2e1]">Age Limit</h4>
                <p className="text-sm text-[#c7c4d8]">
                  Must be 21+ with valid ID for entry.
                </p>
              </div>
            </div>

            <div className="w-full h-80 bg-[#1c1b1b] rounded-lg overflow-hidden relative group">
              <img
                alt="Location Map"
                className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuALfQmCwQgrGmJ2Ux7QQBvzPXTn8QdW8FwfPtMcq8YTjwIQ2lsC_5qRAsmnza4LUDqlw1Z-C0WctN_lEX3FncxfGMHokj_QVq8XRZcY21vx_M_SLuLOZLsaNpnbWnqYMOErxQsTSSLXGcW7ME_WvUwZDr4xqhp5WnoFCSXnFjGrjSEr7Kk6g6GCDPS2ap7NnCUK-J9bVeAlSKlIPRUKvRhTDXZCMCTQtEa0QhapuORNAUH_pR_pD9B13zrTxQ50Bho1CMvEWSYbwyUy"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-[#c0c1ff] px-6 py-3 rounded-lg text-[#07006c] font-bold flex items-center gap-2 shadow-2xl active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-sm">
                    pin_drop
                  </span>
                  <span>Get Directions</span>
                </button>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Checkout */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="bg-[#2a2a2a] p-8 rounded-xl shadow-2xl border border-white/5">
                <h3 className="text-2xl font-bold tracking-tight text-[#e5e2e1] mb-8">
                  Select Tickets
                </h3>

                <div className="space-y-4">
                  {/* General */}
                  <div
                    className={`p-5 bg-[#1c1b1b] rounded-lg border transition-all ${tickets.general > 0 ? "border-[#c0c1ff]" : "border-transparent"}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-[#e5e2e1]">
                          General Admission
                        </h4>
                        <p className="text-xs text-[#c7c4d8]">
                          Standard floor access
                        </p>
                      </div>
                      <span className="text-[#c0c1ff] font-black">
                        {formatIDR(PRICE_GENERAL)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-[#ffdad6] bg-[#93000a]/30 px-2 py-0.5 rounded">
                        Low Stock
                      </span>
                      <div className="flex items-center gap-4 bg-[#353534] px-3 py-1 rounded-full">
                        <button
                          onClick={() => handleUpdateTicket("general", -1)}
                          className="text-[#c7c4d8] hover:text-[#c0c1ff]"
                        >
                          <span className="material-symbols-outlined text-lg">
                            remove
                          </span>
                        </button>
                        <span className="font-bold min-w-[1rem] text-center">
                          {tickets.general}
                        </span>
                        <button
                          onClick={() => handleUpdateTicket("general", 1)}
                          className="text-[#c7c4d8] hover:text-[#c0c1ff]"
                        >
                          <span className="material-symbols-outlined text-lg">
                            add
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* VIP */}
                  <div
                    className={`p-5 bg-[#1c1b1b] rounded-lg border transition-all ${tickets.architect > 0 ? "border-[#c0c1ff] shadow-[0_0_20px_rgba(192,193,255,0.1)]" : "border-transparent"}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#e5e2e1]">
                            Architect Tier (VIP)
                          </h4>
                          <span className="material-symbols-outlined text-[#c0c1ff] text-sm">
                            stars
                          </span>
                        </div>
                        <p className="text-xs text-[#c7c4d8]">
                          Lounge, open bar, artist meet
                        </p>
                      </div>
                      <span className="text-[#c0c1ff] font-black">
                        {formatIDR(PRICE_ARCHITECT)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-[#c0c1ff] bg-[#c0c1ff]/10 px-2 py-0.5 rounded">
                        Most Popular
                      </span>
                      <div className="flex items-center gap-4 bg-[#353534] px-3 py-1 rounded-full">
                        <button
                          onClick={() => handleUpdateTicket("architect", -1)}
                          className="text-[#c7c4d8] hover:text-[#c0c1ff]"
                        >
                          <span className="material-symbols-outlined text-lg">
                            remove
                          </span>
                        </button>
                        <span className="font-bold min-w-[1rem] text-center">
                          {tickets.architect}
                        </span>
                        <button
                          onClick={() => handleUpdateTicket("architect", 1)}
                          className="text-[#c7c4d8] hover:text-[#c0c1ff]"
                        >
                          <span className="material-symbols-outlined text-lg">
                            add
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[#c7c4d8] font-medium">
                      Total Price
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-[#e5e2e1] tracking-tighter">
                      {formatIDR(total)}
                    </span>
                  </div>
                  <button className="w-full py-4 bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] font-bold rounded-lg transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/20">
                    Purchase Tickets
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-8 bg-[#0E0E0E] border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs uppercase tracking-widest text-[#C7C4D8]">
            © 2024 Kinetix Event Architecture.
          </p>
          <div className="flex gap-8">
            <a
              className="text-xs uppercase tracking-widest text-[#C7C4D8] hover:text-[#C0C1FF]"
              href="#"
            >
              Privacy
            </a>
            <a
              className="text-xs uppercase tracking-widest text-[#C7C4D8] hover:text-[#C0C1FF]"
              href="#"
            >
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EventDetailPage;
