"use client";

import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Navbar() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout berhasil",
        description: "Anda telah keluar dari aplikasi",
      });
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal logout",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    const names = fullName.split(" ");
    if (names.length === 1) return names[0].slice(0, 2).toUpperCase();
    return (names[0][0] + (names[1] ? names[1][0] : "")).toUpperCase();
  };

  return (
    <div className="sticky top-0 z-50 w-full flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b">
      {/* Left side - Sidebar trigger on mobile */}
      <div className="md:hidden">
        <SidebarTrigger />
      </div>

      {/* Right side - User info with dropdown */}
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 bg-[#5D1451]">
                  <AvatarFallback className="text-white font-medium">
                    {getInitials(user.fullName || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {user.fullName || "User"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <button
                className="cursor-pointer w-full flex items-center hover:bg-[#5D1451] hover:text-white transition-colors"
                onClick={() => router.push("/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                className="cursor-pointer w-full flex items-center text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
