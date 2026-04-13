import { Route, Routes } from "react-router-dom";

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
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";

const App = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/checkout/:id" element={<CheckoutPage />} />
          <Route path="/events/:id" element={<EventDetaiPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password/:id" element={<ResetPasswordPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
