import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import { Footer } from "../footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;