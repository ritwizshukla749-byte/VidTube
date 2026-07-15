import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../layouts/Sidebar";

function MainLayout() {
  useEffect(() => {
    document.title = "VidTube";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <Outlet />
      </main>
    </div>
    </div>
  );
}

export default MainLayout;
