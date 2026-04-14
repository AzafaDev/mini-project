import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useAuthStore } from "../stores/useAuthStore";
import { loginSchema } from "../validation/authSchemas";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated, user } =
    useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      clearError();
      const result = await login({ email: values.email, password: values.password });
      if (result?.success) {
        if (result.requiresVerification) {
          navigate("/verify-email");
        } else {
          navigate("/");
        }
      }
    },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#131313] text-[#e5e2e1] font-['Inter',sans-serif]">
      {/* Subtle Ambient Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#4b4dd8]/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-[#413f82]/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Login Shell Container */}
      <main className="relative z-10 w-full max-w-[440px] px-6">
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="mb-4 p-3 rounded-lg bg-[#2a2a2a]">
            <span className="material-symbols-outlined text-[#c0c1ff] text-4xl">
              analytics
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            CuratorEvents
          </h1>
          <p className="text-[#c7c4d8] font-medium tracking-tight text-sm">
            Professional event curation infrastructure.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1c1b1b] rounded-lg p-8 shadow-2xl ring-1 ring-white/5">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          <form className="flex flex-col gap-6" onSubmit={formik.handleSubmit}>
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-semibold tracking-wider text-[#c7c4d8] uppercase ml-1"
                htmlFor="email"
              >
                Work Email
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c4d8] text-xl group-focus-within:text-[#c0c1ff] transition-colors">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full h-12 bg-[#0e0e0e] border-none ring-1 rounded-lg pl-11 pr-4 text-[#e5e2e1] placeholder:text-[#c7c4d8]/40 focus:ring-2 transition-all outline-none ${
                    formik.touched.email && formik.errors.email
                      ? "ring-red-500/50 focus:ring-red-500/50"
                      : "ring-[#464555]/30 focus:ring-[#c0c1ff]/50"
                  }`}
                  placeholder="name@company.com"
                  disabled={isLoading}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-400 text-xs ml-1">{formik.errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label
                  className="text-xs font-semibold tracking-wider text-[#c7c4d8] uppercase"
                  htmlFor="password"
                >
                  Password
                </label>
                <a
                  className="text-xs font-medium text-[#c0c1ff] hover:text-[#c0c1ff]/80 transition-colors"
                  href="/forgot-password"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c4d8] text-xl group-focus-within:text-[#c0c1ff] transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full h-12 bg-[#0e0e0e] border-none ring-1 rounded-lg pl-11 pr-4 text-[#e5e2e1] placeholder:text-[#c7c4d8]/40 focus:ring-2 transition-all outline-none ${
                    formik.touched.password && formik.errors.password
                      ? "ring-red-500/50 focus:ring-red-500/50"
                      : "ring-[#464555]/30 focus:ring-[#c0c1ff]/50"
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-400 text-xs ml-1">{formik.errors.password}</p>
              )}
            </div>

            {/* Primary Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="h-12 rounded-lg font-bold text-[#07006c] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#4b4dd8]/20 mt-2 bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer / Secondary Navigation */}
        <div className="mt-8 text-center">
          <p className="text-[#c7c4d8] text-sm font-medium">
            Don't have an account?{" "}
            <a
              className="text-[#c0c1ff] font-bold hover:underline decoration-2 underline-offset-4"
              href="/register"
            >
              Request Access
            </a>
          </p>
        </div>
      </main>

      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] opacity-30"></div>
    </div>
  );
};

export default LoginPage;
