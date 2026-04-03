import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("customer");
  const [error, setError] = useState(false); // Contoh state untuk trigger animasi shake

  // Varians untuk animasi shake pada input
  const shakeVariants = {
    error: {
      x: [-1, 2, -4, 4, -4, 4, -2, 1, 0],
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-100 via-slate-50 to-teal-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* 1. ENTRANCE ANIMATION: Fade-in Upward */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl cursor-pointer"
          >
            <span className="text-white font-black text-2xl">E</span>
          </motion.div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          New here?{" "}
          <Link
            to="/register"
            className="font-semibold text-rose-600 hover:text-rose-500 underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        {/* 4. MODERN STYLING: Glassmorphism Card */}
        <div className="bg-white/70 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl sm:px-10 border border-white/80 ring-1 ring-black/5">
          {/* ROLE SELECTOR with Layout Animation */}
          <div className="relative flex p-1.5 bg-gray-100/50 rounded-2xl mb-8">
            <div className="absolute inset-y-1.5 left-1.5 flex w-[calc(50%-6px)]">
              <motion.div
                layoutId="activeRole"
                className="w-full h-full bg-white rounded-xl shadow-sm"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
            <button
              onClick={() => setRole("customer")}
              className={`relative z-10 flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${
                role === "customer"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setRole("organizer")}
              className={`relative z-10 flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${
                role === "organizer"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Organizer
            </button>
          </div>

          <form className="space-y-5">
            {/* 3. MICRO-INTERACTIONS: Shake on Error */}
            <motion.div animate={error ? "error" : ""} variants={shakeVariants}>
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="appearance-none block w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </motion.div>

            <motion.div animate={error ? "error" : ""} variants={shakeVariants}>
              <div className="flex justify-between items-center ml-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link
                  to="#"
                  className="text-xs font-bold text-rose-600 hover:text-rose-500"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none block w-full pl-11 pr-11 py-3 bg-white/50 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center group"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </motion.div>

            <div className="flex items-center ml-1">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded-lg cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-600 cursor-pointer"
              >
                Keep me signed in
              </label>
            </div>

            {/* 3. MICRO-INTERACTIONS: Scale on Click & Hover */}
            <div>
              <AnimatePresence mode="wait">
                <motion.button
                  key={role}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-xl shadow-rose-500/20 text-sm font-bold text-white bg-gray-900 hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
                >
                  Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                </motion.button>
              </AnimatePresence>
            </div>
          </form>

          {/* DIVIDER */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-semibold">
                <span className="px-3 bg-white/0 text-gray-400 backdrop-blur-md">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <motion.button
                whileHover={{
                  backgroundColor: "rgba(249, 250, 251, 1)",
                  scale: 1.01,
                }}
                whileTap={{ scale: 0.99 }}
                className="w-full inline-flex justify-center py-3.5 px-4 rounded-2xl border border-gray-200 bg-white/50 text-sm font-bold text-gray-700 hover:shadow-md transition-all"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                Google Account
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
