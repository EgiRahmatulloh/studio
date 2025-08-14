"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Activity,
  Home,
  Users,
  Settings,
  LogOut,
  User as UserIcon,
  Menu,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function AppSidebar() {
  const { user, isAdmin, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();

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

  // Jangan render sidebar jika masih loading atau tidak ada user
  if (loading || !user) {
    return <div className="hidden" />;
  }

  // Function to check if the current path matches the link
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <Sidebar className="bg-white border-r border-gray-200">
      <SidebarHeader className="bg-white">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center p-1.5">
              <Image
                src="/images/LOGO POSYANDU.png"
                alt="Logo Posyandu"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-lg font-semibold">SIPOPAY</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarMenu className="px-3">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={cn(
                "px-6 py-3",
                isActive("/") &&
                  "bg-[#5D1451]/10 text-[#5D1451] font-medium border-l-4 border-[#5D1451]"
              )}
            >
              <Link href="/" className="flex items-center">
                <Home
                  className={cn("mr-3", isActive("/") && "text-[#5D1451]")}
                />
                Dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {(isAdmin() || user.permissions.includes("view_kehadiran")) && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "px-6 py-3",
                  isActive("/kehadiran") &&
                    "bg-[#5D1451]/10 text-[#5D1451] font-medium border-l-4 border-[#5D1451]"
                )}
              >
                <Link href="/kehadiran" className="flex items-center">
                  <Users
                    className={cn(
                      "mr-3",
                      isActive("/kehadiran") && "text-[#5D1451]"
                    )}
                  />
                  Kehadiran
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {(isAdmin() || user.permissions.includes("view_kegiatan")) && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "px-6 py-3",
                  isActive("/kegiatan") &&
                    "bg-[#5D1451]/10 text-[#5D1451] font-medium border-l-4 border-[#5D1451]"
                )}
              >
                <Link href="/kegiatan" className="flex items-center">
                  <Activity
                    className={cn(
                      "mr-3",
                      isActive("/kegiatan") && "text-[#5D1451]"
                    )}
                  />
                  Kegiatan
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* Menu Pendaftaran */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={cn(
                "px-6 py-3",
                isActive("/pendaftaran") &&
                  "bg-[#5D1451]/10 text-[#5D1451] font-medium border-l-4 border-[#5D1451]"
              )}
            >
              <Link href="/pendaftaran" className="flex items-center">
                <UserIcon
                  className={cn(
                    "mr-3",
                    isActive("/pendaftaran") && "text-[#5D1451]"
                  )}
                />
                Pendaftaran
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {isAdmin() && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "px-6 py-3",
                  isActive("/admin") &&
                    "bg-[#5D1451]/10 text-[#5D1451] font-medium border-l-4 border-[#5D1451]"
                )}
              >
                <Link href="/admin" className="flex items-center">
                  <Settings
                    className={cn(
                      "mr-3",
                      isActive("/admin") && "text-[#5D1451]"
                    )}
                  />
                  Admin Panel
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="bg-white">
        <div className="px-6 py-4">
          <div className="px-3 py-2 rounded-md bg-gray-100 text-xs text-gray-500 mb-4">
            <p className="font-medium">SIPOPAY v1.0.0</p>
            <p className="mt-1">Sistem Informasi Posyandu</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
