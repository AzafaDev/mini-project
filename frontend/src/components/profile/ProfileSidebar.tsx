import React from "react";

interface ProfileSidebarProps {
  userName?: string;
  userTier?: string;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  userName = "Organizer Studio",
  userTier = "Premium Tier",
}) => {
  const menuItems = [
    { name: "Dashboard", icon: "dashboard" },
    { name: "Events", icon: "event" },
    { name: "Registrations", icon: "group" },
    { name: "Settings", icon: "settings", active: true },
  ];

  return (
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
              {userName}
            </div>
            <div className="text-[10px] text-[#C7C4D8] uppercase tracking-widest">
              {userTier}
            </div>
          </div>
        </div>
        <button className="w-full mt-4 bg-[#353534] text-[#C0C1FF] text-xs py-2 rounded-lg font-bold hover:bg-[#393939] transition-all">
          Upgrade Plan
        </button>
      </div>
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => (
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
};
