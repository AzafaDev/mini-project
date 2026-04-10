import { Routes, Route } from "react-router-dom";
import VerifyEmail from "./Pages/RegisterVerification";
import ForgotPassword from "./Pages/ResetPass";
import Profile from "./Pages/Profile";
import LoginNew from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import EventDetailPPage from "./Pages/EventDetailPage";
import Navbar from "./Components/Navbar";
import HomePage from "./Pages/HomePage";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginNew />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/email-verification" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/user-profile" element={<Profile />} />
        <Route path="/events/:id" element={<EventDetailPPage />} />
      </Routes>
    </>
  );
}
