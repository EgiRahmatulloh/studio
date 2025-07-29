
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, Download } from "lucide-react";
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

const attendanceSchema = z.object({
  posyanduName: z.string().min(1, { message: "Nama Posyandu wajib diisi." }),
  fullName: z.string().min(1, { message: "Nama Lengkap wajib diisi." }),
  attendanceDate: z.date({
    required_error: "Tanggal kehadiran wajib diisi.",
  }),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

interface AttendanceRecord extends AttendanceFormValues {
  id: string;
  timestamp: string;
}

const initialData: AttendanceRecord[] = [
  {
    id: "1",
    timestamp: new Date().toISOString(),
    posyanduName: "Posyandu Melati 1",
    fullName: "Ibu Budi",
    attendanceDate: new Date(),
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    posyanduName: "Posyandu Mawar 2",
    fullName: "Anak Ani",
    attendanceDate: new Date(Date.now() - 86400000),
  },
];

export default function KehadiranPage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching data and prevent hydration issues
    setIsClient(true);
    setAttendanceData(initialData);
  }, []);

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      posyanduName: "",
      fullName: "",
      attendanceDate: new Date(),
    },
  });

  function onSubmit(data: AttendanceFormValues) {
    const newRecord: AttendanceRecord = {
      id: new Date().getTime().toString(),
      timestamp: new Date().toISOString(),
      ...data,
    };
    setAttendanceData((prev) => [newRecord, ...prev]);
    form.reset({
        posyanduName: "",
        fullName: "",
        attendanceDate: new Date(),
    });
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
        "Tanggal Kehadiran": format(row.attendanceDate, "yyyy-MM-dd", { locale: id }),
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
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export ke XLSX
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Catat Kehadiran Baru</CardTitle>
                <CardDescription>
                  Isi formulir di bawah ini untuk mencatat kehadiran.
                </CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
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
                  <CardFooter>
                    <Button type="submit" className="w-full">
                      Simpan
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>

          <div className="lg:col-span-3">
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
                              {format(record.attendanceDate, "PPP", {
                                locale: id,
                              })}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
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
      <Toaster />
    </>
  );
}
