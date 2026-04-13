import React, { useState } from "react";

const CheckoutPage: React.FC = () => {
  // State untuk counter tiket
  const [generalQty, setGeneralQty] = useState<number>(1);
  const [vipQty, setVipQty] = useState<number>(1);
  const [usePoints, setUsePoints] = useState<boolean>(false);

  // Konstanta harga
  const PRICE_GENERAL = 850000;
  const PRICE_VIP = 1750000;
  const SERVICE_FEE = 25000;
  const POINTS_DISCOUNT = 50000;

  // Hitung Total
  const subtotal = generalQty * PRICE_GENERAL + vipQty * PRICE_VIP;
  const total = subtotal + SERVICE_FEE - (usePoints ? POINTS_DISCOUNT : 0);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("Rp", "IDR");
  };

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen font-sans selection:bg-[#c0c1ff]/30">
      {/* TopAppBar */}
      <header className="bg-zinc-950/80 backdrop-blur-xl fixed top-0 w-full z-50 shadow-2xl shadow-black/40">
        <div className="flex justify-between items-center px-6 py-3 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tighter text-indigo-200">
              Aethel Event Suite
            </span>
            <nav className="hidden md:flex gap-6 items-center">
              <a
                className="text-indigo-200 border-b border-indigo-200 pb-1 tracking-tight text-sm font-medium"
                href="#"
              >
                Events
              </a>
              <a
                className="text-zinc-400 hover:text-zinc-200 transition-colors tracking-tight text-sm font-medium"
                href="#"
              >
                My Tickets
              </a>
              <a
                className="text-zinc-400 hover:text-zinc-200 transition-colors tracking-tight text-sm font-medium"
                href="#"
              >
                Schedule
              </a>
              <a
                className="text-zinc-400 hover:text-zinc-200 transition-colors tracking-tight text-sm font-medium"
                href="#"
              >
                Venues
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-indigo-200 hover:bg-zinc-800/50 transition-colors p-2 rounded-full active:scale-95 duration-200">
              notifications
            </button>
            <button className="material-symbols-outlined text-indigo-200 hover:bg-zinc-800/50 transition-colors p-2 rounded-full active:scale-95 duration-200">
              shopping_bag
            </button>
            <div className="w-8 h-8 rounded-full bg-[#353534] flex items-center justify-center overflow-hidden">
              <img
                alt="User profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVQ50q2zCNv3NyiJ1qCD81ZVDGnB_yUdrcgu6HWeDWqSAd_nzkeITslE8CtFdILS0PcsZ5uPYwbzSWe4uTwjwOxLtiiXwPnyndi2kaVTG_EgXNpvuTzGct1N5nctXt-8P5P-h7DREZdQvmWmcLZEms2rAfd0__oeJIaDg3G9nccS5YkASmDidepj9fbHr_Kulu7FrCMj-zGFoN_gC5wJimzk-I2inkB7ODsAM5SDluF1dUI39_bcvLuXa9rYgatu5Dr7ql-hoqekCI"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-screen-2xl mx-auto">
        {/* Breadcrumb / Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-[#c7c4d8] text-xs mb-4">
            <span>Events</span>
            <span className="material-symbols-outlined text-xs">
              chevron_right
            </span>
            <span>Checkout</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-[#e5e2e1]">
            Secure Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-12">
            {/* Event Summary Card */}
            <section className="bg-[#1c1b1b] rounded-xl overflow-hidden shadow-2xl">
              <div className="h-48 relative overflow-hidden">
                <img
                  alt="Neon Architects Hero"
                  className="w-full h-full object-cover opacity-60"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtu1xVD4E6-0LyKBEexNyGqbW-0iWcWOqwSLmrq-Rf5ya-pvO4WdWbjfxgdPjTfbcPPSwf3IZEF7oleCpw2CZGjHcExMfokS2KIR-VBv-3FUHNX9bTwQVmJz4KbcRqMY4heXdYPRoLKNJuj-dKZA4n_hI7ih7n8aW7qp3utzYs-Jp_eCSj2z1S6fR6XTlilObI940crJULBDQuUpOsvIxBsqx4dd1LV5loEYXyDL85ROM1DIBsClZSl7Q2-fJbzmlh7lHeOaJTXiM5"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1b] to-transparent"></div>
                <div className="absolute bottom-6 left-8">
                  <span className="bg-[#c0c1ff] text-[#07006c] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">
                    Architecture & Sound
                  </span>
                  <h2 className="text-3xl font-bold tracking-tight text-white">
                    Neon Architects: Aural Spaces
                  </h2>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#c0c1ff]">
                    calendar_today
                  </span>
                  <div>
                    <p className="text-[#e5e2e1] font-semibold text-sm">
                      October 24, 2024
                    </p>
                    <p className="text-[#c7c4d8] text-xs">
                      19:00 - 23:00 GMT+7
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#c0c1ff]">
                    location_on
                  </span>
                  <div>
                    <p className="text-[#e5e2e1] font-semibold text-sm">
                      The Zenith Pavilion
                    </p>
                    <p className="text-[#c7c4d8] text-xs">
                      Central Jakarta, ID
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#c0c1ff]">
                    confirmation_number
                  </span>
                  <div>
                    <p className="text-[#e5e2e1] font-semibold text-sm">
                      {generalQty + vipQty} Tickets Reserved
                    </p>
                    <p className="text-[#c7c4d8] text-xs">Expires in 14:55</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Ticket Selection Area */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold tracking-tight text-[#e5e2e1]">
                Select Ticket Tiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* General Tier */}
                <div className="bg-[#2a2a2a] border-2 border-transparent hover:border-[#4b4dd8]/40 p-6 rounded-xl transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-[#e5e2e1]">
                        General Admission
                      </h4>
                      <p className="text-[#c7c4d8] text-sm mt-1">
                        Full access to main arena and outdoor gallery.
                      </p>
                    </div>
                    <span className="bg-[#353534] px-2 py-1 rounded text-xs text-[#c7c4d8]">
                      Available
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-black text-[#e5e2e1]">
                      {formatIDR(PRICE_GENERAL)}
                    </span>
                    <div className="flex items-center gap-4 bg-[#0e0e0e] rounded-full px-4 py-2">
                      <button
                        onClick={() =>
                          setGeneralQty(Math.max(0, generalQty - 1))
                        }
                        className="material-symbols-outlined text-[#c7c4d8] hover:text-[#c0c1ff]"
                      >
                        remove
                      </button>
                      <span className="font-bold w-4 text-center">
                        {generalQty}
                      </span>
                      <button
                        onClick={() => setGeneralQty(generalQty + 1)}
                        className="material-symbols-outlined text-[#c7c4d8] hover:text-[#c0c1ff]"
                      >
                        add
                      </button>
                    </div>
                  </div>
                </div>

                {/* VIP Tier */}
                <div className="bg-[#2a2a2a] border-2 border-[#c0c1ff] p-6 rounded-xl relative shadow-[0_0_20px_rgba(192,193,255,0.1)]">
                  <div className="absolute -top-3 left-6 bg-[#c0c1ff] px-3 py-1 rounded-full text-[10px] font-bold text-[#07006c]">
                    MOST POPULAR
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-[#e5e2e1]">
                        VIP Experience
                      </h4>
                      <p className="text-[#c7c4d8] text-sm mt-1">
                        Priority entry, VIP lounge, and kit.
                      </p>
                    </div>
                    <span className="bg-[#c0c1ff]/20 text-[#c0c1ff] px-2 py-1 rounded text-xs">
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-black text-[#e5e2e1]">
                      {formatIDR(PRICE_VIP)}
                    </span>
                    <div className="flex items-center gap-4 bg-[#0e0e0e] rounded-full px-4 py-2 border border-[#c0c1ff]/30">
                      <button
                        onClick={() => setVipQty(Math.max(0, vipQty - 1))}
                        className="material-symbols-outlined text-[#c7c4d8] hover:text-[#c0c1ff]"
                      >
                        remove
                      </button>
                      <span className="font-bold w-4 text-center">
                        {vipQty}
                      </span>
                      <button
                        onClick={() => setVipQty(vipQty + 1)}
                        className="material-symbols-outlined text-[#c7c4d8] hover:text-[#c0c1ff]"
                      >
                        add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Vouchers and Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1c1b1b] p-6 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ffb695]">
                    confirmation_number
                  </span>
                  <h3 className="font-bold text-[#e5e2e1]">Voucher Code</h3>
                </div>
                <div className="flex gap-2">
                  <input
                    className="bg-[#0e0e0e] border-none text-[#e5e2e1] placeholder:text-zinc-600 rounded-lg px-4 py-3 flex-grow focus:ring-1 focus:ring-[#c0c1ff] outline-none"
                    placeholder="ENTER CODE"
                    type="text"
                  />
                  <button className="bg-[#353534] text-[#e5e2e1] px-6 py-3 rounded-lg font-bold hover:bg-[#393939] transition-all active:scale-95">
                    Apply
                  </button>
                </div>
                <p className="text-[10px] text-[#c7c4d8] uppercase tracking-widest">
                  Only one voucher per transaction
                </p>
              </div>

              <div className="bg-[#1c1b1b] p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#c0c1ff]">
                      stars
                    </span>
                    <h3 className="font-bold text-[#e5e2e1]">Loyalty Points</h3>
                  </div>
                  <span className="text-xs bg-[#c0c1ff]/10 text-[#c0c1ff] px-2 py-1 rounded-full font-semibold">
                    12,450 pts
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#0e0e0e] p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-[#e5e2e1]">
                      Use 5,000 Points
                    </p>
                    <p className="text-xs text-[#c7c4d8]">Save IDR 50.000</p>
                  </div>
                  <button
                    onClick={() => setUsePoints(!usePoints)}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${usePoints ? "bg-[#c0c1ff]" : "bg-zinc-700"}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${usePoints ? "left-7" : "left-1"}`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-[#2a2a2a] rounded-xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#c0c1ff]/10 blur-[100px] rounded-full"></div>
              <h3 className="text-xl font-bold tracking-tight text-[#e5e2e1] mb-8">
                Order Summary
              </h3>

              <div className="space-y-4 border-b border-[#464555]/15 pb-8 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-[#c7c4d8]">
                    General Admission ({generalQty}x)
                  </span>
                  <span className="text-[#e5e2e1] font-medium">
                    {formatIDR(generalQty * PRICE_GENERAL)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#c7c4d8]">
                    VIP Experience ({vipQty}x)
                  </span>
                  <span className="text-[#e5e2e1] font-medium">
                    {formatIDR(vipQty * PRICE_VIP)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#c7c4d8]">Service Fee</span>
                  <span className="text-[#e5e2e1] font-medium">
                    {formatIDR(SERVICE_FEE)}
                  </span>
                </div>
              </div>

              {usePoints && (
                <div className="space-y-4 border-b border-[#464555]/15 pb-8 mb-8">
                  <div className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-[#ffb4ab]">
                        stars
                      </span>
                      <span className="text-[#c7c4d8]">Points Applied</span>
                    </div>
                    <span className="text-[#ffb4ab] font-medium">
                      - {formatIDR(POINTS_DISCOUNT)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-end mb-10">
                <div>
                  <p className="text-[10px] text-[#c7c4d8] uppercase tracking-[0.2em] font-bold mb-1">
                    Total Payable
                  </p>
                  <p className="text-3xl font-black text-[#e5e2e1] tracking-tighter">
                    {formatIDR(total)}
                  </p>
                </div>
                <p className="text-[10px] text-[#c7c4d8]">incl. VAT 11%</p>
              </div>

              <button className="w-full bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_25px_rgba(75,77,216,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                Proceed to Payment
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              <div className="mt-6 flex justify-center items-center gap-4 grayscale opacity-40">
                <span className="material-symbols-outlined text-2xl">
                  credit_card
                </span>
                <span className="material-symbols-outlined text-2xl">
                  account_balance_wallet
                </span>
                <span className="material-symbols-outlined text-2xl">
                  qr_code_2
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[#c7c4d8] text-xs">
              <span className="material-symbols-outlined text-sm">lock</span>
              Secure SSL Encrypted Transaction
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-zinc-950/90 backdrop-blur-md z-50 border-t border-zinc-800/50">
        <div className="flex flex-col items-center justify-center text-zinc-500">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-medium">Home</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-indigo-500/10 text-indigo-200 rounded-xl px-6 py-1">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            confirmation_number
          </span>
          <span className="text-[10px] font-medium">Tickets</span>
        </div>
        <div className="flex flex-col items-center justify-center text-zinc-500">
          <span className="material-symbols-outlined">redeem</span>
          <span className="text-[10px] font-medium">Rewards</span>
        </div>
        <div className="flex flex-col items-center justify-center text-zinc-500">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </nav>
    </div>
  );
};

export default CheckoutPage;
