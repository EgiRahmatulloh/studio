import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
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
          <CardHeader>
            <CardTitle>Kehadiran Cepat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              Langsung catat kehadiran baru untuk ibu dan anak.
            </p>
            <Button asChild className="mt-auto">
              <Link href="/kehadiran">Buka Halaman Kehadiran</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Catatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">2</p>
            <p className="text-xs text-muted-foreground">
              Total catatan kehadiran yang sudah ada.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
