import { motion } from "framer-motion";
import { useAuthStore } from "../stores/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-200">
      <div className="flex items-center justify-between px-4 md:px-8 h-16 w-full max-w-[1440px] mx-auto">
        <div className="flex items-center gap-6">
          <Link to="/">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold tracking-tighter text-[#E5E2E1] cursor-pointer"
            >
              Kinetix Events
            </motion.span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-[#C0C1FF] border-b-2 border-[#C0C1FF] pb-1 font-sans tracking-tight text-sm"
            >
              Discover
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/my-tickets"
                  className="text-[#C7C4D8] hover:text-[#E5E2E1] transition-all pb-1 font-sans tracking-tight text-sm"
                >
                  My Tickets
                </Link>
                <Link
                  to="/my-transactions"
                  className="text-[#C7C4D8] hover:text-[#E5E2E1] transition-all pb-1 font-sans tracking-tight text-sm"
                >
                  History
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              <span className="material-symbols-outlined text-2xl">
                {isMobileMenuOpen ? "close" : "menu"}
              </span>
            </button>

            {!isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-[#C7C4D8] text-sm font-medium hover:text-white px-4"
                >
                  Login
                </Link>
                <Link to="/register">
                  <button className="bg-[#E5E2E1] text-[#131313] px-5 py-2 text-sm font-bold rounded-lg hover:bg-white transition-all min-h-[48px]">
                    Register
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">

                <div className="group relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4b4dd8] to-[#c0c1ff] p-[2px] cursor-pointer">
                    <div className="w-full h-full rounded-full bg-[#131313] flex items-center justify-center overflow-hidden">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[#c0c1ff] text-xl font-bold">
                          {user?.fullName[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Menu Sederhana */}
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[#464555]/30 rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-2xl">
                    <div className="px-4 py-2 border-b border-[#464555]/30 mb-1">
                      <p className="text-xs text-[#C7C4D8]">Signed in as</p>
                      <p className="text-sm font-bold text-[#E5E2E1] truncate">
                        {user?.fullName}
                      </p>
                    </div>

                    {/* Dashboard - only for ORGANIZER */}
                    {user?.role === "ORGANIZER" && (
                      <Link
                        to="/dashboard"
                        className="w-full text-left px-4 py-2 text-sm text-[#C7C4D8] hover:bg-[#2A2A2A] transition-colors flex items-center gap-2 min-h-[48px]"
                      >
                        <span className="material-symbols-outlined text-sm">
                          dashboard
                        </span>
                        Dashboard
                      </Link>
                    )}

                    {/* Profile */}
                    <Link
                      to="/profile"
                      className="w-full text-left px-4 py-2 text-sm text-[#C7C4D8] hover:bg-[#2A2A2A] transition-colors flex items-center gap-2 min-h-[48px]"
                    >
                      <span className="material-symbols-outlined text-sm">
                        person
                      </span>
                      Profile
                    </Link>

                    {/* My Tickets */}
                    <Link
                      to="/my-tickets"
                      className="w-full text-left px-4 py-2 text-sm text-[#C7C4D8] hover:bg-[#2A2A2A] transition-colors flex items-center gap-2 min-h-[48px]"
                    >
                      <span className="material-symbols-outlined text-sm">
                        confirmation_number
                      </span>
                      My Tickets
                    </Link>

                    {/* History */}
                    <Link
                      to="/my-transactions"
                      className="w-full text-left px-4 py-2 text-sm text-[#C7C4D8] hover:bg-[#2A2A2A] transition-colors flex items-center gap-2 min-h-[48px]"
                    >
                      <span className="material-symbols-outlined text-sm">
                        history
                      </span>
                      History
                    </Link>

                    <div className="border-t border-[#464555]/30 mt-1 pt-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 min-h-[48px]"
                    >
                      <span className="material-symbols-outlined text-sm">
                        logout
                      </span>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#131313] border-t border-white/5 shadow-2xl">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-[#C7C4D8] hover:bg-[#2A2A2A] rounded-lg min-h-[48px]"
            >
              <span className="material-symbols-outlined">search</span>
              Discover
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/my-tickets"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-[#C7C4D8] hover:bg-[#2A2A2A] rounded-lg min-h-[48px]"
                >
                  <span className="material-symbols-outlined">confirmation_number</span>
                  My Tickets
                </Link>
                <Link
                  to="/my-transactions"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-[#C7C4D8] hover:bg-[#2A2A2A] rounded-lg min-h-[48px]"
                >
                  <span className="material-symbols-outlined">history</span>
                  History
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-[#C7C4D8] hover:bg-[#2A2A2A] rounded-lg min-h-[48px]"
                >
                  <span className="material-symbols-outlined">person</span>
                  Profile
                </Link>
                
                {user?.role === "ORGANIZER" && (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-[#C7C4D8] hover:bg-[#2A2A2A] rounded-lg min-h-[48px]"
                  >
                    <span className="material-symbols-outlined">dashboard</span>
                    Dashboard
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg min-h-[48px]"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-4 border-t border-white/5 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-3 text-[#E5E2E1] rounded-lg min-h-[48px]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center bg-[#E5E2E1] text-[#131313] font-bold px-4 py-3 rounded-lg min-h-[48px]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
