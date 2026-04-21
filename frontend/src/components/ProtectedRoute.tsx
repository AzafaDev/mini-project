import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import LoadingSpinner from "./ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "USER" | "ORGANIZER";
  fallbackPath?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  fallbackPath = "/login",
}: ProtectedRouteProps) => {
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  console.log("[ProtectedRoute] Render:", { isCheckingAuth, isAuthenticated, hasUser: !!user });

  useEffect(() => {
    // Pertahanan lapis kedua: jika belum pernah cek auth, panggil fetchCurrentUser
    if (!isCheckingAuth && !isAuthenticated && !user) {
      console.log("[ProtectedRoute] No auth state detected, fetching current user");
      fetchCurrentUser();
    }
  }, [isCheckingAuth, isAuthenticated, user, fetchCurrentUser]);

  // URUTAN PENGECEKAN BENAR: Selalu cek isCheckingAuth TERLEBIH DAHULU
  if (isCheckingAuth) {
    console.log("[ProtectedRoute] Checking auth, showing spinner");
    return (
      <div className="bg-[#131313] min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Setelah pengecekan selesai, baru cek autentikasi
  if (!isAuthenticated || !user) {
    console.log("[ProtectedRoute] Not authenticated, redirecting to", fallbackPath);
    return <Navigate to={fallbackPath} replace />;
  }

  // Role check
  if (requiredRole && user.role !== requiredRole) {
    console.log("[ProtectedRoute] Role check failed, redirecting to", fallbackPath);
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};