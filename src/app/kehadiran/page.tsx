"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Download, Edit } from "lucide-react";
import * as XLSX from "xlsx";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  const [hasAttendedToday, setHasAttendedToday] = useState(false); // New state
  const { toast } = useToast();
  const { hasPermission, user, loading } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle loading state first to prevent conditional hook execution issues
  // that might arise from the useAuth hook.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Memuat data pengguna...</p>
      </div>
    );
  }

  // Now that loading is false, we can safely check permissions.
  const canCreate = hasPermission("create_kehadiran");
  const canExport = hasPermission("export_data");
  const canView = hasPermission("view_kehadiran");
  const canEdit = hasPermission("edit_kehadiran");

  // This effect fetches data once permissions are confirmed.
  useEffect(() => {
    if (user && canView) {
      fetchAttendances();
    }
  }, [user, canView]); // Dependencies are stable after the loading check.

  const fetchAttendances = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/kehadiran", {
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

      // Check if user has attended today
      const today = format(new Date(), "yyyy-MM-dd");
      const userAttended = data.some(
        (record) =>
          record.fullName === user?.fullName &&
          format(new Date(record.attendanceDate), "yyyy-MM-dd") === today
      );
      setHasAttendedToday(userAttended);
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

  // Remove useForm and zodResolver as form is removed
  // const form = useForm<AttendanceFormValues>({
  //   resolver: zodResolver(attendanceSchema),
  //   defaultValues: {
  //     posyanduName: "",
  //     fullName: "",
  //     attendanceDate: new Date(),
  //   },
  // });

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
      setHasAttendedToday(true); // Set to true after successful attendance

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
    // Changed to AttendanceRecord type
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

  function handleExport() {
    if (attendanceData.length === 0) {
      toast({
        variant: "destructive",
        title: "Gagal Ekspor",
        description: "Tidak ada data untuk diekspor.",
      });
      return;
    }

    const dataToExport = attendanceData.map((row) => ({
      Timestamp: new Date(row.timestamp).toLocaleString("id-ID"),
      "Nama Posyandu": row.posyanduName,
      "Nama Lengkap": row.fullName,
      "Tanggal Kehadiran": format(new Date(row.attendanceDate), "yyyy-MM-dd", {
        locale: id,
      }),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Kehadiran");

    XLSX.writeFile(workbook, "data_kehadiran_posyandu.xlsx");

    toast({
      title: "Ekspor Berhasil",
      description: "Data kehadiran telah diunduh sebagai XLSX.",
    });
  }

  // Removed renderForm function as it's no longer needed for creation
  // const renderForm = (isEdit: boolean) => (
  //     <Form {...form}>
  //       <form onSubmit={form.handleSubmit(onSaveSubmit)} id={isEdit ? "edit-kehadiran-form" : "create-kehadiran-form"}>
  //         <CardContent className="space-y-6">
  //           <FormField
  //             control={form.control}
  //             name="posyanduName"
  //             render={({ field }) => (
  //               <FormItem>
  //                 <FormLabel>Nama Posyandu</FormLabel>
  //                 <FormControl>
  //                   <Input
  //                     placeholder="Contoh: Posyandu Melati 1"
  //                     {...field}
  //                   />
  //                 </FormControl>
  //                 <FormMessage />
  //               </FormItem>
  //             )}
  //           />
  //           <FormField
  //             control={form.control}
  //             name="fullName"
  //             render={({ field }) => (
  //               <FormItem>
  //                 <FormLabel>Nama Lengkap</FormLabel>
  //                 <FormControl>
  //                   <Input
  //                     placeholder="Contoh: Ibu Budi"
  //                     {...field}
  //                   />
  //                 </FormControl>
  //                 <FormMessage />
  //               </FormItem>
  //             )}
  //           />
  //           <FormField
  //             control={form.control}
  //             name="attendanceDate"
  //             render={({ field }) => (
  //               <FormItem className="flex flex-col">
  //                 <FormLabel>Tanggal Kehadiran</FormLabel>
  //                 <Popover>
  //                   <PopoverTrigger asChild>
  //                     <FormControl>
  //                       <Button
  //                         variant={"outline"}
  //                         className={cn(
  //                           "w-full justify-start text-left font-normal",
  //                           !field.value && "text-muted-foreground"
  //                         )}
  //                       >
  //                         <CalendarIcon className="mr-2 h-4 w-4" />
  //                         {field.value ? (
  //                           format(field.value, "PPP", {
  //                             locale: id,
  //                           })
  //                         ) : (
  //                           <span>Pilih tanggal</span>
  //                         )}
  //                       </Button>
  //                     </FormControl>
  //                   </PopoverTrigger>
  //                   <PopoverContent
  //                     className="w-auto p-0"
  //                     align="start"
  //                   >
  //                     <Calendar
  //                       mode="single"
  //                       selected={field.value}
  //                       onSelect={field.onChange}
  //                       disabled={(date) =>
  //                         date > new Date() ||
  //                         date < new Date("2000-01-01")
  //                       }
  //                       initialFocus
  //                     />
  //                   </PopoverContent>
  //                 </Popover>
  //                 <FormMessage />
  //               </FormItem>
  //             )}
  //           />
  //         </CardContent>
  //       </form>
  //     </Form>
  // )

  // Handle permission denial after loading check.
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

  // Render the component if user has permission
  return (
    <>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">
              Posyandu Attendance Tracker
            </h1>
            <p className="text-muted-foreground">
              Sistem absensi digital untuk Posyandu
            </p>
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
        </header>

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
                    disabled={hasAttendedToday} // Disable button if already attended
                  >
                    {hasAttendedToday
                      ? "Sudah Hadir Hari Ini"
                      : "Catat Kehadiran"}
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
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Nama Posyandu</TableHead>
                        <TableHead>Nama Lengkap</TableHead>
                        <TableHead>Tanggal Kehadiran</TableHead>
                        {canEdit && <TableHead>Aksi</TableHead>}
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
                            {canEdit && (
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditClick(record)}
                                  className="border-[#5D1451] text-[#5D1451] hover:bg-[#5D1451] hover:text-white"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            )}
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
          {/* Edit form content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editPosyanduName">Nama Posyandu</Label>
              <Input
                id="editPosyanduName"
                type="text"
                value={editingRecord?.posyanduName || ""}
                onChange={(e) =>
                  setEditingRecord((prev) =>
                    prev ? { ...prev, posyanduName: e.target.value } : null,
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
                    prev ? { ...prev, fullName: e.target.value } : null,
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
                    ? format(new Date(editingRecord.attendanceDate), "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) =>
                  setEditingRecord((prev) =>
                    prev ? { ...prev, attendanceDate: e.target.value } : null,
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
              {" "}
              {/* Pass editingRecord to onSaveEditSubmit */}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}
