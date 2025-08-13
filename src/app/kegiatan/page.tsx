"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Download,
  Link as LinkIcon,
  Edit,
  PlusCircle,
} from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

// Daftar nama posyandu
const POSYANDU_NAMES = [
  "DAHLIA",
  "KENANGA I",
  "MAWAR MERAH",
  "CEMPAKA",
  "KENANGA II",
  "MELATI",
];

const numberSchema = z.preprocess(
  (a: unknown) =>
    a === "" || a === undefined || a === null ? 0 : parseInt(String(a), 10),
  z.number().min(0, "Jumlah tidak boleh negatif").optional().default(0)
);

const activitySchema = z.object({
  posyanduName: z.string().min(1, { message: "Nama Posyandu wajib diisi." }),
  activityDate: z.date({
    required_error: "Tanggal kegiatan wajib diisi.",
  }),
  sasaranBalita: numberSchema,
  sasaranBumil: numberSchema,
  sasaranRemaja: numberSchema,
  sasaranLansia: numberSchema,
  sasaranBufas: numberSchema,
  sasaranBusu: numberSchema,
  sasaranBayi: numberSchema,
  sasaranDewasa: numberSchema,
  pengunjungBalita: numberSchema,
  pengunjungBumil: numberSchema,
  pengunjungRemaja: numberSchema,
  pengunjungLansia: numberSchema,
  pengunjungBufas: numberSchema,
  pengunjungBusu: numberSchema,
  pengunjungBayi: numberSchema,
  pengunjungDewasa: numberSchema,
  kegiatanFoto: z
    .string()
    .url({ message: "Harap masukkan URL Google Drive yang valid." })
    .optional()
    .or(z.literal("")),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface ActivityRecord {
  id: string;
  timestamp: string;
  posyanduName: string;
  activityDate: string;
  sasaranBalita: number;
  sasaranBumil: number;
  sasaranRemaja: number;
  sasaranLansia: number;
  sasaranBufas: number;
  sasaranBusu: number;
  sasaranBayi: number;
  sasaranDewasa: number;
  pengunjungBalita: number;
  pengunjungBumil: number;
  pengunjungRemaja: number;
  pengunjungLansia: number;
  pengunjungBufas: number;
  pengunjungBusu: number;
  pengunjungBayi: number;
  pengunjungDewasa: number;
  fotoUrl?: string;
}

export default function KegiatanPage() {
  const [activityData, setActivityData] = useState<ActivityRecord[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ActivityRecord | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const { toast } = useToast();
  const { hasPermission, user, loading } = useAuth();

  const canCreate = hasPermission("create_kegiatan");
  const canExport = hasPermission("export_data");
  const canView = hasPermission("view_kegiatan");
  const canEdit = hasPermission("edit_kegiatan");

  useEffect(() => {
    setIsClient(true);
    if (!loading && user && canView) {
      fetchActivities();
    }
  }, [user, canView, loading]);

  useEffect(() => {
    if (editingRecord) {
      form.reset({
        ...editingRecord,
        activityDate: new Date(editingRecord.activityDate),
        kegiatanFoto: editingRecord.fotoUrl || "",
      });
    } else {
      form.reset();
    }
  }, [editingRecord]);

  const fetchActivities = async (start?: Date, end?: Date) => {
    try {
      const token = localStorage.getItem("auth-token");
      const params = new URLSearchParams();
      if (start) params.append("startDate", start.toISOString());
      if (end) params.append("endDate", end.toISOString());

      const response = await fetch(`/api/kegiatan?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch activities");
      }
      const data: ActivityRecord[] = await response.json();
      setActivityData(data);
    } catch (error: any) {
      console.error("Error fetching activities:", error);
      toast({
        variant: "destructive",
        title: "Gagal Memuat Data",
        description:
          error.message || "Terjadi kesalahan saat memuat data kegiatan.",
      });
    }
  };

  const handleFilter = () => {
    fetchActivities(startDate, endDate);
  };

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      posyanduName: user?.posyanduName || "",
      activityDate: new Date(),
      sasaranBalita: 0,
      sasaranBumil: 0,
      sasaranRemaja: 0,
      sasaranLansia: 0,
      sasaranBufas: 0,
      sasaranBusu: 0,
      sasaranBayi: 0,
      sasaranDewasa: 0,
      pengunjungBalita: 0,
      pengunjungBumil: 0,
      pengunjungRemaja: 0,
      pengunjungLansia: 0,
      pengunjungBufas: 0,
      pengunjungBusu: 0,
      pengunjungBayi: 0,
      pengunjungDewasa: 0,
      kegiatanFoto: "",
    },
  });

  useEffect(() => {
    if (user?.posyanduName) {
      form.setValue("posyanduName", user.posyanduName);
    }
  }, [user?.posyanduName, form]);

  const handleEditClick = (record: ActivityRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  async function onSaveSubmit(data: ActivityFormValues) {
    const payload = {
      ...data,
      fotoUrl: data.kegiatanFoto,
      activityDate: data.activityDate.toISOString(),
    };

    const apiPath = editingRecord
      ? `/api/kegiatan/${editingRecord.id}`
      : "/api/kegiatan";
    const method = editingRecord ? "PUT" : "POST";

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(apiPath, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${editingRecord ? "update" : "save"} activity`
        );
      }

      const resultRecord: ActivityRecord = await response.json();
      if (editingRecord) {
        setActivityData((prev) =>
          prev.map((r) => (r.id === editingRecord.id ? resultRecord : r))
        );
      } else {
        setActivityData((prev) => [resultRecord, ...prev]);
      }

      form.reset();
      setEditingRecord(null);
      setIsEditDialogOpen(false);
      setIsCreateDialogOpen(false);
      toast({
        title: "Sukses",
        description: `Data kegiatan berhasil ${
          editingRecord ? "diperbarui" : "disimpan"
        }.`,
      });
    } catch (error) {
      console.error(
        `Error ${editingRecord ? "updating" : "saving"} activity:`,
        error
      );
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan Data",
        description: `Terjadi kesalahan saat ${
          editingRecord ? "memperbarui" : "menyimpan"
        } data kegiatan.`,
      });
    }
  }

    async function handleExport() {
    let dataToExport = activityData;

    if (startDate || endDate) {
      try {
        const token = localStorage.getItem("auth-token");
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate.toISOString());
        if (endDate) params.append("endDate", endDate.toISOString());

        const response = await fetch(`/api/kegiatan?${params.toString()}`, {
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

    const header1 = [
      "Timestamp",
      "Nama Posyandu",
      "Tanggal Kegiatan",
      "Jumlah sasaran",
      "", "", "", "", "", "", "",
      "Jumlah pengunjung",
      "", "", "", "", "", "", "",
      "Foto Kegiatan",
    ];
    const header2 = [
      "",
      "",
      "",
      "Bayi",
      "Balita",
      "Bumil",
      "Bufas",
      "Busu",
      "Remaja",
      "Dewasa",
      "Lansia",
      "Bayi",
      "Balita",
      "Bumil",
      "Bufas",
      "Busu",
      "Remaja",
      "Dewasa",
      "Lansia",
      "",
    ];

    const dataForExport = dataToExport.map((item) => {
      return [
        new Date(item.timestamp).toLocaleString("id-ID"),
        item.posyanduName,
        format(new Date(item.activityDate), "yyyy-MM-dd"),
        item.sasaranBayi || 0,
        item.sasaranBalita || 0,
        item.sasaranBumil || 0,
        item.sasaranBufas || 0,
        item.sasaranBusu || 0,
        item.sasaranRemaja || 0,
        item.sasaranDewasa || 0,
        item.sasaranLansia || 0,
        item.pengunjungBayi || 0,
        item.pengunjungBalita || 0,
        item.pengunjungBumil || 0,
        item.pengunjungBufas || 0,
        item.pengunjungBusu || 0,
        item.pengunjungRemaja || 0,
        item.pengunjungDewasa || 0,
        item.pengunjungLansia || 0,
        item.fotoUrl || "",
      ];
    });

    const finalData = [header1, header2, ...dataForExport];
    const worksheet = XLSX.utils.aoa_to_sheet(finalData);

    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // Timestamp
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // Nama Posyandu
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // Tanggal Kegiatan
      { s: { r: 0, c: 3 }, e: { r: 0, c: 10 } }, // Jumlah sasaran
      { s: { r: 0, c: 11 }, e: { r: 0, c: 18 } }, // Jumlah pengunjung
      { s: { r: 0, c: 19 }, e: { r: 1, c: 19 } }, // Foto Kegiatan
    ];

    worksheet["!cols"] = [
      { wch: 20 }, // Timestamp
      { wch: 30 },
      { wch: 15 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 30 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kegiatan");
    XLSX.writeFile(workbook, "Data-Kegiatan-Posyandu.xlsx");

    toast({
      title: "Ekspor Berhasil",
      description: "Data kegiatan telah diunduh sebagai XLSX.",
    });
  }

  const renderForm = (isEdit: boolean) => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSaveSubmit)}
        id={isEdit ? "edit-kegiatan-form" : "create-kegiatan-form"}
      >
        <CardContent className="space-y-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <FormField
            control={form.control}
            name="posyanduName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Posyandu</FormLabel>
                <FormControl>
                  {user?.role === "ADMIN" ? (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Posyandu" />
                      </SelectTrigger>
                      <SelectContent>
                        {POSYANDU_NAMES.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      {...field}
                      readOnly
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                      placeholder="Nama Posyandu Anda"
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="activityDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Kegiatan</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal border-[#5D1451] text-[#5D1451] hover:bg-[#5D1451] hover:text-white",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: id })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("2000-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="mb-4 text-lg font-medium">Jumlah Sasaran</h3>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="sasaranBayi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bayi</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sasaranBalita"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balita</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sasaranBumil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bumil</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sasaranBufas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bufas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sasaranBusu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Busu</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sasaranRemaja"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remaja</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sasaranDewasa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dewasa</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sasaranLansia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lansia</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-medium">Pengunjung</h3>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="pengunjungBayi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bayi</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pengunjungBalita"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balita</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pengunjungBumil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bumil</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pengunjungBufas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bufas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pengunjungBusu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Busu</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pengunjungRemaja"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remaja</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pengunjungDewasa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dewasa</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pengunjungLansia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lansia</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <Separator />
          <FormField
            control={form.control}
            name="kegiatanFoto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link Foto Kegiatan (Google Drive)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://docs.google.com/..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Salin dan tempel tautan dari Google Drive.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </form>
    </Form>
  );

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
              Laporan Kegiatan Posyandu
            </h1>
          </div>
          <div className="flex gap-2">
            {canCreate && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#5D1451] hover:bg-[#4A1040] text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Kegiatan
              </Button>
            )}
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
        </div>

        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        >
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Catat Kegiatan Baru</DialogTitle>
              <CardDescription>
                Isi formulir untuk melaporkan kegiatan baru.
              </CardDescription>
            </DialogHeader>
            {renderForm(false)}
            <DialogFooter>
              <Button
                onClick={() => setIsCreateDialogOpen(false)}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Batal
              </Button>
              <Button
                type="submit"
                form="create-kegiatan-form"
                className="bg-[#5D1451] hover:bg-[#4A1040] text-white"
              >
                Simpan Kegiatan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-5">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Data Kegiatan</CardTitle>
                <CardDescription>
                  Daftar semua kegiatan yang tercatat.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Nama Posyandu</TableHead>
                        <TableHead>Tgl Kegiatan</TableHead>
                        <TableHead>Foto</TableHead>
                        {canEdit && <TableHead>Aksi</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isClient && activityData.length > 0 ? (
                        activityData.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(record.timestamp), "Pp", {
                                locale: id,
                              })}
                            </TableCell>
                            <TableCell>{record.posyanduName}</TableCell>
                            <TableCell>
                              {format(new Date(record.activityDate), "PPP", {
                                locale: id,
                              })}
                            </TableCell>
                            <TableCell>
                              {record.fotoUrl ? (
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="border-[#5D1451] text-[#5D1451] hover:bg-[#5D1451] hover:text-white"
                                >
                                  <Link
                                    href={record.fotoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <LinkIcon className="mr-2 h-4 w-4" /> Buka
                                  </Link>
                                </Button>
                              ) : (
                                <span>-</span>
                              )}
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
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data Kegiatan</DialogTitle>
            <CardDescription>
              Edit formulir kegiatan yang sudah tersimpan.
            </CardDescription>
          </DialogHeader>
          {renderForm(true)}
          <DialogFooter>
            <Button
              onClick={() => setIsEditDialogOpen(false)}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="edit-kegiatan-form"
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
