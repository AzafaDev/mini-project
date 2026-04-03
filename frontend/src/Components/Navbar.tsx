import { useState } from "react";
import { HiOutlineSearch, HiOutlinePlusCircle, HiOutlineMenuAlt3 } from "react-icons/hi";
import { IoLocationOutline, IoClose } from "react-icons/io5";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-100 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LEFT: LOGO */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="flex items-center gap-2 group">
              <span className="font-bold text-2xl tracking-tight text-gray-800 hidden sm:block">
                Event<span className="text-sky-500">nique</span>
              </span>
            </a>
          </div>

          {/* MIDDLE: SEARCH BAR (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <HiOutlineSearch className="h-5 w-5 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-2xl bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 focus:bg-white transition-all"
                placeholder="Search events..."
              />
            </div>
          </div>

          {/* RIGHT: NAVIGATION LINKS */}
          <div className="hidden xl:flex items-center gap-8">
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-pink-600 font-semibold transition-all">
              <IoLocationOutline size={20} />
              <span>Find Events</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-gray-600 hover:text-pink-600 font-semibold transition-all">
              <HiOutlinePlusCircle size={20} />
              <span>Create Event</span>
            </a>
           
            <a href="/Login"><button className="ml-4 px-8 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-pink-600 transform hover:-translate-y-0.5 transition-all shadow-md active:scale-95">
              Sign In
            </button></a>
            
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="xl:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <IoClose size={28} /> : <HiOutlineMenuAlt3 size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {isMenuOpen && (
        <div className="xl:hidden bg-white border-t border-gray-100 p-6 space-y-6 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50"
              placeholder="Search events..."
            />
          </div>
          <div className="flex flex-col gap-5">
            <a href="#" className="flex items-center gap-3 text-gray-700 font-semibold">
              <IoLocationOutline size={22} className="text-pink-500" /> Find Events
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-700 font-semibold">
              <HiOutlinePlusCircle size={22} className="text-pink-500" /> Create Event
            </a>
            <hr className="border-gray-100" />
            <button className="w-full py-4 rounded-2xl bg-pink-500 text-white font-bold shadow-lg shadow-pink-200">
              Sign In
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}