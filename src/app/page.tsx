"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, User, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, loading: authLoading, hasPermission } = useAuth();
  const router = useRouter();
  const [totalKehadiran, setTotalKehadiran] = useState(0);
  const [totalKegiatan, setTotalKegiatan] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return; // Skip if no user

    async function fetchData() {
      setLoadingData(true);
      try {
        const token = localStorage.getItem("auth-token");
        const headers = { Authorization: `Bearer ${token}` };

        const promises = [];
        if (hasPermission("view_kehadiran")) {
          promises.push(fetch("/api/kehadiran", { headers }));
        } else {
          promises.push(Promise.resolve(null));
        }

        if (hasPermission("view_kegiatan")) {
          promises.push(fetch("/api/kegiatan", { headers }));
        } else {
          promises.push(Promise.resolve(null));
        }

        const [kehadiranRes, kegiatanRes] = await Promise.all(promises);

        if (kehadiranRes && kehadiranRes.ok) {
          const kehadiranData = await kehadiranRes.json();
          setTotalKehadiran(kehadiranData.length);
        }

        if (kegiatanRes && kegiatanRes.ok) {
          const kegiatanData = await kegiatanRes.json();
          setTotalKegiatan(kegiatanData.length);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, [user, hasPermission]);

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D1451] mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // No user state (will redirect, but show loading in meantime)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D1451] mx-auto"></div>
          <p className="mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang, {user.email}!</p>
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
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                <Shield className="w-3 h-3 mr-1" />
                {user.role}
              </Badge>
            </div>
            {user.permissions.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-sm font-medium">Permissions:</span>
                <div className="flex flex-wrap gap-1">
                  {user.permissions.map((permission) => (
                    <Badge
                      key={permission}
                      variant="outline"
                      className="text-xs"
                    >
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
        {hasPermission("view_kehadiran") && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Kehadiran
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <Skeleton className="h-8 w-1/2" />
              ) : (
                <div className="text-2xl font-bold">{totalKehadiran}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Total seluruh catatan kehadiran kader.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                size="sm"
                className="w-full bg-[#5D1451] hover:bg-[#4A1040] text-white"
              >
                <Link href="/kehadiran">Lihat Kehadiran</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
        {hasPermission("view_kegiatan") && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Kegiatan
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <Skeleton className="h-8 w-1/2" />
              ) : (
                <div className="text-2xl font-bold">{totalKegiatan}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Total seluruh laporan kegiatan posyandu.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                size="sm"
                className="w-full bg-[#5D1451] hover:bg-[#4A1040] text-white"
              >
                <Link href="/kegiatan">Lihat Kegiatan</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

    </div>
  );
}
