import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(15,61,202,0.08)]">
      <div className="flex justify-between items-center px-8 py-4 max-w-full mx-auto">
        <Link
          to="/"
          className="text-2xl font-black text-[#0f3dca] tracking-tighter font-['Plus_Jakarta_Sans']"
        >
          Eventnique
        </Link>

        <div className="flex items-center gap-4">
          {isLoginPage ? (
            <Link
              to="/register"
              className="px-6 py-2 bg-[#0f3dca] text-white rounded-md font-semibold shadow-lg shadow-[#0f3dca]/20 active:scale-95 duration-200 transition-all"
            >
              Sign Up
            </Link>
          ) : isRegisterPage ? (
            <Link
              to="/login"
              className="px-6 py-2 bg-[#0f3dca] text-white rounded-md font-semibold shadow-lg shadow-[#0f3dca]/20 active:scale-95 duration-200 transition-all"
            >
              Login
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-6 py-2 rounded-md font-semibold text-[#0f3dca] hover:bg-[#0f3dca]/10 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-[#0f3dca] text-white rounded-md font-semibold shadow-lg shadow-[#0f3dca]/20 active:scale-95 duration-200 transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
