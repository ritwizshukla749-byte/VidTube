import { Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { setQuery } from "@/store/searchSlice";
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";

function Navbar() {
  const { isAuthenticated} = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-50 flex h-20 items-center border-b border-slate-800 bg-[#070b18] px-8">
      <Link
        to="/"
        className="group flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 text-xl font-black text-black shadow-lg">
          V
        </div>

        <span className="text-3xl font-bold tracking-tight">
          <span className="transition-colors duration-300 group-hover:text-red-500">
            Vid
          </span>
          Tube
        </span>
      </Link>

      <div className="mx-auto hidden w-full max-w-2xl lg:block">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search videos..."
            onChange={(e) => dispatch(setQuery(e.target.value))}
            className="h-14 w-full rounded-full border border-slate-700 bg-slate-900 pl-14 pr-6 text-white placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSearch(true)}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <div className="ml-8 flex items-center">
        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <Link to="/login">
            <Button className="rounded-full x-6">Login</Button>
          </Link>
        )}
      </div>
    </header>

      {showSearch && (
        <div className="border-b border-slate-800 bg-[#070b18] p-4 lg:hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

            <input
              autoFocus
              placeholder="Search videos..."
              onChange={(e) => dispatch(setQuery(e.target.value))}
              className="h-12 w-full rounded-full border border-slate-700 bg-slate-900 pl-12 pr-12"
            />

            <button
              onClick={() => setShowSearch(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
  </>
  );
}

export default Navbar;
