import React from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { useAuthStore } from "../stores/useAuthStore";
import { forgotPasswordSchema } from "../validation/authSchemas";

const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, isLoading } = useAuthStore();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      try {
        await forgotPassword(values.email);
      } catch (err: any) {
        // Still show success to prevent email enumeration - do nothing
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await formik.submitForm();
  };

  // Check if form was successfully submitted (based on no errors and submitted)
  const showSuccess = !formik.errors.email && formik.values.email && formik.submitCount > 0;

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex flex-col font-['Inter',sans-serif] selection:bg-[#4b4dd8] selection:text-[#d9d8ff]">
      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Atmospheric Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-[#4b4dd8]"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full blur-[100px] bg-[#413f82]"></div>
        </div>

        <div className="w-full max-w-md z-10">
          {/* Brand Anchor */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold tracking-tighter text-[#e5e2e1] mb-2">
              CuratorEvents
            </h1>
            <p className="text-sm tracking-wide text-[#c7c4d8] uppercase">
              Account Recovery
            </p>
          </div>

          {/* Central Reset Card */}
          <div className="bg-[#1c1b1b] p-8 lg:rounded shadow-2xl relative overflow-hidden group">
            {/* Architectural Accent */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c0c1ff] to-transparent opacity-50"></div>

            {showSuccess ? (
              /* Success State */
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[#4ade80]/20 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[#4ade80] text-3xl">
                    mail
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight mb-2">
                  Check Your Email
                </h2>
                <p className="text-[#c7c4d8] text-sm leading-relaxed mb-6">
                  If an account exists with this email, we've sent password reset instructions.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] font-bold rounded-lg hover:opacity-90"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              /* Form State */
              <>
                <header className="mb-8">
                  <h2 className="text-xl font-bold tracking-tight mb-2">
                    Forgot Password
                  </h2>
                  <p className="text-[#c7c4d8] text-sm leading-relaxed">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                </header>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Field: Email */}
                  <div className="space-y-1.5">
                    <label
                      className="block text-xs uppercase tracking-widest text-[#c7c4d8] ml-1"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c4d8] text-xl">
                        mail
                      </span>
                      <input
                        className={`w-full bg-[#0e0e0e] border-none text-[#e5e2e1] p-3.5 lg:rounded text-sm placeholder-[#918fa1] outline-none pl-11 transition-all ${
                          formik.touched.email && formik.errors.email
                            ? "ring-1 ring-red-500/50 focus:ring-red-500/50"
                            : "focus:ring-1 focus:ring-[#c0c1ff]"
                        }`}
                        id="email"
                        name="email"
                        placeholder="name@company.com"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={isLoading}
                      />
                    </div>
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-400 text-xs ml-1">{formik.errors.email}</p>
                    )}
                  </div>

                  {/* Primary Action */}
                  <div className="pt-4">
                    <button
                      className="w-full bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] py-4 lg:rounded font-bold tracking-tight text-sm active:scale-[0.98] transition-transform duration-150 shadow-lg shadow-[#c0c1ff]/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin">sync</span>
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-8 pt-6 border-t border-[#464555]/10 flex justify-center">
                  <Link
                    to="/login"
                    className="flex items-center gap-2 text-[#c0c1ff] hover:text-white transition-colors text-xs uppercase tracking-widest group"
                  >
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                      arrow_back
                    </span>
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
