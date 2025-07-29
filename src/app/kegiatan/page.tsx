
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, Download, Upload } from "lucide-react";
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
  FormDescription,
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
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';


const numberSchema = z.preprocess(
    (a) => (a === '' || a === undefined || a === null ? 0 : parseInt(String(a), 10)),
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
  sasaranBufus: numberSchema,
  sasaranBusu: numberSchema,
  sasaranBayi: numberSchema,
  sasaranDewasa: numberSchema,
  pengunjungBalita: numberSchema,
  pengunjungBumil: numberSchema,
  pengunjungRemaja: numberSchema,
  pengunjungLansia: numberSchema,
  pengunjungBufus: numberSchema,
  pengunjungBusu: numberSchema,
  pengunjungBayi: numberSchema,
  pengunjungDewasa: numberSchema,
  kegiatanFoto: z.any().optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface ActivityRecord extends ActivityFormValues {
  id: string;
  timestamp: string;
  totalSasaran: number;
  totalPengunjung: number;
  fotoUrl?: string;
}

const initialData: ActivityRecord[] = [
    {
      id: "1",
      timestamp: new Date().toISOString(),
      posyanduName: "Posyandu Melati 1",
      activityDate: new Date(),
      sasaranBalita: 10, sasaranBumil: 2, sasaranRemaja: 5, sasaranLansia: 1, sasaranBufus: 1, sasaranBusu: 1, sasaranBayi: 3, sasaranDewasa: 20,
      pengunjungBalita: 8, pengunjungBumil: 2, pengunjungRemaja: 3, pengunjungLansia: 1, pengunjungBufus: 1, pengunjungBusu: 1, pengunjungBayi: 3, pengunjungDewasa: 15,
      totalSasaran: 43,
      totalPengunjung: 34,
      fotoUrl: "https://placehold.co/600x400.png",
    },
];

export default function KegiatanPage() {
  const [activityData, setActivityData] = useState<ActivityRecord[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setActivityData(initialData);
  }, []);

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
        posyanduName: "",
        activityDate: new Date(),
        sasaranBalita: 0, sasaranBumil: 0, sasaranRemaja: 0, sasaranLansia: 0, sasaranBufus: 0, sasaranBusu: 0, sasaranBayi: 0, sasaranDewasa: 0,
        pengunjungBalita: 0, pengunjungBumil: 0, pengunjungRemaja: 0, pengunjungLansia: 0, pengunjungBufus: 0, pengunjungBusu: 0, pengunjungBayi: 0, pengunjungDewasa: 0,
    },
  });

  function onSubmit(data: ActivityFormValues) {
    const totalSasaran = Object.keys(data).filter(k => k.startsWith('sasaran')).reduce((acc, key) => acc + (data[key as keyof ActivityFormValues] as number || 0), 0);
    const totalPengunjung = Object.keys(data).filter(k => k.startsWith('pengunjung')).reduce((acc, key) => acc + (data[key as keyof ActivityFormValues] as number || 0), 0);
    
    const newRecord: ActivityRecord = {
      id: new Date().getTime().toString(),
      timestamp: new Date().toISOString(),
      ...data,
      totalSasaran,
      totalPengunjung,
      fotoUrl: previewImage || undefined,
    };
    
    setActivityData((prev) => [newRecord, ...prev]);
    form.reset();
    setPreviewImage(null);
    toast({
        title: "Sukses",
        description: "Data kegiatan berhasil disimpan.",
    });
  }

  function handleExport() {
    if (activityData.length === 0) {
      toast({
        variant: "destructive",
        title: "Gagal Ekspor",
        description: "Tidak ada data untuk diekspor.",
      });
      return;
    }

    const header1 = ['Nama Posyandu', 'Tanggal Kegiatan', 'Jumlah sasaran', '', '', '', '', '', '', '', '', 'Pengunjung', '', '', '', '', '', '', '', '', 'Foto Kegiatan'];
    const header2 = ['', '', 'Bayi', 'Balita', 'Bumil', 'Bufus', 'Busu', 'Remaja', 'Dewasa', 'Lansia', 'Total', 'Bayi', 'Balita', 'Bumil', 'Bufus', 'Busu', 'Remaja', 'Dewasa', 'Lansia', 'Total', ''];
    
    const dataForExport = activityData.map(item => {
      return [
        item.posyanduName,
        format(item.activityDate, 'yyyy-MM-dd'),
        item.sasaranBayi || 0,
        item.sasaranBalita || 0,
        item.sasaranBumil || 0,
        item.sasaranBufus || 0,
        item.sasaranBusu || 0,
        item.sasaranRemaja || 0,
        item.sasaranDewasa || 0,
        item.sasaranLansia || 0,
        item.totalSasaran,
        item.pengunjungBayi || 0,
        item.pengunjungBalita || 0,
        item.pengunjungBumil || 0,
        item.pengunjungBufus || 0,
        item.pengunjungBusu || 0,
        item.pengunjungRemaja || 0,
        item.pengunjungDewasa || 0,
        item.pengunjungLansia || 0,
        item.totalPengunjung,
        item.fotoUrl || ''
      ];
    });

    const finalData = [header1, header2, ...dataForExport];
    const worksheet = XLSX.utils.aoa_to_sheet(finalData);

    worksheet['!merges'] = [
      // Merge main headers vertically
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // Nama Posyandu
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // Tanggal Kegiatan
      { s: { r: 0, c: 20 }, e: { r: 1, c: 20 } }, // Foto Kegiatan
      // Merge group headers horizontally
      { s: { r: 0, c: 2 }, e: { r: 0, c: 10 } }, // Jumlah sasaran
      { s: { r: 0, c: 11 }, e: { r: 0, c: 19 } }, // Pengunjung
    ];
    
    // Set column widths
    worksheet["!cols"] = [
        { wch: 30 }, { wch: 15 },
        { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, // Sasaran
        { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, // Pengunjung
        { wch: 20 } // Foto
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kegiatan");
    XLSX.writeFile(workbook, "Data-Kegiatan-Posyandu.xlsx");

    toast({
      title: "Ekspor Berhasil",
      description: "Data kegiatan telah diunduh sebagai XLSX.",
    });
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">
              Laporan Kegiatan Posyandu
            </h1>
            <p className="text-muted-foreground">
              Catat dan kelola data kegiatan Posyandu.
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
                <CardTitle>Catat Kegiatan Baru</CardTitle>
                <CardDescription>
                  Isi formulir untuk melaporkan kegiatan baru.
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
                            <Input placeholder="Contoh: Posyandu Melati 1" {...field} />
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
                                    "w-full justify-start text-left font-normal",
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
                    <div>
                        <h3 className="mb-4 text-lg font-medium">Jumlah Sasaran</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="sasaranBayi" render={({ field }) => (<FormItem><FormLabel>Bayi</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="sasaranBalita" render={({ field }) => (<FormItem><FormLabel>Balita</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="sasaranBumil" render={({ field }) => (<FormItem><FormLabel>Bumil</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="sasaranBufus" render={({ field }) => (<FormItem><FormLabel>Bufus</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="sasaranBusu" render={({ field }) => (<FormItem><FormLabel>Busu</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="sasaranRemaja" render={({ field }) => (<FormItem><FormLabel>Remaja</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="sasaranDewasa" render={({ field }) => (<FormItem><FormLabel>Dewasa</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="sasaranLansia" render={({ field }) => (<FormItem><FormLabel>Lansia</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                        </div>
                    </div>
                     <Separator />
                     <div>
                        <h3 className="mb-4 text-lg font-medium">Pengunjung</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="pengunjungBayi" render={({ field }) => (<FormItem><FormLabel>Bayi</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="pengunjungBalita" render={({ field }) => (<FormItem><FormLabel>Balita</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="pengunjungBumil" render={({ field }) => (<FormItem><FormLabel>Bumil</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="pengunjungBufus" render={({ field }) => (<FormItem><FormLabel>Bufus</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="pengunjungBusu" render={({ field }) => (<FormItem><FormLabel>Busu</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="pengunjungRemaja" render={({ field }) => (<FormItem><FormLabel>Remaja</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="pengunjungDewasa" render={({ field }) => (<FormItem><FormLabel>Dewasa</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name="pengunjungLansia" render={({ field }) => (<FormItem><FormLabel>Lansia</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl></FormItem>)} />
                        </div>
                    </div>
                     <Separator />
                     <FormField
                        control={form.control}
                        name="kegiatanFoto"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Foto Kegiatan</FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="file-upload"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setPreviewImage(reader.result as string);
                                                field.onChange(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                 <label htmlFor="file-upload" className="cursor-pointer">
                                    <Button type="button" variant="outline">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Pilih Foto
                                    </Button>
                                </label>
                                {previewImage && <Image src={previewImage} alt="Preview" width={80} height={80} className="rounded-md object-cover" />}
                                </div>
                            </FormControl>
                            <FormDescription>Unggah foto dokumentasi kegiatan.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full">
                      Simpan Kegiatan
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Data Kegiatan</CardTitle>
                <CardDescription>
                  Daftar semua kegiatan yang tercatat.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Nama Posyandu</TableHead>
                        <TableHead>Tgl Kegiatan</TableHead>
                        <TableHead>Total Sasaran</TableHead>
                        <TableHead>Total Pengunjung</TableHead>
                        <TableHead>Foto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isClient && activityData.length > 0 ? (
                        activityData.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(record.timestamp), "Pp", { locale: id })}
                            </TableCell>
                            <TableCell>{record.posyanduName}</TableCell>
                            <TableCell>
                              {format(record.activityDate, "PPP", { locale: id })}
                            </TableCell>
                            <TableCell className="text-center">{record.totalSasaran}</TableCell>
                             <TableCell className="text-center">{record.totalPengunjung}</TableCell>
                            <TableCell>
                                {record.fotoUrl && <Image src={record.fotoUrl} alt="Foto Kegiatan" width={60} height={60} className="rounded-md object-cover" data-ai-hint="activity event" />}
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
      <Toaster />
    </>
  );
}

    