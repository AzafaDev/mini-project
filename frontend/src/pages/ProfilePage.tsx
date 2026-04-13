import React from "react";

// --- Sub-Components ---

const Sidebar = () => (
  <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 bg-[#1C1B1B] flex-col py-6 px-4 gap-2 z-40 pt-20">
    <div className="mb-8 px-4">
      <div className="flex items-center gap-3 mb-2">
        <img
          className="w-10 h-10 rounded-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMIi3oA8ClFG0LdduEuZLhW5_oQlpjBRWMC9oqlfZHCnElcZE7_gKp5lqdhlcIJYowP5RQtDbTuVGFkFKYgEQq1oKBeXg-bKGZAFBzpirrflGoYwg9Mg6swHLfmxDlIMytqDAHHDjM62A-buWdr3r6_yObU-cKRWndEIssJtj8ZRonC4o2wjsfx53y9DwLPNd8lXg55q5Va3aiQX50h7cBtXk8aS8nnaOTxWgJfkBvqxocgAt6-ac8onMDDGBt7VOh-MnU94LwxTdO"
          alt="Organizer"
        />
        <div>
          <div className="text-sm font-black text-[#E5E2E1]">
            Organizer Studio
          </div>
          <div className="text-[10px] text-[#C7C4D8] uppercase tracking-widest">
            Premium Tier
          </div>
        </div>
      </div>
      <button className="w-full mt-4 bg-[#353534] text-[#C0C1FF] text-xs py-2 rounded-lg font-bold hover:bg-[#393939] transition-all">
        Upgrade Plan
      </button>
    </div>
    <nav className="flex flex-col gap-1">
      {[
        { name: "Dashboard", icon: "dashboard" },
        { name: "Events", icon: "event" },
        { name: "Registrations", icon: "group" },
        { name: "Settings", icon: "settings", active: true },
      ].map((item) => (
        <a
          key={item.name}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            item.active
              ? "bg-[#2A2A2A] text-[#C0C1FF] font-semibold border-r-4 border-[#C0C1FF]"
              : "text-[#C7C4D8] hover:bg-[#2A2A2A] hover:text-[#E5E2E1]"
          }`}
          href="#"
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-sm">{item.name}</span>
        </a>
      ))}
    </nav>
    <div className="mt-auto flex flex-col gap-1">
      <a
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#C7C4D8] hover:bg-[#2A2A2A] transition-all"
        href="#"
      >
        <span className="material-symbols-outlined">help</span>
        <span className="text-sm">Help Center</span>
      </a>
      <a
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#C7C4D8] hover:bg-[#2A2A2A] transition-all"
        href="#"
      >
        <span className="material-symbols-outlined">logout</span>
        <span className="text-sm">Logout</span>
      </a>
    </div>
  </aside>
);

// --- Main Page Component ---

export default function AccountSettings() {
  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen font-sans selection:bg-[#c0c1ff]/30">
      <Sidebar />

      <main className="lg:ml-64 pt-24 pb-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-[#e5e2e1] mb-2">
              Account Settings
            </h1>
            <p className="text-[#c7c4d8] text-base">
              Manage your personal presence, security, and membership status.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Profile Identity Card */}
            <section className="md:col-span-8 bg-[#1c1b1b] rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#c0c1ff]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-[#2a2a2a] relative">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgqLhXXJNbmvvCdEbZ7AKonin1xZJEPSH5PlQU7Y3xT-5MXpJuyVWH3IrJWepOI0LM2vzo00b31D5nypgmoYaTculyAv1-okKaF_x0qyZ2sazvBnVc0DVFTnlyf7fC96kIPlbDi15Vps65AGriAuE_mdL1fstX46X8rFm_WQcRgwuLN-lZLNUuRRei6ibWSxai0eo6SwuQFoUn-c3Ko6aME_LOvQckieY6XJ21uij78J4FGUXEVoO2xyrgbjuQVsc8pJfeWW7SHXHS"
                    alt="Profile"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="material-symbols-outlined text-white text-3xl">
                      photo_camera
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 bg-[#c0c1ff] text-[#07006c] p-1.5 rounded-full shadow-lg">
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    edit
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-6 w-full relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      label: "Full Name",
                      val: "Alexander Sterling",
                      type: "text",
                    },
                    {
                      label: "Email Address",
                      val: "alex.sterling@eventpulse.io",
                      type: "email",
                    },
                    {
                      label: "Phone Number",
                      val: "+1 (555) 0123-4567",
                      type: "text",
                    },
                    {
                      label: "Location",
                      val: "San Francisco, CA",
                      type: "text",
                    },
                  ].map((field) => (
                    <div key={field.label} className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#c7c4d8]">
                        {field.label}
                      </label>
                      <input
                        className="w-full bg-[#0e0e0e] border-none focus:ring-1 focus:ring-[#c0c1ff] text-[#e5e2e1] py-3 px-4 rounded-lg outline-none"
                        type={field.type}
                        defaultValue={field.val}
                      />
                    </div>
                  ))}
                </div>
                <button className="bg-[#353534] text-[#e5e2e1] px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#393939] transition-all">
                  Save Changes
                </button>
              </div>
            </section>

            {/* Points Balance Card */}
            <section className="md:col-span-4 bg-gradient-to-br from-[#4b4dd8] to-[#494bd6] rounded-xl p-8 flex flex-col justify-between text-[#d9d8ff] relative overflow-hidden group">
              <span className="material-symbols-outlined absolute top-4 right-4 opacity-20 text-6xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
                token
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">
                  Pulse Balance
                </div>
                <div className="text-5xl font-black tracking-tighter text-white">
                  12,450
                </div>
              </div>
              <div className="mt-8">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-sm font-semibold">
                    Tier Status: Platinum
                  </span>
                  <span className="text-xs opacity-80">Next reward: 15k</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-[#c0c1ff] w-4/5 rounded-full"></div>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section className="md:col-span-6 bg-[#1c1b1b] rounded-xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-[#c0c1ff]">
                  security
                </span>
                <h2 className="text-xl font-bold">Security</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#c7c4d8]">
                    Current Password
                  </label>
                  <input
                    className="w-full bg-[#0e0e0e] border-none focus:ring-1 focus:ring-[#c0c1ff] text-[#e5e2e1] py-3 px-4 rounded-lg outline-none"
                    placeholder="••••••••••••"
                    type="password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#c7c4d8]">
                    New Password
                  </label>
                  <input
                    className="w-full bg-[#0e0e0e] border-none focus:ring-1 focus:ring-[#c0c1ff] text-[#e5e2e1] py-3 px-4 rounded-lg outline-none"
                    placeholder="Min. 12 characters"
                    type="password"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button className="bg-[#c0c1ff] text-[#07006c] px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 active:scale-95 transition-all">
                    Update Security
                  </button>
                  <button className="text-[#c0c1ff] text-sm font-bold px-4 hover:bg-[#c0c1ff]/10 rounded-lg transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </section>

            {/* Membership Section */}
            <section className="md:col-span-6 bg-[#1c1b1b] rounded-xl p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-[#c0c1ff]">
                    verified_user
                  </span>
                  <h2 className="text-xl font-bold">Membership</h2>
                </div>
                <div className="bg-[#0e0e0e] rounded-lg p-6 mb-6 border border-[#464555]/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium">
                      Professional Organizer Plan
                    </span>
                    <span className="bg-[#c0c1ff]/10 text-[#c0c1ff] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Active
                    </span>
                  </div>
                  <div className="text-[#c7c4d8] text-sm leading-relaxed">
                    Your next billing cycle begins on{" "}
                    <span className="text-[#e5e2e1] font-bold">
                      Oct 12, 2024
                    </span>
                    . Access to premium analytics and unlimited registrations is
                    currently enabled.
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button className="text-[#c7c4d8] text-sm font-medium hover:text-[#e5e2e1] transition-colors">
                  Manage Subscription
                </button>
                <button className="text-[#ffb4ab] text-sm font-medium hover:underline">
                  Deactivate Account
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#1C1B1B] h-16 flex items-center justify-around z-50 border-t border-[#464555]/10">
        <span className="material-symbols-outlined text-[#C7C4D8]">
          dashboard
        </span>
        <span className="material-symbols-outlined text-[#C7C4D8]">event</span>
        <span className="material-symbols-outlined text-[#C0C1FF]">
          account_circle
        </span>
        <span className="material-symbols-outlined text-[#C7C4D8]">
          settings
        </span>
      </div>
    </div>
  );
}
