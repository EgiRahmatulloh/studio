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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const { user, loading: authLoading, hasPermission } = useAuth();
  const router = useRouter();
  const [totalKehadiran, setTotalKehadiran] = useState(0);
  const [totalKegiatan, setTotalKegiatan] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [chartDataPengunjung, setChartDataPengunjung] = useState<any[]>([]);
  const [chartDataSasaran, setChartDataSasaran] = useState<any[]>([]);

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

          // Process data for Pengunjung chart
          const pengunjungData = kegiatanData.map(
            (item: any, index: number) => ({
              id: index + 1,
              Bayi: item.pengunjungBayi || 0,
              Balita: item.pengunjungBalita || 0,
              Bumil: item.pengunjungBumil || 0,
              Bufas: item.pengunjungBufas || 0,
              Busu: item.pengunjungBusu || 0,
              Remaja: item.pengunjungRemaja || 0,
              Dewasa: item.pengunjungDewasa || 0,
              Lansia: item.pengunjungLansia || 0,
            })
          );

          // Process data for Sasaran chart
          const sasaranData = kegiatanData.map((item: any, index: number) => ({
            id: index + 1,
            Bayi: item.sasaranBayi || 0,
            Balita: item.sasaranBalita || 0,
            Bumil: item.sasaranBumil || 0,
            Bufas: item.sasaranBufas || 0,
            Busu: item.sasaranBusu || 0,
            Remaja: item.sasaranRemaja || 0,
            Dewasa: item.sasaranDewasa || 0,
            Lansia: item.sasaranLansia || 0,
          }));

          setChartDataPengunjung(pengunjungData.slice(-10)); // Last 10 records
          setChartDataSasaran(sasaranData.slice(-10)); // Last 10 records
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
    <div className="flex flex-col gap-8 p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {/* <p className="text-muted-foreground">Selamat datang, {user.email}!</p> */}
      </header>

      {/* Statistics Cards - Full Width */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {hasPermission("view_kehadiran") && (
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                Total Kehadiran
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <Skeleton className="h-8 w-1/2" />
              ) : (
                <div className="text-3xl font-bold">{totalKehadiran}</div>
              )}
              <p className="text-sm text-muted-foreground mt-2">
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
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                Total Kegiatan
              </CardTitle>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <Skeleton className="h-8 w-1/2" />
              ) : (
                <div className="text-3xl font-bold">{totalKegiatan}</div>
              )}
              <p className="text-sm text-muted-foreground mt-2">
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

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Pengunjung Chart */}
        {hasPermission("view_kegiatan") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Jumlah Pengunjung
              </CardTitle>
              <CardDescription>
                Tren pengunjung per kategori (10 data terakhir)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartDataPengunjung}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="id"
                      label={{
                        value: "Data ke-",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "Jumlah",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Bayi"
                      stroke="#ff7300"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Balita"
                      stroke="#0088fe"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Bumil"
                      stroke="#00c49f"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Bufas"
                      stroke="#ffbb28"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Busu"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Remaja"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Dewasa"
                      stroke="#ffc658"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Lansia"
                      stroke="#ff7c7c"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sasaran Chart */}
        {hasPermission("view_kegiatan") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Sasaran
              </CardTitle>
              <CardDescription>
                Tren sasaran per kategori (10 data terakhir)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartDataSasaran}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="id"
                      label={{
                        value: "Data ke-",
                        position: "insideBottom",
                        offset: -5,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "Jumlah",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Bayi"
                      stroke="#ff7300"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Balita"
                      stroke="#0088fe"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Bumil"
                      stroke="#00c49f"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Bufas"
                      stroke="#ffbb28"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Busu"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Remaja"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Dewasa"
                      stroke="#ffc658"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Lansia"
                      stroke="#ff7c7c"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
