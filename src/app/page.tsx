
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, User, Shield } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading, isAdmin, hasPermission } = useAuth();
  const router = useRouter();
  const [totalKehadiran, setTotalKehadiran] = useState(0);
  const [totalKegiatan, setTotalKegiatan] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [kehadiranRes, kegiatanRes] = await Promise.all([
          fetch('/api/kehadiran'),
          fetch('/api/kegiatan'),
        ]);

        if (kehadiranRes.ok) {
          const kehadiranData = await kehadiranRes.json();
          setTotalKehadiran(kehadiranData.length);
        }

        if (kegiatanRes.ok) {
          const kegiatanData = await kegiatanRes.json();
          setTotalKegiatan(kegiatanData.length);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang, {user.email}!
        </p>
      </header>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Akun
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Role:</span>
              <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                <Shield className="w-3 h-3 mr-1" />
                {user.role}
              </Badge>
            </div>
            {user.permissions.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Permissions:</span>
                <div className="flex flex-wrap gap-1">
                  {user.permissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Kehadiran
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
                 <div className="h-8 w-1/2 animate-pulse rounded-md bg-muted" />
            ) : (
                <div className="text-2xl font-bold">{totalKehadiran}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total seluruh catatan kehadiran kader.
            </p>
          </CardContent>
           <CardContent className="flex flex-col gap-4 pt-4">
             <Button asChild size="sm">
               <Link href="/kehadiran">Lihat Kehadiran</Link>
             </Button>
           </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kegiatan</CardTitle>
             <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? (
                 <div className="h-8 w-1/2 animate-pulse rounded-md bg-muted" />
            ) : (
                <div className="text-2xl font-bold">{totalKegiatan}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total seluruh laporan kegiatan posyandu.
            </p>
          </CardContent>
           <CardContent className="flex flex-col gap-4 pt-4">
             <Button asChild size="sm">
               <Link href="/kegiatan">Lihat Kegiatan</Link>
             </Button>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
