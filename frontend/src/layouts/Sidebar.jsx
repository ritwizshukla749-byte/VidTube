import { Home, LayoutDashboard, ListVideo, Heart, Upload } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  {
    title: "Home",
    icon: Home,
    to: "/",
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    to: "/dashboard",
  },
  {
    title: "Upload",
    icon: Upload,
    to: "/upload",
  },
  {
    title: "Playlists",
    icon: ListVideo,
    to: "/playlists",
  },
  {
    title: "Liked",
    icon: Heart,
    to: "/liked",
  },
];

function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 flex-col border-r border-slate-800 p-4">
      {links.map((link) => {
        const Icon = link.icon;

        return (
          <NavLink
            key={link.title}
            to={link.to}
            className={({ isActive }) =>
              `mb-2 flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-900"
              }`
            }
          >
            <Icon size={20} />
            {link.title}
          </NavLink>
        );
      })}
    </aside>
  );
}

export default Sidebar;
