"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, Download, Edit } from "lucide-react";
import * as XLSX from "xlsx";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AttendanceRecord {
  id: string;
  timestamp: string;
  posyanduName: string;
  fullName: string;
  attendanceDate: string;
}

export default function KehadiranPage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [hasAttendedToday, setHasAttendedToday] = useState(false);
  const [attendanceConfig, setAttendanceConfig] = useState<{ id: string; configDate: string } | null>(null);
  const [isAttendanceButtonActive, setIsAttendanceButtonActive] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const { toast } = useToast();
  const { hasPermission, user, loading } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Memuat data pengguna...</p>
      </div>
    );
  }

  const canCreate = hasPermission("create_kehadiran");
  const canExport = hasPermission("export_data");
  const canView = hasPermission("view_kehadiran");
  const canEdit = hasPermission("edit_kehadiran");

  useEffect(() => {
    if (user && canView) {
      fetchAttendances();
      fetchAttendanceConfig();
    }
  }, [user, canView]);

  useEffect(() => {
    if (attendanceConfig) {
      const today = new Date();
      const configDate = new Date(attendanceConfig.configDate);

      const isSameDay = today.getDate() === configDate.getDate() &&
                        today.getMonth() === configDate.getMonth() &&
                        today.getFullYear() === configDate.getFullYear();
      setIsAttendanceButtonActive(isSameDay);
    } else {
      setIsAttendanceButtonActive(false); // Disable if no config exists
    }
  }, [attendanceConfig]);

  const fetchAttendanceConfig = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/admin/attendance-config", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAttendanceConfig(data);
      } else {
        console.error("Failed to fetch attendance config");
      }
    } catch (error) {
      console.error("Error fetching attendance config:", error);
    }
  };

  const fetchAttendances = async (
    start?: Date | undefined,
    end?: Date | undefined
  ) => {
    try {
      const token = localStorage.getItem("auth-token");
      const params = new URLSearchParams();
      if (start) params.append("startDate", start.toISOString());
      if (end) params.append("endDate", end.toISOString());

      const response = await fetch(`/api/kehadiran?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch attendances");
      }
      const data: AttendanceRecord[] = await response.json();
      setAttendanceData(data);

      if (!start && !end) {
        const today = format(new Date(), "yyyy-MM-dd");
        const userAttended = data.some(
          (record) =>
            record.fullName === user?.fullName &&
            format(new Date(record.attendanceDate), "yyyy-MM-dd") === today
        );
        setHasAttendedToday(userAttended);
      }
    } catch (error: any) {
      console.error("Error fetching attendances:", error);
      toast({
        variant: "destructive",
        title: "Gagal Memuat Data",
        description:
          error.message || "Terjadi kesalahan saat memuat data kehadiran.",
      });
    }
  };

  const handleFilter = () => {
    fetchAttendances(startDate, endDate);
  };

  const handleEditClick = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  async function handleRecordAttendance() {
    if (!user || !user.fullName || !user.posyanduName) {
      toast({
        variant: "destructive",
        title: "Gagal Mencatat Kehadiran",
        description:
          "Informasi user tidak lengkap. Pastikan nama lengkap dan nama posyandu terisi di profil Anda.",
      });
      return;
    }

    const payload = {
      posyanduName: user.posyanduName,
      fullName: user.fullName,
      attendanceDate: new Date().toISOString(),
    };

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/kehadiran", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record attendance");
      }

      const resultRecord: AttendanceRecord = await response.json();
      setAttendanceData((prev) => [resultRecord, ...prev]);
      setHasAttendedToday(true);

      toast({
        title: "Sukses",
        description: "Kehadiran berhasil dicatat.",
      });
    } catch (error: any) {
      console.error("Error recording attendance:", error);
      toast({
        variant: "destructive",
        title: "Gagal Mencatat Kehadiran",
        description:
          error.message || "Terjadi kesalahan saat mencatat kehadiran.",
      });
    }
  }

  async function onSaveEditSubmit(data: AttendanceRecord) {
    if (!editingRecord) return;

    const payload = {
      posyanduName: data.posyanduName,
      fullName: data.fullName,
      attendanceDate: new Date(data.attendanceDate).toISOString(),
    };

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(`/api/kehadiran/${editingRecord.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update attendance");
      }

      const resultRecord: AttendanceRecord = await response.json();
      setAttendanceData((prev) =>
        prev.map((r) => (r.id === editingRecord.id ? resultRecord : r))
      );

      setEditingRecord(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Sukses",
        description: "Data kehadiran berhasil diperbarui.",
      });
    } catch (error: any) {
      console.error("Error updating attendance:", error);
      toast({
        variant: "destructive",
        title: "Gagal Memperbarui Data",
        description:
          error.message || "Terjadi kesalahan saat memperbarui data kehadiran.",
      });
    }
  }

  async function handleExport() {
    let dataToExport = attendanceData;

    if (startDate || endDate) {
      try {
        const token = localStorage.getItem("auth-token");
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate.toISOString());
        if (endDate) params.append("endDate", endDate.toISOString());

        const response = await fetch(`/api/kehadiran?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch filtered data for export"
          );
        }
        dataToExport = await response.json();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Gagal Mengambil Data Ekspor",
          description:
            error.message ||
            "Terjadi kesalahan saat mengambil data yang difilter.",
        });
        return;
      }
    }

    if (dataToExport.length === 0) {
      toast({
        variant: "destructive",
        title: "Gagal Ekspor",
        description: "Tidak ada data untuk diekspor pada rentang tanggal yang dipilih.",
      });
      return;
    }

    const formattedData = dataToExport.map((row) => ({
      Timestamp: new Date(row.timestamp).toLocaleString("id-ID"),
      "Nama Posyandu": row.posyanduName,
      "Nama Lengkap": row.fullName,
      "Tanggal Kehadiran": format(new Date(row.attendanceDate), "yyyy-MM-dd", {
        locale: id,
      }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Kehadiran");

    XLSX.writeFile(workbook, "data_kehadiran_posyandu.xlsx");

    toast({
      title: "Ekspor Berhasil",
      description: "Data kehadiran telah diunduh sebagai XLSX.",
    });
  }

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-2xl font-bold">Akses Ditolak</h1>
        <p className="text-muted-foreground">
          Anda tidak memiliki izin untuk melihat halaman ini.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8 p-6">
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">
              Kehadiran Kader Posyandu
            </h1>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP", { locale: id }) : <span>Tanggal Mulai</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP", { locale: id }) : <span>Tanggal Selesai</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleFilter} className="bg-[#5D1451] hover:bg-[#4A1040] text-white">
              Filter
            </Button>
          </div>
          {canExport && (
            <Button
              onClick={handleExport}
              className="bg-[#5D1451] hover:bg-[#4A1040] text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Export ke XLSX
            </Button>
          )}
        </div>

        <div
          className={cn(
            "grid grid-cols-1 gap-12",
            canCreate && "lg:grid-cols-5"
          )}
        >
          {canCreate && (
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Catat Kehadiran Baru</CardTitle>
                  <CardDescription>
                    Klik tombol di bawah ini untuk mencatat kehadiran Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleRecordAttendance}
                    className="w-full bg-[#5D1451] hover:bg-[#4A1040] text-white"
                    disabled={hasAttendedToday || !isAttendanceButtonActive}
                  >
                    {hasAttendedToday
                      ? "Sudah Hadir Hari Ini"
                      : isAttendanceButtonActive
                      ? "Catat Kehadiran"
                      : "Tombol Hadir Nonaktif (Di luar tanggal yang ditentukan)"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <div className={cn(canCreate ? "lg:col-span-3" : "lg:col-span-5")}>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Data Kehadiran</CardTitle>
                <CardDescription>
                  Daftar semua catatan kehadiran yang tersimpan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Nama Posyandu</TableHead>
                        <TableHead>Nama Lengkap</TableHead>
                        <TableHead>Tanggal Kehadiran</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isClient && attendanceData.length > 0 ? (
                        attendanceData.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(record.timestamp), "Pp", {
                                locale: id,
                              })}
                            </TableCell>
                            <TableCell>{record.posyanduName}</TableCell>
                            <TableCell>{record.fullName}</TableCell>
                            <TableCell>
                              {format(new Date(record.attendanceDate), "PPP", {
                                locale: id,
                              })}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={canEdit ? 5 : 4}
                            className="h-24 text-center"
                          >
                            {isClient ? "Belum ada data." : "Memuat..."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Kehadiran</DialogTitle>
            <DialogDescription>
              Perbarui informasi kehadiran di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editPosyanduName">Nama Posyandu</Label>
              <Input
                id="editPosyanduName"
                type="text"
                value={editingRecord?.posyanduName || ""}
                onChange={(e) =>
                  setEditingRecord((prev) =>
                    prev ? { ...prev, posyanduName: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editFullName">Nama Lengkap</Label>
              <Input
                id="editFullName"
                type="text"
                value={editingRecord?.fullName || ""}
                onChange={(e) =>
                  setEditingRecord((prev) =>
                    prev ? { ...prev, fullName: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAttendanceDate">Tanggal Kehadiran</Label>
              <Input
                id="editAttendanceDate"
                type="date"
                value={
                  editingRecord?.attendanceDate
                    ? format(
                        new Date(editingRecord.attendanceDate),
                        "yyyy-MM-dd"
                      )
                    : ""
                }
                onChange={(e) =>
                  setEditingRecord((prev) =>
                    prev ? { ...prev, attendanceDate: e.target.value } : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsEditDialogOpen(false)}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button
              onClick={() => onSaveEditSubmit(editingRecord!)}
              className="bg-[#5D1451] hover:bg-[#4A1040] text-white"
            >
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}
