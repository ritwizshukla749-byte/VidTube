import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { LogOut, LayoutDashboard, Heart, History } from "lucide-react";

import { logout } from "@/store/authSlice";
import { logoutUser } from "@/services/auth.services";
import toast from "react-hot-toast";

function UserMenu() {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();

      dispatch(logout());

      toast.success("Logged out successfully");

      navigate("/login");
    } catch (error) {
      console.error(error);

      toast.error("Failed to logout");
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.fullName[0]}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-2">
          <p className="font-semibold">{user.fullName}</p>

          <p className="text-sm text-slate-500">{user.email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate("/history")}>
          <History className="mr-2 h-4 w-4" />
          Watch History
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate("/liked")}>
          <Heart className="mr-2 h-4 w-4" />
          Liked Videos
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
