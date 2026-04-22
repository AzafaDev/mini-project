import React, { useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import { useAuthStore } from "../stores/useAuthStore";
import { resetPasswordSchema } from "../validation/authSchemas";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const { isAuthenticated, user,resetPassword, isLoading, error: storeError, clearError, resetPasswordSuccess, clearResetPasswordStatus } = useAuthStore();
  
  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      clearError();

      // Validate: token exists
      if (!token) {
        formik.setFieldError("newPassword", "Invalid reset link. Please request a new password reset.");
        return;
      }

      await resetPassword(token, values.newPassword);
    },
  });

     useEffect(() => {
        if (isAuthenticated && user) {
          navigate("/");
        }
      }, [isAuthenticated, user, navigate]);

  // Cleanup store state on unmount
  useEffect(() => {
    return () => {
      clearResetPasswordStatus();
    };
  }, [clearResetPasswordStatus]);

  // Redirect to login on success
  useEffect(() => {
    if (resetPasswordSuccess) {
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [resetPasswordSuccess, navigate]);

  // Dynamic password strength checks
  const passwordChecks = useMemo(() => {
    const pwd = formik.values.newPassword;
    return {
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  }, [formik.values.newPassword]);

  const isAllChecksPassed = Object.values(passwordChecks).every(Boolean);

  return (
    <div className="bg-dark text-text-light min-h-screen flex flex-col font-['Inter',sans-serif] selection:bg-accent selection:text-[#d9d8ff]">
      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Atmospheric Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-accent"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full blur-[100px] bg-[#413f82]"></div>
        </div>

        <div className="w-full max-w-md z-10">
          {/* Brand Anchor */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold tracking-tighter text-text-light mb-2">
              CuratorEvents
            </h1>
            <p className="text-sm tracking-wide text-text-muted uppercase">
              Security Protocol
            </p>
          </div>

          {/* Central Reset Card */}
          <div className="bg-dark-surface p-8 lg:rounded shadow-2xl relative overflow-hidden group">
            {/* Architectural Accent */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

            <header className="mb-8">
              <h2 className="text-xl font-bold tracking-tight mb-2">
                Reset Password
              </h2>
              <p className="text-text-muted text-sm leading-relaxed">
                Choose a strong, unique password to secure your account.
              </p>
            </header>

            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              {/* Field: New Password */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs uppercase tracking-widest text-text-muted ml-1"
                  htmlFor="newPassword"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    className={`w-full bg-dark-darker text-text-light p-3.5 lg:rounded text-sm placeholder-text-tertiary outline-none transition-all ${
                      formik.touched.newPassword && formik.errors.newPassword
                        ? "ring-1 ring-red-500/50 focus:ring-red-500/50"
                        : "focus:ring-1 focus:ring-primary"
                    }`}
                    id="newPassword"
                    name="newPassword"
                    placeholder="••••••••••••"
                    type="password"
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading || resetPasswordSuccess}
                  />
                </div>
                {formik.touched.newPassword && formik.errors.newPassword && (
                  <p className="text-red-400 text-xs ml-1">{formik.errors.newPassword}</p>
                )}
              </div>

              {/* Password Strength Indicators - Dynamic */}
              {formik.values.newPassword && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { label: "Lowercase", key: "lowercase" },
                    { label: "Uppercase", key: "uppercase" },
                    { label: "Number", key: "number" },
                    { label: "Special Char", key: "special" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all ${
                        passwordChecks[item.key as keyof typeof passwordChecks]
                          ? "bg-success-light/10 border-success-light/30"
                          : "bg-dark-card border-transparent"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-sm ${
                          passwordChecks[item.key as keyof typeof passwordChecks]
                            ? "text-success-light"
                            : "text-text-muted"
                        }`}
                        style={{
                          fontVariationSettings: passwordChecks[item.key as keyof typeof passwordChecks]
                            ? "'FILL' 1"
                            : "'FILL' 0",
                        }}
                      >
                        {passwordChecks[item.key as keyof typeof passwordChecks] ? "check_circle" : "cancel"}
                      </span>
                      <span className="text-[10px] uppercase tracking-tighter text-text-muted">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Field: Confirm Password */}
              <div className="space-y-1.5 pt-2">
                <label
                  className="block text-xs uppercase tracking-widest text-text-muted ml-1"
                  htmlFor="confirmPassword"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    className={`w-full bg-dark-darker text-text-light p-3.5 lg:rounded text-sm placeholder-text-tertiary outline-none transition-all ${
                      formik.touched.confirmPassword && formik.errors.confirmPassword
                        ? "ring-1 ring-red-500/50 focus:ring-red-500/50"
                        : "focus:ring-1 focus:ring-primary"
                    }`}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••••••"
                    type="password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading || resetPasswordSuccess}
                  />
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="text-red-400 text-xs ml-1">{formik.errors.confirmPassword}</p>
                )}
              </div>

              {/* Error Message */}
              {(storeError) && (
                <div className="p-3 bg-error-light/10 border border-error-light/30 rounded-lg">
                  <p className="text-error-light text-xs">{storeError}</p>
                </div>
              )}

              {/* Success Message */}
              {resetPasswordSuccess && (
                <div className="p-3 bg-[#a8e6cf]/10 border border-[#a8e6cf]/30 rounded-lg">
                  <p className="text-[#a8e6cf] text-xs">
                    Password reset successfully! Redirecting to login...
                  </p>
                </div>
              )}

              {/* Primary Action */}
              <div className="pt-4">
                <button
                  className="w-full bg-gradient-to-br from-primary to-accent text-primary-dark py-4 lg:rounded font-bold tracking-tight text-sm active:scale-[0.98] transition-transform duration-150 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  type="submit"
                  disabled={isLoading || resetPasswordSuccess || !isAllChecksPassed}
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">sync</span>
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-border-muted/10 flex justify-center">
              <Link
                className="flex items-center gap-2 text-primary hover:text-white transition-colors text-xs uppercase tracking-widest group"
                to="/login"
              >
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                Back to Login
              </Link>
            </div>
          </div>

          {/* Simplified Technical Detail */}
          <div className="mt-8 flex justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span className="text-[10px] uppercase tracking-widest">
                Encrypted
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                verified_user
              </span>
              <span className="text-[10px] uppercase tracking-widest">
                Verified
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 flex justify-center items-center text-xs text-text-muted opacity-60">
        <span>© 2026 CuratorEvents</span>
      </footer>
    </div>
  );
};

export default ResetPassword;
