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
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-[#131313]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left */}
            <div className="flex-shrink-0">
              <Link to="/">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-bold tracking-tighter text-[#E5E2E1] cursor-pointer"
                >
                  Kinetix Events
                </motion.span>
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center justify-center gap-6 absolute left-1/2 transform -translate-x-1/2">
              <Link
                to="/"
                className="text-[#C0C1FF] border-b-2 border-[#C0C1FF] flex items-center text-sm font-medium"
              >
                Discover
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/my-tickets"
                    className="text-[#C7C4D8] hover:text-white transition-colors flex items-center text-sm"
                  >
                    My Tickets
                  </Link>
                  <Link
                    to="/my-transactions"
                    className="text-[#C7C4D8] hover:text-white transition-colors flex items-center text-sm"
                  >
                    History
                  </Link>
                </>
              )}
            </nav>

            {/* Right side: Mobile menu button + Auth buttons/Avatar */}
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                <span className="material-symbols-outlined text-2xl">
                  {isMobileMenuOpen ? "close" : "menu"}
                </span>
              </button>

              {/* Desktop Auth Buttons or Avatar */}
              {!isAuthenticated ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-[#C7C4D8] hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link to="/register">
                    <button className="bg-[#E5E2E1] text-[#131313] px-5 py-2 text-sm font-semibold rounded-lg hover:bg-white transition-all">
                      Register
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="hidden md:block">
                  <div className="group relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4b4dd8] to-[#c0c1ff] p-[2px] cursor-pointer">
                      <div className="w-full h-full rounded-full bg-[#131313] flex items-center justify-center overflow-hidden">
                        {user?.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt="profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[#c0c1ff] text-base font-bold">
                            {user?.fullName?.[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[#464555]/30 rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-2xl z-50">
                      <div className="px-4 py-2 border-b border-[#464555]/30">
                        <p className="text-xs text-[#C7C4D8]">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate">
                          {user?.fullName}
                        </p>
                      </div>
                      {user?.role === "ORGANIZER" && (
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[#C7C4D8] hover:bg-[#2A2A2A] transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            dashboard
                          </span>
                          Dashboard
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#C7C4D8] hover:bg-[#2A2A2A] transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          person
                        </span>
                        Profile
                      </Link>
                      <Link
                        to="/my-tickets"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#C7C4D8] hover:bg-[#2A2A2A] transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          confirmation_number
                        </span>
                        My Tickets
                      </Link>
                      <Link
                        to="/my-transactions"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#C7C4D8] hover:bg-[#2A2A2A] transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          history
                        </span>
                        History
                      </Link>
                      <div className="border-t border-[#464555]/30 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#2A2A2A] transition-colors"
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
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[49] transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#1C1B1B] z-[50] transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-xl font-bold text-white">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white p-2 rounded-lg hover:bg-white/10"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
          {!isAuthenticated ? (
            <div className="space-y-4">
              <Link
                to="/login"
                className="block w-full text-center py-3 bg-[#2A2A2A] text-white rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block w-full text-center py-3 bg-primary text-primary-dark rounded-lg font-bold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          ) : (
            <nav className="space-y-2">
              <Link
                to="/"
                className="block py-3 text-[#C7C4D8] hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Discover
              </Link>
              <Link
                to="/my-tickets"
                className="block py-3 text-[#C7C4D8] hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Tickets
              </Link>
              <Link
                to="/my-transactions"
                className="block py-3 text-[#C7C4D8] hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                History
              </Link>
              {user?.role === "ORGANIZER" && (
                <Link
                  to="/dashboard"
                  className="block py-3 text-[#C7C4D8] hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/profile"
                className="block py-3 text-[#C7C4D8] hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left py-3 text-red-400 hover:text-red-300"
              >
                Logout
              </button>
            </nav>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
