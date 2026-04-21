import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import LoadingSpinner from "./ui/LoadingSpinner";

interface GuestRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const GuestRoute = ({
  children,
  fallbackPath = "/",
}: GuestRouteProps) => {
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  console.log("[GuestRoute] Render:", { isCheckingAuth, isAuthenticated, hasUser: !!user });

  // Selalu cek isCheckingAuth TERLEBIH DAHULU
  if (isCheckingAuth) {
    console.log("[GuestRoute] Checking auth, showing spinner");
    return (
      <div className="bg-[#131313] min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Setelah pengecekan selesai, jika sudah login redirect ke home
  if (isAuthenticated && user) {
    console.log("[GuestRoute] Already authenticated, redirecting to", fallbackPath);
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
