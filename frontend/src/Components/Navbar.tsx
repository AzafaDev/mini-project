import { useState } from "react";
import { Search, PlusCircle, MapPin, Menu, X } from "lucide-react"; // Import dari lucide-react
import { Link } from "react-router-dom"; // Gunakan Link untuk navigasi internal

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full w-full bg-[#0F172A]  border-b border-[#A855F7]  z-50 shadow-lg mb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LEFT: LOGO */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-bold text-2xl tracking-tight text-[#FF00E5]">
                Event<span className="text-sky-500">nique</span>
              </span>
            </Link>
          </div>

          {/* MIDDLE: SEARCH BAR (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-2xl bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white transition-all"
                placeholder="Search events..."
              />
            </div>
          </div>

          {/* RIGHT: NAVIGATION LINKS */}
          <div className="hidden xl:flex items-center gap-8">
            <a href="#" className="flex items-center gap-2 text-[#FAECFF] hover:text-[#A855F7] font-semibold transition-all">
              <MapPin size={20} />
              <span>Find Events</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-[#FAECFF] hover:text-[#A855F7] font-semibold transition-all">
              <PlusCircle size={20} />
              <span>Create Event</span>
            </a>
            
            <Link to="/login">
              <button className="ml-4 px-8 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-[#FF00E5] transform hover:-translate-y-0.5 transition-all shadow-md active:scale-95">
                Sign In
              </button>
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="xl:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {isMenuOpen && (
        <div className="xl:hidden bg-white border-t border-gray-100 p-6 space-y-6 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              placeholder="Search events..."
            />
          </div>
          <div className="flex flex-col gap-5">
            <a href="#" className="flex items-center gap-3 text-gray-700 font-semibold hover:text-sky-600">
              <MapPin size={22} className="text-sky-500" /> Find Events
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-700 font-semibold hover:text-sky-600">
              <PlusCircle size={22} className="text-sky-500" /> Create Event
            </a>
            <hr className="border-gray-100" />
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full py-4 rounded-2xl bg-sky-500 text-white font-bold shadow-lg shadow-sky-100">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}