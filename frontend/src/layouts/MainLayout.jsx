import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../layouts/Sidebar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
    </div>
  );
}

export default MainLayout;
