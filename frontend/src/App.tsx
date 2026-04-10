import { Routes, Route } from "react-router-dom";
import LoginNew from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import EventDetailPage from "./Pages/EventDetailPage";
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
        <Route path="/events/:id" element={<EventDetailPage />} />
      </Routes>
    </>
  );
}
