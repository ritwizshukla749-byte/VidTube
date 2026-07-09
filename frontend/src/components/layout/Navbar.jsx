import { Bell, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";
function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
      <Link to="/" className="text-2xl font-bold text-red-600">
        VidTube
      </Link>

      <div className="hidden md:flex w-full max-w-lg mx-8">
        <input
          type="text"
          placeholder="Search videos..."
          className="w-full rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Upload size={20} />
        </Button>

        <Button variant="ghost" size="icon">
          <Bell size={20} />
        </Button>

        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
}

export default Navbar;
