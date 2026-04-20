import { Outlet } from "react-router-dom";
import { Sidebar } from "../sidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-dark">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;