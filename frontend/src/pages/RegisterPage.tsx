import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useAuthStore } from "../stores/useAuthStore";
import { registerSchema } from "../validation/authSchemas";

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const { register, isLoading, error, clearError, isRegistered, clearRegistered, user, isAuthenticated } = useAuthStore();

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "CUSTOMER" as "CUSTOMER" | "ORGANIZER",
      referrerCode: "",
      profilePicture: null as File | null,
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      clearError();

      const form = new FormData();
      form.append("fullName", values.fullName);
      form.append("email", values.email);
      form.append("password", values.password);
      form.append("phoneNumber", values.phoneNumber || "");
      form.append("role", values.role);
      form.append("referrerCode", values.referrerCode || "");
      if (values.profilePicture) {
        form.append("profilePicture", values.profilePicture);
      }

      await register(form);
    },
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect to verification page after successful registration
  useEffect(() => {
    if (isRegistered) {
      clearRegistered();
      navigate("/verify-email");
    }
  }, [isRegistered, clearRegistered, navigate]);

   useEffect(() => {
      if (isAuthenticated && user) {
        navigate("/");
      }
    }, [isAuthenticated, user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    formik.setFieldValue("profilePicture", file);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex flex-col font-['Inter',sans-serif]">
      {/* Main Canvas */}
      <main className="flex-grow flex items-center justify-center pt-16 pb-12 px-4 bg-[#131313]">
        <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Decoration: Editorial Context */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-6 pr-8">
            <h1 className="text-5xl font-extrabold tracking-tighter leading-none text-white">
              Curate <br />
              <span className="text-[#c0c1ff]">Exceptional</span> Moments.
            </h1>
            <p className="text-[#c7c4d8] text-lg leading-relaxed">
              Join the premier ecosystem for architecting high-impact events.
              Designed for precision, built for scale.
            </p>
            <div className="mt-4 p-6 rounded bg-[#1c1b1b] border border-[#464555]/15">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-[#2a2a2a]">
                  <img
                    className="w-full h-full object-cover"
                    alt="Marcus Thorne"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO9JKhp4QnWMIg6fJ2faIm3P8RxaVwBAC9-6ETHLtn-iXwG-XoKO_WFwXgo28-2NmmOHCLXla6CFsTrI7O0lvoJrFhJ_Tz9Oo4bc6_Dq5OfyGccgmhsZ0bQr-DJPF7eelgkSxBuq0SV0dDM3yAbxOghjadOx5awIMfsPuD4J9TZoYtwMLJFoLX91vtJkrmCOQiYuNyZ_EKASo9epl52BbNjIOC9nVUxm7454LeCkx311uhCY-KeCj41Oin1K0lAiR2DC7S2CqD0DjF"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#e5e2e1]">
                    Marcus Thorne
                  </p>
                  <p className="text-xs text-[#c7c4d8]">
                    Lead Architect, Global Pulse
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm italic text-[#c7c4d8]/80">
                "The Midnight Architect system allowed us to scale our
                registration 4x without losing the premium editorial feel our
                clients expect."
              </p>
            </div>
          </div>

          {/* Registration Card */}
          <div className="lg:col-span-7 w-full max-w-md mx-auto">
            <div className="bg-[#2a2a2a]/80 backdrop-blur-xl p-8 rounded-lg shadow-2xl border border-[#464555]/10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Create Account
                </h2>
                <p className="text-sm text-[#c7c4d8] mt-1">
                  Start your journey with CuratorEvents.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={formik.handleSubmit}>
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-[0.75rem] font-medium text-[#c7c4d8] ml-1">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full bg-[#0e0e0e] border-none text-[#e5e2e1] px-4 py-3 rounded-lg focus:ring-1 placeholder:text-[#353534] text-sm transition-all outline-none ${
                      formik.touched.fullName && formik.errors.fullName
                        ? "ring-1 ring-red-500/50 focus:ring-red-500/50"
                        : "ring-[#464555]/30 focus:ring-[#c0c1ff]"
                    }`}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                  {formik.touched.fullName && formik.errors.fullName && (
                    <p className="text-red-400 text-xs ml-1">{formik.errors.fullName}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-[0.75rem] font-medium text-[#c7c4d8] ml-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full bg-[#0e0e0e] border-none text-[#e5e2e1] px-4 py-3 rounded-lg focus:ring-1 placeholder:text-[#353534] text-sm transition-all outline-none ${
                      formik.touched.email && formik.errors.email
                        ? "ring-1 ring-red-500/50 focus:ring-red-500/50"
                        : "ring-[#464555]/30 focus:ring-[#c0c1ff]"
                    }`}
                    placeholder="name@company.com"
                    disabled={isLoading}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-400 text-xs ml-1">{formik.errors.email}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="block text-[0.75rem] font-medium text-[#c7c4d8] ml-1">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full bg-[#0e0e0e] border-none ring-1 ring-[#464555]/30 focus:ring-[#c0c1ff] text-[#e5e2e1] px-4 py-3 rounded-lg placeholder:text-[#353534] text-sm transition-all outline-none"
                    placeholder="+62xxxxxxxxxx"
                    disabled={isLoading}
                  />
                </div>

                {/* Role Selection */}
                <div className="space-y-1.5">
                  <label className="block text-[0.75rem] font-medium text-[#c7c4d8] ml-1">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => formik.setFieldValue("role", "CUSTOMER")}
                      className={`flex items-center justify-center p-3 rounded-lg text-xs font-semibold transition-all border ${
                        formik.values.role === "CUSTOMER"
                          ? "border-[#c0c1ff] bg-[#c0c1ff]/10 text-[#c0c1ff]"
                          : "border-transparent bg-[#0e0e0e] text-[#c7c4d8]"
                      }`}
                      disabled={isLoading}
                    >
                      Attendee
                    </button>
                    <button
                      type="button"
                      onClick={() => formik.setFieldValue("role", "ORGANIZER")}
                      className={`flex items-center justify-center p-3 rounded-lg text-xs font-semibold transition-all border ${
                        formik.values.role === "ORGANIZER"
                          ? "border-[#c0c1ff] bg-[#c0c1ff]/10 text-[#c0c1ff]"
                          : "border-transparent bg-[#0e0e0e] text-[#c7c4d8]"
                      }`}
                      disabled={isLoading}
                    >
                      Organizer
                    </button>
                  </div>
                  {formik.touched.role && formik.errors.role && (
                    <p className="text-red-400 text-xs ml-1">{formik.errors.role}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5 relative">
                  <label className="block text-[0.75rem] font-medium text-[#c7c4d8] ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full bg-[#0e0e0e] border-none text-[#e5e2e1] px-4 py-3 rounded-lg focus:ring-1 placeholder:text-[#353534] text-sm transition-all outline-none pr-12 ${
                        formik.touched.password && formik.errors.password
                          ? "ring-1 ring-red-500/50 focus:ring-red-500/50"
                          : "ring-[#464555]/30 focus:ring-[#c0c1ff]"
                      }`}
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c7c4d8] cursor-pointer text-xl"
                      onClick={togglePassword}
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-red-400 text-xs ml-1">{formik.errors.password}</p>
                  )}
                </div>

                {/* Profile Picture */}
                <div className="space-y-1.5">
                  <label className="block text-[0.75rem] font-medium text-[#c7c4d8] ml-1">
                    Profile Picture
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full bg-[#0e0e0e] border-none text-[#e5e2e1] px-4 py-3 rounded-lg focus:ring-1 focus:ring-[#c0c1ff] text-sm transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#c0c1ff]/10 file:text-[#c0c1ff] hover:file:bg-[#c0c1ff]/20"
                    disabled={isLoading}
                  />
                </div>

                {/* Referral Code */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="block text-[0.75rem] font-medium text-[#c7c4d8]">
                      Referral Code
                    </label>
                    <span className="text-[0.65rem] text-[#c7c4d8] bg-[#464555]/10 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                      Optional
                    </span>
                  </div>
                  <input
                    id="referrerCode"
                    name="referrerCode"
                    type="text"
                    value={formik.values.referrerCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full bg-[#0e0e0e] border-none ring-1 ring-[#464555]/30 focus:ring-[#c0c1ff] text-[#e5e2e1] px-4 py-3 rounded-lg placeholder:text-[#353534] text-sm transition-all border-l-2 border-[#c0c1ff] outline-none"
                    placeholder="XYZ-12345"
                    disabled={isLoading}
                  />
                </div>

                {/* CTA Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 py-4 rounded-lg bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#c0c1ff]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">sync</span>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-[#c7c4d8]">
                Already have an account?{" "}
                <a
                  className="text-[#c0c1ff] font-semibold hover:underline"
                  href="/login"
                >
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegistrationPage;
