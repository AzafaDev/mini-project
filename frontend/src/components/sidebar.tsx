import { LayoutDashboard, Ticket, History, User } from "lucide-react"; // atau pakai material icons sesuai seleramu

export const Sidebar = () => {
  return (
    // <aside className="h-screen w-64 fixed left-0 top-0 bg-[#1C1B1B] z-[60] hidden md:flex flex-col p-6 border-r border-white/5">
    //   <div className="mb-10 text-xl font-bold text-indigo-200">Organizer</div>
    //   <nav className="space-y-2">
    //     <a
    //       href="/dashboard"
    //       className="flex items-center gap-3 p-3 bg-white/5 rounded-lg text-white"
    //     >
    //       <LayoutDashboard size={20} /> Dashboard
    //     </a>
    //     <a
    //       href="/transactions"
    //       className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-[#c7c4d8]"
    //     >
    //       <History size={20} /> Transactions
    //     </a>
    //     {/* Tambahkan menu lainnya */}
    //   </nav>
    // </aside>

    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#1C1B1B] z-[60] hidden md:flex flex-col p-6 border-r border-white/5">
      <div className="flex items-center gap-3 px-3 py-6">
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

      <div className="mt-auto pt-4">
        <button className="w-full bg-gradient-to-br from-[#C0C1FF] to-[#4B4DD8] text-[#07006C] font-bold py-3 px-4 rounded shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
          <span className="material-symbols-outlined">add_circle</span>
          New Event
        </button>
      </div>
    </aside>
  );
};
