import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import { MyTickets } from "./pages/MyTicketsPage";
import CheckoutPage from "./pages/CheckoutPage";
import EventDetaiPage from "./pages/EventDetaiPage";
import TransactionsPage from "./pages/TransactionsPage";
import ProfilePage from "./pages/ProfilePage";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import MyTransactionsPage from "./pages/MyTransactionsPage";
import TransactionDetailPage from "./pages/TransactionDetailPage";
import Navbar from "./components/Navbar";
import { Footer } from "./components/footer";
import { Toast } from "./components/ui/Toast";
import { useAuthStore } from "./stores/useAuthStore";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import OrganizerProfilePage from "./pages/OrganizerProfilePage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import PointsHistoryPage from "./pages/PointsHistoryPage";
import EventAttendeesPage from "./pages/EventAttendeesPage";

const noNavbarRoutes = [
  "/dashboard",
  "/transactions",
  "/transactions/organizer",
  "/events/create",
];

const isNoNavbarRoute = (pathname: string) => {
  return noNavbarRoutes.some((route) => pathname.startsWith(route));
};

const App = () => {
  const { fetchCurrentUser } = useAuthStore();
  const location = useLocation();

  const shouldShowNavbar = !isNoNavbarRoute(location.pathname);
  const shouldShowFooter = !isNoNavbarRoute(location.pathname);

  // Use ref to get stable reference and prevent infinite loop
  const fetchCurrentUserRef = useRef(fetchCurrentUser);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    console.log("[App] useEffect running, hasFetched:", hasFetchedRef.current);
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchCurrentUserRef.current();
    console.log("[App] fetchCurrentUser called");
  }, []); // Empty deps - run only once on mount

  return (
    <div className="min-h-screen">
      {shouldShowNavbar && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/events/:id" element={<EventDetaiPage />} />
          <Route path="/organizer/:id" element={<OrganizerProfilePage />} />

          {/* Protected routes - require authentication */}
          <Route
            path="/checkout/:id"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/:id"
            element={
              <ProtectedRoute>
                <TransactionDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-transactions"
            element={
              <ProtectedRoute>
                <MyTransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/points"
            element={
              <ProtectedRoute>
                <PointsHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - require ORGANIZER role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="ORGANIZER">
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute requiredRole="ORGANIZER">
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/organizer"
            element={
              <ProtectedRoute requiredRole="ORGANIZER">
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/create"
            element={
              <ProtectedRoute requiredRole="ORGANIZER">
                <CreateEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              <ProtectedRoute requiredRole="ORGANIZER">
                <EditEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/attendees"
            element={
              <ProtectedRoute requiredRole="ORGANIZER">
                <EventAttendeesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {shouldShowFooter && <Footer />}
      <Toast />
    </div>
  );
};

export default App;
