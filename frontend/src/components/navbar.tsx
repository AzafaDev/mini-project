import { motion } from "framer-motion";

export const Navbar = () => (
  <header className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-200">
    <div className="flex items-center justify-between px-8 h-16 w-full max-w-[1440px] mx-auto">
      <div className="flex items-center gap-8">
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-bold tracking-tighter text-[#E5E2E1] cursor-pointer"
        >
          Kinetix Events
        </motion.span>
        <nav className="hidden md:flex items-center gap-6">
          {["Discover", "Calendar", "Tickets", "Resources"].map((item, idx) => (
            <a
              key={item}
              className={`${idx === 0 ? "text-[#C0C1FF] border-b-2 border-[#C0C1FF]" : "text-[#C7C4D8]"} hover:text-[#E5E2E1] transition-all pb-1 font-sans tracking-tight text-sm`}
              href="/"
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center bg-[#0e0e0e] px-4 py-1.5 rounded-lg border border-[#464555]/15 focus-within:border-[#c0c1ff]/50 transition-all">
          <span className="material-symbols-outlined text-[#c7c4d8] text-lg">
            search
          </span>
          <input
            className="bg-transparent border-none focus:ring-0 text-sm w-48 text-[#e5e2e1] outline-none ml-2"
            placeholder="Search events..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#2A2A2A] rounded-full transition-all text-[#C7C4D8] active:scale-90">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="ml-2 bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] px-5 py-2 text-sm font-bold rounded-lg transition-all hover:shadow-[0_0_20px_rgba(192,193,255,0.3)] active:scale-95">
            Create Event
          </button>
        </div>
      </div>
    </div>
  </header>
);
