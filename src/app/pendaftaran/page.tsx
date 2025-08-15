"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, Edit, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nama harus lebih dari 2 karakter.",
  }),
  birthDate: z.date({
    required_error: "Tanggal lahir harus diisi.",
  }),
  gender: z.string({
    required_error: "Jenis kelamin harus dipilih.",
  }),
  category: z.string({
    required_error: "Kategori harus dipilih.",
  }),
});

type VisitorFormValues = z.infer<typeof formSchema>;

interface VisitorRecord {
  id: string;
  createdAt: string;
  name: string;
  birthDate: string;
  gender: string;
  category: string;
}

export default function PendaftaranPage() {
  const [visitorData, setVisitorData] = useState<VisitorRecord[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VisitorRecord | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    fetchVisitors();
  }, []);

  useEffect(() => {
    if (editingRecord) {
      form.reset({
        ...editingRecord,
        birthDate: new Date(editingRecord.birthDate),
      });
    } else {
      form.reset();
    }
  }, [editingRecord]);

  const fetchVisitors = async (start?: Date, end?: Date) => {
    try {
      const params = new URLSearchParams();
      if (start) params.append("startDate", start.toISOString());
      if (end) params.append("endDate", end.toISOString());

      const response = await fetch(`/api/pendaftaran?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch visitors");
      }
      const data: VisitorRecord[] = await response.json();
      setVisitorData(data);
    } catch (error: any) {
      console.error("Error fetching visitors:", error);
      toast({
        variant: "destructive",
        title: "Gagal Memuat Data",
        description:
          error.message || "Terjadi kesalahan saat memuat data pengunjung.",
      });
    }
  };

  const handleFilter = () => {
    fetchVisitors(startDate, endDate);
  };

  const form = useForm<VisitorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      birthDate: undefined, // Mengatur nilai awal menjadi kosong
      gender: "",
      category: "",
    },
  });

  const handleEditClick = (record: VisitorRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  async function onSaveSubmit(data: VisitorFormValues) {
    const payload = {
      ...data,
      birthDate: data.birthDate.toISOString(),
    };

    const apiPath = editingRecord
      ? `/api/pendaftaran/${editingRecord.id}`
      : "/api/pendaftaran";
    const method = editingRecord ? "PUT" : "POST";

    try {
      const response = await fetch(apiPath, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${editingRecord ? "update" : "save"} visitor`
        );
      }

      const resultRecord: VisitorRecord = await response.json();
      if (editingRecord) {
        setVisitorData((prev) =>
          prev.map((r) => (r.id === editingRecord.id ? resultRecord : r))
        );
      } else {
        setVisitorData((prev) => [resultRecord, ...prev]);
      }

      form.reset();
      setEditingRecord(null);
      setIsEditDialogOpen(false);
      setIsCreateDialogOpen(false);
      toast({
        title: "Sukses",
        description: `Data pengunjung berhasil ${
          editingRecord ? "diperbarui" : "disimpan"
        }.`,
      });
    } catch (error) {
      console.error(
        `Error ${editingRecord ? "updating" : "saving"} visitor:`,
        error
      );
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan Data",
        description: `Terjadi kesalahan saat ${
          editingRecord ? "memperbarui" : "menyimpan"
        } data pengunjung.`,
      });
    }
  }

  const renderForm = (isEdit: boolean) => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSaveSubmit)}
        id={isEdit ? "edit-pendaftaran-form" : "create-pendaftaran-form"}
      >
        <CardContent className="space-y-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama lengkap" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="birthDate">Tanggal Lahir</FormLabel>
                <FormControl>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Kelamin</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="bayi">Bayi (0-1 th)</SelectItem>
                    <SelectItem value="balita">Balita (1-5 th)</SelectItem>
                    <SelectItem value="remaja">Remaja (10-18 th)</SelectItem>
                    <SelectItem value="dewasa">Dewasa (19-59 th)</SelectItem>
                    <SelectItem value="lansia">Lansia (60+ th)</SelectItem>
                    <SelectItem value="bumil">Ibu Hamil</SelectItem>
                    <SelectItem value="busui">Ibu Menyusui</SelectItem>
                    <SelectItem value="bufas">Ibu Nifas</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </form>
    </Form>
  );

  return (
    <>
      <div className="flex flex-col gap-8 p-6">
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">
              Pendaftaran Pengunjung Baru
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[#5D1451] hover:bg-[#4A1040] text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Daftar Pengunjung
            </Button>
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
          <DialogContent className="w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Daftar Pengunjung Baru</DialogTitle>
              <CardDescription>
                Isi formulir untuk mendaftarkan pengunjung baru.
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
                form="create-pendaftaran-form"
                className="bg-[#5D1451] hover:bg-[#4A1040] text-white"
              >
                Daftar Pengunjung
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-5">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Data Pengunjung</CardTitle>
                <CardDescription>
                  Daftar semua pengunjung yang terdaftar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Nama Lengkap</TableHead>
                        <TableHead>Tgl Lahir</TableHead>
                        <TableHead>Jenis Kelamin</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isClient && visitorData.length > 0 ? (
                        visitorData.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              {format(new Date(record.createdAt), "Pp", {
                                locale: id,
                              })}
                            </TableCell>
                            <TableCell>{record.name}</TableCell>
                            <TableCell>
                              {format(new Date(record.birthDate), "PPP", {
                                locale: id,
                              })}
                            </TableCell>
                            <TableCell>{record.gender}</TableCell>
                            <TableCell>{record.category}</TableCell>
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
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
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
        <DialogContent className="w-full max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data Pengunjung</DialogTitle>
            <CardDescription>
              Edit formulir pengunjung yang sudah tersimpan.
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
              form="edit-pendaftaran-form"
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
