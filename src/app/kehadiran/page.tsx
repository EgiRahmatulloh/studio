
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

const attendanceSchema = z.object({
  posyanduName: z.string().min(1, { message: "Nama Posyandu wajib diisi." }),
  fullName: z.string().min(1, { message: "Nama Lengkap wajib diisi." }),
  attendanceDate: z.date({
    required_error: "Tanggal kehadiran wajib diisi.",
  }),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

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
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { hasPermission, user } = useAuth();
  
  const canCreate = hasPermission('create_kehadiran');
  const canExport = hasPermission('export_data');
  const canView = hasPermission('view_kehadiran');
  const canEdit = hasPermission('edit_kehadiran');

  useEffect(() => {
    setIsClient(true);
    if(canView){
        fetchAttendances();
    }
  }, [user, canView]);

  useEffect(() => {
    if (editingRecord) {
      form.reset({
        posyanduName: editingRecord.posyanduName,
        fullName: editingRecord.fullName,
        attendanceDate: new Date(editingRecord.attendanceDate),
      });
    } else {
      form.reset({
          posyanduName: "",
          fullName: "",
          attendanceDate: new Date(),
      });
    }
  }, [editingRecord]);

  const fetchAttendances = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/kehadiran', {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch attendances');
      }
      const data: AttendanceRecord[] = await response.json();
      setAttendanceData(data);
    } catch (error: any) {
      console.error("Error fetching attendances:", error);
      toast({
        variant: "destructive",
        title: "Gagal Memuat Data",
        description: error.message || "Terjadi kesalahan saat memuat data kehadiran.",
      });
    }
  };

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      posyanduName: "",
      fullName: "",
      attendanceDate: new Date(),
    },
  });

  const handleEditClick = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  async function onSaveSubmit(data: AttendanceFormValues) {
    const payload = {
      ...data,
      attendanceDate: data.attendanceDate.toISOString(),
    };
    
    const apiPath = editingRecord ? `/api/kehadiran/${editingRecord.id}` : '/api/kehadiran';
    const method = editingRecord ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(apiPath, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingRecord ? 'update' : 'save'} attendance`);
      }

      const resultRecord: AttendanceRecord = await response.json();

      if (editingRecord) {
        setAttendanceData(prev => prev.map(r => r.id === editingRecord.id ? resultRecord : r));
      } else {
        setAttendanceData(prev => [resultRecord, ...prev]);
      }
      
      form.reset({
          posyanduName: "",
          fullName: "",
          attendanceDate: new Date(),
      });
      setEditingRecord(null);
      setIsEditDialogOpen(false);
      toast({
          title: "Sukses",
          description: `Data kehadiran berhasil ${editingRecord ? 'diperbarui' : 'disimpan'}.`,
      });
    } catch (error) {
      console.error(`Error ${editingRecord ? 'updating' : 'saving'} attendance:`, error);
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan Data",
        description: `Terjadi kesalahan saat ${editingRecord ? 'memperbarui' : 'menyimpan'} data kehadiran.`,
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
        "Timestamp": new Date(row.timestamp).toLocaleString("id-ID"),
        "Nama Posyandu": row.posyanduName,
        "Nama Lengkap": row.fullName,
        "Tanggal Kehadiran": format(new Date(row.attendanceDate), "yyyy-MM-dd", { locale: id }),
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

  const renderForm = (isEdit: boolean) => (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSaveSubmit)} id={isEdit ? "edit-kehadiran-form" : "create-kehadiran-form"}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="posyanduName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Posyandu</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Posyandu Melati 1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Ibu Budi"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attendanceDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Kehadiran</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP", {
                              locale: id,
                            })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() ||
                          date < new Date("2000-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </form>
      </Form>
  )

  if (!canView) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center">
              <h1 className="text-2xl font-bold">Akses Ditolak</h1>
              <p className="text-muted-foreground">Anda tidak memiliki izin untuk melihat halaman ini.</p>
          </div>
      )
  }

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
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export ke XLSX
            </Button>
          )}
        </header>

        <div className={cn("grid grid-cols-1 gap-12", canCreate && "lg:grid-cols-5")}>
          {canCreate && (
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Catat Kehadiran Baru</CardTitle>
                  <CardDescription>
                    Isi formulir di bawah ini untuk mencatat kehadiran.
                  </CardDescription>
                </CardHeader>
                {renderForm(false)}
                <CardFooter>
                    <Button type="submit" form="create-kehadiran-form" className="w-full">
                        Simpan
                    </Button>
                </CardFooter>
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
                              {format(
                                new Date(record.timestamp),
                                "Pp",
                                { locale: id }
                              )}
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
            {renderForm(true)}
            <DialogFooter>
                <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">
                    Batal
                </Button>
                <Button type="submit" form="edit-kehadiran-form">
                    Simpan Perubahan
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}
