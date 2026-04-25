import { useState } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();

  // Define menu items based on user role
  const organizerItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/dashboard" },
    { id: "events", label: "My Events", icon: "event", path: "/dashboard?tab=events" },
    { id: "vouchers", label: "Vouchers", icon: "local_offer", path: "/dashboard?vouchers" },
    { id: "transactions", label: "Transactions", icon: "receipt_long", path: "/transactions/organizer" },
  ];

  const customerItems = [
    { id: "tickets", label: "My Tickets", icon: "confirmation_number", path: "/my-tickets" },
    { id: "history", label: "History", icon: "history", path: "/my-transactions" },
  ];

  const commonItems = [
    { id: "profile", label: "Settings", icon: "settings", path: "/profile" },
  ];

  const navItems = user?.role === "ORGANIZER" 
    ? [...organizerItems, ...commonItems] 
    : [...customerItems, ...commonItems];

  const handleNavClick = (path: string, id: string) => {
    navigate(path);
    onTabChange?.(id);
    setIsOpen(false);
  };

  // LOGIKA BARU: Cek active state berdasarkan Path DAN Query Params
  const checkActive = (item: typeof navItems[0]) => {
    const { path, id } = item;
    const currentPath = location.pathname;
    
    // 1. Cek path dasar
    if (currentPath !== path.split('?')[0]) return false;

    // 2. Logika spesifik Dashboard (Hanya aktif jika tidak ada tab lain)
    if (id === "dashboard") {
      return !searchParams.get("tab") && !searchParams.has("vouchers");
    }

    // 3. Logika My Events
    if (id === "events") {
      return searchParams.get("tab") === "events";
    }

    // 4. Logika Vouchers
    if (id === "vouchers") {
      return searchParams.has("vouchers");
    }

    return true;
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="md:hidden fixed top-4 left-4 z-[70] bg-[#1C1B1B] p-3 rounded-lg shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
      >
        <span className="material-symbols-outlined text-white">
          {isOpen ? "close" : "menu"}
        </span>
      </button>

      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-[55]" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      <aside className={`h-screen w-64 fixed left-0 top-0 bg-[#1C1B1B] z-[60] flex flex-col border-r border-white/5 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Header */}
        <div className="px-6 py-8 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="w-10 h-10 rounded bg-[#4B4DD8] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#C0C1FF]" style={{ fontVariationSettings: "'FILL' 1" }}>
                bolt
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black truncate text-white">{user?.fullName || "User Account"}</h2>
              <p className="text-[10px] uppercase tracking-widest text-[#C7C4D8]">{user?.role || "Member"}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = checkActive(item);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.path, item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      active 
                        ? "bg-[#4B4DD8] text-white" 
                        : "text-[#C7C4D8] hover:bg-[#2A2A2A] hover:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          {user?.role === "ORGANIZER" && (
            <button 
              onClick={() => navigate("/events/create")} 
              className="w-full bg-white/5 hover:bg-white/10 text-white text-xs py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span> New Event
            </button>
          )}
          <button 
            onClick={logout} 
            className="w-full text-red-400 hover:bg-red-500/10 py-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
};
