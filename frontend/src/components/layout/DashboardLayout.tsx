import { Outlet } from "react-router-dom";
import { Sidebar } from "../sidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-dark flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen transition-all duration-300">
        <div className="p-4 sm:p-6 md:p-8 pt-20 md:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;