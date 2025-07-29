
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [totalKehadiran, setTotalKehadiran] = useState(0);
  const [totalKegiatan, setTotalKegiatan] = useState(0);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di Dasbor Posyandu Anda.
        </p>
      </header>
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
