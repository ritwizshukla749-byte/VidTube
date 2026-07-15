import {
  Home,
  LayoutDashboard,
  ListVideo,
  Heart,
  Upload,
  History,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const mainLinks = [
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
];

const libraryLinks = [
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
  {
    title: "History",
    icon: History,
    to: "/history",
  },
];

function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-800 bg-[#070b18] px-5 py-6">
      {/* User Section */}

      <div className="mb-10 flex flex-col items-center">
        <img
          src={user?.avatar}
          alt={user?.fullName}
          className="h-20 w-20 rounded-full border-2 border-amber-400 object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/100x100/1e293b/ffffff?text=User";
          }}
        />

        <h2 className="mt-5 text-center text-xl font-bold">
          Welcome Back, {user?.fullName?.split(" ")[0]}
        </h2>
      </div>

      {/* Navigation */}

      <nav>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Main
        </p>

        <div className="space-y-2">
          {mainLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.title}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-2xl px-5 py-3 text-base transition-all ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <Icon size={20} />
                {link.title}
              </NavLink>
            );
          })}
        </div>

        <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Library
        </p>

        <div className="space-y-2">
          {libraryLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.title}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-2xl px-5 py-3 text-base transition-all ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <Icon size={20} />
                {link.title}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Creator Tip */}
      <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-sm font-semibold text-amber-400">✨ Creator Tip</p>

        <p className="mt-1 text-base font-medium">Upload consistently</p>

        <p className="mt-1 text-sm text-slate-500">
          Consistency beats perfection.
        </p>

        <NavLink
          to="/upload"
          className="mt-4 block rounded-full bg-red-600 py-2.5 text-center text-sm font-semibold transition hover:bg-red-700"
        >
          Upload Video
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
