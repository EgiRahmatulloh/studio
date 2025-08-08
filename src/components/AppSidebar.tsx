'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Home, Users, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';

export function AppSidebar() {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logout berhasil',
        description: 'Anda telah keluar dari aplikasi',
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal logout',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <h2 className="text-lg font-semibold">Posyandu App</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">Role: {user.role}</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Home />
                Dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {(isAdmin() || user.permissions.includes('view_kehadiran')) && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/kehadiran">
                  <Users />
                  Kehadiran
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          {(isAdmin() || user.permissions.includes('view_kegiatan')) && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/kegiatan">
                  <Activity />
                  Kegiatan
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/profile">
                <UserIcon />
                Profil
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {isAdmin() && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin">
                  <Settings />
                  Admin Panel
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
