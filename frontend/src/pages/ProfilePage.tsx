import { useRef, useState } from "react";
import { useFormik } from "formik";
import { useAuthStore } from "../stores/useAuthStore";
import { useToastStore } from "../stores/useToastStore";
import {
  profileService,
  type UpdateProfileRequest,
  type ChangePasswordRequest,
  type Coupon,
} from "../services/api";
import type { User } from "../types/authTypes";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "../validation/authSchemas";

interface ProfilePageProps {
  user?: User;
}

// --- Sidebar Component ---

interface SidebarProps {
  role: string | undefined;
  onNavigate: (page: string) => void;
}

const Sidebar = ({ role, onNavigate }: SidebarProps) => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const customerMenu = [
    { name: "My Tickets", icon: "confirmation_number" },
    { name: "Transactions", icon: "receipt_long" },
    { name: "Settings", icon: "settings", active: true },
  ];

  const organizerMenu = [
    { name: "Dashboard", icon: "dashboard" },
    { name: "Events", icon: "event" },
    { name: "Transactions", icon: "receipt_long" },
    { name: "Settings", icon: "settings", active: true },
  ];

  const menu = role === "ORGANIZER" ? organizerMenu : customerMenu;

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 bg-dark-surface flex-col py-6 px-4 gap-2 z-40 pt-20">
      <div className="mb-8 px-4">
        <div className="flex items-center gap-3 mb-2">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={
              user?.profilePicture ||
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAMIi3oA8ClFG0LdduEuZLhW5_oQlpjBRWMC9oqlfZHCnElcZE7_gKp5lqdhlcIJYowP5RQtDbTuVGFkFKYgEQq1oKBeXg-bKGZAFBzpirrflGoYwg9Mg6swHLfmxDlIMytqDAHHDjM62A-buWdr3r6_yObU-cKRWndEIssJtj8ZRonC4o2wjsfx53y9DwLPNd8lXg55q5Va3aiQX50h7cBtXk8aS8nnaOTxWgJfkBvqxocgAt6-ac8onMDDGBt7VOh-MnU94LwxTdO"
            }
            alt="Profile"
          />
          <div>
            <div className="text-sm font-black text-text-light truncate max-w-32">
              {user?.fullName || "User"}
            </div>
            <div className="text-[10px] text-text-muted uppercase tracking-widest">
              {role === "ORGANIZER" ? "Organizer" : "Customer"}
            </div>
          </div>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {menu.map((item) => (
          <button
            key={item.name}
            onClick={() => item.name !== "Settings" && onNavigate(item.name)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
              item.active
                ? "bg-dark-elevated text-primary font-semibold border-r-4 border-primary"
                : "text-text-muted hover:bg-dark-elevated hover:text-text-light"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-sm">{item.name}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-muted hover:bg-dark-elevated transition-all">
          <span className="material-symbols-outlined">help</span>
          <span className="text-sm">Help Center</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-muted hover:bg-dark-elevated transition-all"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

// --- Loading Skeleton Components ---

const ProfileSkeleton = () => (
  <div className="bg-dark text-text-light min-h-screen font-sans">
    <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 bg-dark-surface flex-col py-6 px-4 gap-2 z-40 pt-20">
      <div className="mb-8 px-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-dark-elevated animate-pulse" />
          <div>
            <div className="h-4 w-24 bg-dark-elevated rounded animate-pulse mb-1" />
            <div className="h-2 w-16 bg-dark-elevated rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="space-y-2 px-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-dark-elevated rounded-lg animate-pulse" />
        ))}
      </div>
    </aside>

    <main className="lg:ml-64 pt-24 pb-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="h-10 w-48 bg-dark-elevated rounded animate-pulse mb-2" />
          <div className="h-5 w-72 bg-dark-elevated rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Profile Card Skeleton */}
          <section className="md:col-span-8 bg-dark-surface rounded-xl p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-32 h-32 rounded-full bg-dark-elevated animate-pulse" />
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-dark-elevated rounded animate-pulse" />
                    <div className="h-12 bg-dark-elevated rounded-lg animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-28 bg-dark-elevated rounded animate-pulse" />
                    <div className="h-12 bg-dark-elevated rounded-lg animate-pulse" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <div className="h-3 w-32 bg-dark-elevated rounded animate-pulse" />
                    <div className="h-12 bg-dark-elevated rounded-lg animate-pulse" />
                  </div>
                </div>
                <div className="h-10 w-28 bg-dark-elevated rounded-lg animate-pulse" />
              </div>
            </div>
          </section>

          {/* Points Card Skeleton */}
          <section className="md:col-span-4 bg-dark-surface rounded-xl p-8">
            <div className="space-y-4">
              <div className="h-3 w-24 bg-dark-elevated rounded animate-pulse" />
              <div className="h-14 w-32 bg-dark-elevated rounded animate-pulse" />
              <div className="h-4 w-48 bg-dark-elevated rounded animate-pulse" />
            </div>
          </section>

          {/* Security Section Skeleton */}
          <section className="md:col-span-12 bg-dark-surface rounded-xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-6 h-6 bg-dark-elevated rounded animate-pulse" />
              <div className="h-6 w-36 bg-dark-elevated rounded animate-pulse" />
            </div>
            <div className="space-y-6 max-w-lg">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-32 bg-dark-elevated rounded animate-pulse" />
                  <div className="h-12 bg-dark-elevated rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          </section>

          {/* Coupons Section Skeleton */}
          <section className="md:col-span-12 bg-dark-surface rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 bg-dark-elevated rounded animate-pulse" />
              <div className="h-6 w-28 bg-dark-elevated rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-dark-darker rounded-lg p-4">
                  <div className="h-4 w-20 bg-dark-elevated rounded animate-pulse mb-2" />
                  <div className="h-3 w-16 bg-dark-elevated rounded animate-pulse" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
);

// --- Main Page Component ---

export default function ProfilePage({ user: propsUser }: ProfilePageProps) {
  const { fetchCurrentUser } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user from props or fallback to store
  const storeUser = useAuthStore((state) => state.user);
  const user = propsUser || storeUser;

  const [points, setPoints] = useState<number>(user?.points ?? 0);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Profile form with Formik - initialize with user data directly
  const profileFormik = useFormik({
    initialValues: {
      fullName: user?.fullName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
    },
    validationSchema: updateProfileSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const updateData: UpdateProfileRequest = {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber || undefined,
        };

        const response = await profileService.updateProfile(updateData);

        if (response.success) {
          await fetchCurrentUser();
          addToast("success", "Profile updated successfully");
        } else {
          addToast("error", response.message || "Failed to update profile");
        }
      } catch (error: any) {
        addToast(
          "error",
          error.response?.data?.message || "Failed to update profile",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Password change form with Formik
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: changePasswordSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const passwordDataReq: ChangePasswordRequest = {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        };

        const response = await profileService.changePassword(passwordDataReq);

        if (response.success) {
          resetForm();
          addToast("success", "Password changed successfully");
        } else {
          addToast("error", response.message || "Failed to change password");
        }
      } catch (error: any) {
        addToast(
          "error",
          error.response?.data?.message || "Failed to change password",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Profile picture upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      addToast("error", "Please select a JPG, PNG, or WebP image");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      addToast("error", "Image must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProfilePictureUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const response = await profileService.uploadProfilePicture(selectedFile);

      if (response.success) {
        await fetchCurrentUser();
        setSelectedFile(null);
        setPreviewUrl(null);
        addToast("success", "Profile picture updated successfully");
      } else {
        addToast(
          "error",
          response.message || "Failed to upload profile picture",
        );
      }
    } catch (error: any) {
      addToast(
        "error",
        error.response?.data?.message || "Failed to upload profile picture",
      );
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleNavigate = (page: string) => {
    const routeMap: Record<string, string> = {
      "My Tickets": "/my-tickets",
      Transactions: "/transactions",
      Dashboard: "/dashboard",
      Events: "/dashboard",
    };
    const route = routeMap[page];
    if (route) {
      window.location.href = route;
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="bg-dark text-text-light min-h-screen font-sans selection:bg-primary/30">
      <Sidebar role={user?.role} onNavigate={handleNavigate} />

      <main className="lg:ml-64 pt-24 pb-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-text-light mb-2">
              Account Settings
            </h1>
            <p className="text-text-muted text-base">
              Manage your personal information and security settings.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Profile Identity Card */}
            <section className="md:col-span-8 bg-dark-surface rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

              {/* Profile Picture Section */}
              <div className="relative group">
                <div
                  className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-dark-elevated relative cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img
                    className="w-full h-full object-cover"
                    src={
                      previewUrl ||
                      user?.profilePicture ||
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgqLhXXJNbmvvCdEbZ7AKonin1xZJEPSH5PlQU7Y3xT-5MXpJuyVWH3IrJWepOI0LM2vzo00b31D5nypgmoYaTculyAv1-okKaF_x0qyZ2sazvBnVc0DVFTnlyf7fC96kIPlbDi15Vps65AGriAuE_mdL1fstX46X8rFm_WQcRgwuLN-lZLNUuRRei6ibWSxai0eo6SwuQFoUn-c3Ko6aME_LOvQckieY6XJ21uij78J4FGUXEVoO2xyrgbjuQVsc8pJfeWW7SHXHS"
                    }
                    alt="Profile"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="material-symbols-outlined text-white text-3xl">
                      photo_camera
                    </span>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Upload preview */}
                {selectedFile && (
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted truncate max-w-32">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-text-muted">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleProfilePictureUpload}
                        disabled={uploading}
                        className="bg-primary text-primary-dark px-3 py-1.5 rounded-lg text-xs font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {uploading ? "Uploading..." : "Upload"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelUpload}
                        disabled={uploading}
                        className="bg-dark-elevated text-text-muted px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#3a3a3a] active:scale-95 transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <form
                className="flex-1 space-y-6 w-full relative z-10"
                onSubmit={profileFormik.handleSubmit}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                      Full Name
                    </label>
                    <input
                      name="fullName"
                      type="text"
                      value={profileFormik.values.fullName}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      className={`w-full bg-dark-darker text-text-light py-3 px-4 rounded-lg outline-none transition-all ${
                        profileFormik.touched.fullName &&
                        profileFormik.errors.fullName
                          ? "ring-1 ring-red-500/50 focus:ring-red-500/50"
                          : "focus:ring-2 focus:ring-primary"
                      }`}
                    />
                    {profileFormik.touched.fullName &&
                      profileFormik.errors.fullName && (
                        <p className="text-red-400 text-xs">
                          {profileFormik.errors.fullName}
                        </p>
                      )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                      Email Address
                    </label>
                    <input
                      name="email"
                      value={user?.email || ""}
                      readOnly
                      className="w-full bg-dark-darker/50 border-none text-text-muted py-3 px-4 rounded-lg cursor-not-allowed"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                      Phone Number (Optional)
                    </label>
                    <input
                      name="phoneNumber"
                      type="text"
                      value={profileFormik.values.phoneNumber}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      className={`w-full bg-dark-darker text-text-light py-3 px-4 rounded-lg outline-none transition-all ${
                        profileFormik.touched.phoneNumber &&
                        profileFormik.errors.phoneNumber
                          ? "ring-1 ring-red-500/50 focus:ring-red-500/50"
                          : "focus:ring-2 focus:ring-primary"
                      }`}
                      placeholder="+62 xxx xxxx xxxx"
                    />
                    {profileFormik.touched.phoneNumber &&
                      profileFormik.errors.phoneNumber && (
                        <p className="text-red-400 text-xs">
                          {profileFormik.errors.phoneNumber}
                        </p>
                      )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={profileFormik.isSubmitting}
                  className="bg-primary text-primary-dark px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {profileFormik.isSubmitting && (
                    <span className="material-symbols-outlined animate-spin text-sm">
                      sync
                    </span>
                  )}
                  {profileFormik.isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </section>

            {/* Points Balance Card */}
            <section className="md:col-span-4 bg-gradient-to-br from-accent to-[#494bd6] rounded-xl p-8 flex flex-col justify-between text-[#d9d8ff] relative overflow-hidden group">
              <span className="material-symbols-outlined absolute top-4 right-4 opacity-20 text-6xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
                token
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">
                  Pulse Points
                </div>
                <div className="text-5xl font-black tracking-tighter text-white">
                  {points.toLocaleString()}
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Use points for discounts
                </span>
                <button
                  onClick={() => (window.location.href = "/profile/points")}
                  className="text-xs font-bold text-white/80 hover:text-white underline underline-offset-2"
                >
                  View History
                </button>
              </div>
            </section>

            {/* Security Section */}
            <section className="md:col-span-12 bg-dark-surface rounded-xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary">
                  security
                </span>
                <h2 className="text-xl font-bold">Change Password</h2>
              </div>
              <form
                className="space-y-6 max-w-lg"
                onSubmit={passwordFormik.handleSubmit}
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                    Current Password
                  </label>
                  <input
                    name="currentPassword"
                    type="password"
                    value={passwordFormik.values.currentPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    className={`w-full bg-dark-darker text-text-light py-3 px-4 rounded-lg outline-none transition-all ${
                      passwordFormik.touched.currentPassword &&
                      passwordFormik.errors.currentPassword
                        ? "ring-1 ring-red-500/50 focus:ring-red-500/50"
                        : "focus:ring-2 focus:ring-primary"
                    }`}
                    placeholder="Enter current password"
                  />
                  {passwordFormik.touched.currentPassword &&
                    passwordFormik.errors.currentPassword && (
                      <p className="text-red-400 text-xs">
                        {passwordFormik.errors.currentPassword}
                      </p>
                    )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                    New Password
                  </label>
                  <input
                    name="newPassword"
                    type="password"
                    value={passwordFormik.values.newPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    className={`w-full bg-dark-darker text-text-light py-3 px-4 rounded-lg outline-none transition-all ${
                      passwordFormik.touched.newPassword &&
                      passwordFormik.errors.newPassword
                        ? "ring-1 ring-red-500/50 focus:ring-red-500/50"
                        : "focus:ring-2 focus:ring-primary"
                    }`}
                    placeholder="Min. 8 characters"
                  />
                  {passwordFormik.touched.newPassword &&
                    passwordFormik.errors.newPassword && (
                      <p className="text-red-400 text-xs">
                        {passwordFormik.errors.newPassword}
                      </p>
                    )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                    Confirm New Password
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={passwordFormik.values.confirmPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    className={`w-full bg-dark-darker text-text-light py-3 px-4 rounded-lg outline-none transition-all ${
                      passwordFormik.touched.confirmPassword &&
                      passwordFormik.errors.confirmPassword
                        ? "ring-1 ring-red-500/50 focus:ring-red-500/50"
                        : "focus:ring-2 focus:ring-primary"
                    }`}
                    placeholder="Confirm new password"
                  />
                  {passwordFormik.touched.confirmPassword &&
                    passwordFormik.errors.confirmPassword && (
                      <p className="text-red-400 text-xs">
                        {passwordFormik.errors.confirmPassword}
                      </p>
                    )}
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={passwordFormik.isSubmitting}
                    className="bg-primary text-primary-dark px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {passwordFormik.isSubmitting && (
                      <span className="material-symbols-outlined animate-spin text-sm">
                        sync
                      </span>
                    )}
                    {passwordFormik.isSubmitting
                      ? "Changing..."
                      : "Update Password"}
                  </button>
                </div>
              </form>
            </section>

            {/* Coupons Section */}
            <section className="md:col-span-12 bg-dark-surface rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">
                  local_activity
                </span>
                <h2 className="text-xl font-bold">My Coupons</h2>
              </div>

              {coupons.length === 0 ? (
                <p className="text-text-muted">No active coupons</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="bg-dark-darker rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-primary font-mono font-bold">
                          {coupon.code}
                        </span>
                        <span className="text-xs text-text-muted">
                          {coupon.discountType === "PERCENTAGE"
                            ? `${coupon.discountValue}% OFF`
                            : `Rp ${coupon.discountValue.toLocaleString()} OFF`}
                        </span>
                      </div>
                      <div className="text-xs text-text-muted">
                        Exp: {new Date(coupon.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-dark-surface h-16 flex items-center justify-around z-50 border-t border-border-muted/10">
        <button
          onClick={() =>
            handleNavigate(
              user?.role === "ORGANIZER" ? "Dashboard" : "My Tickets",
            )
          }
          className="flex flex-col items-center gap-1"
        >
          <span className="material-symbols-outlined text-text-muted">
            {user?.role === "ORGANIZER" ? "dashboard" : "confirmation_number"}
          </span>
        </button>
        <button
          onClick={() => handleNavigate("Transactions")}
          className="flex flex-col items-center gap-1"
        >
          <span className="material-symbols-outlined text-text-muted">
            receipt_long
          </span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-primary">
            account_circle
          </span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-text-muted">
            settings
          </span>
        </button>
      </div>
    </div>
  );
}
