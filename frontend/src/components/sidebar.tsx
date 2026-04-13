export const Sidebar = () => {
  return (
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
