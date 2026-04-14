import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/dashboard" },
  { id: "events", label: "My Events", icon: "event", path: "/dashboard?tab=events" },
  { id: "vouchers", label: "Vouchers", icon: "local_offer", path: "/dashboard?vouchers" },
  { id: "transactions", label: "Transactions", icon: "receipt_long", path: "/transactions/organizer" },
];

export const Sidebar = ({ activeTab = "dashboard", onTabChange }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const handleNavClick = (item: typeof navItems[0]) => {
    navigate(item.path);
    onTabChange?.(item.id);
  };

  const handleNewEvent = () => {
    navigate("/events/create");
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#1C1B1B] z-[60] hidden md:flex flex-col border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-10 h-10 rounded bg-[#4B4DD8] flex items-center justify-center">
          <span
            className="material-symbols-outlined text-[#C0C1FF]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tighter">Pro Organizer</h2>
          <p className="text-[10px] uppercase tracking-widest text-[#C7C4D8]">
            Enterprise Tier
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const itemPathParts = item.path.split("?");
            const basePath = itemPathParts[0];
            const itemParams = Object.fromEntries(new URLSearchParams(itemPathParts[1] || ""));
            const currentParams = Object.fromEntries(searchParams);
            
            const pathMatches = location.pathname === basePath;
            const paramsMatch = Object.keys(itemParams).every(
              key => itemParams[key] === currentParams[key]
            );
            
            const isActive = activeTab === item.id || (pathMatches && paramsMatch && Object.keys(itemParams).length > 0);
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? "bg-[#4B4DD8] text-white"
                      : "text-[#C7C4D8] hover:bg-[#2A2A2A] hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* New Event Button */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleNewEvent}
          className="w-full bg-gradient-to-br from-[#C0C1FF] to-[#4B4DD8] text-[#07006C] font-bold py-3 px-4 rounded shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 hover:shadow-xl"
        >
          <span className="material-symbols-outlined">add_circle</span>
          New Event
        </button>
      </div>
    </aside>
  );
};