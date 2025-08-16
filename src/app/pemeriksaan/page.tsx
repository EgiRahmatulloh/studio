'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, PlusCircle, Search } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { calculateZScore, determineStuntingStatus, determineWeightStatus, getAgeInMonths } from '@/lib/stuntingutilis';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  visitorId: z.string({
    required_error: "Pengunjung harus dipilih.",
  }),
  height: z.coerce.number({
    required_error: "Tinggi badan harus diisi.",
    invalid_type_error: "Tinggi badan harus berupa angka.",
  }).positive({
    message: "Tinggi badan harus lebih dari 0.",
  }),
  weight: z.coerce.number({
    required_error: "Berat badan harus diisi.",
    invalid_type_error: "Berat badan harus berupa angka.",
  }).positive({
    message: "Berat badan harus lebih dari 0.",
  }),
  notes: z.string().optional(),
});

type ExaminationFormValues = z.infer<typeof formSchema>;

interface VisitorRecord {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  category: string;
}

interface ExaminationRecord {
  id: string;
  createdAt: string;
  height: number;
  weight: number;
  notes?: string;
  visitorId: string;
  visitor: VisitorRecord;
  stuntingStatus?: string;
  weightStatus?: string;
}

export default function PemeriksaanPage() {
  const [examinationData, setExaminationData] = useState<ExaminationRecord[]>([]);
  const [visitorData, setVisitorData] = useState<VisitorRecord[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ExaminationRecord | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ExaminationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      height: undefined,
      weight: undefined,
      notes: '',
    },
  });

  useEffect(() => {
    setIsClient(true);
    fetchExaminations();
    fetchVisitors();
  }, []);

  const fetchExaminations = async (start?: Date, end?: Date) => {
    try {
      const params = new URLSearchParams();
      if (start) params.append("startDate", start.toISOString());
      if (end) params.append("endDate", end.toISOString());

      const response = await fetch(`/api/pemeriksaan?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch examinations");
      }
      const data: ExaminationRecord[] = await response.json();
      
      // Menghitung status stunting dan berat badan untuk setiap data pemeriksaan
      const enhancedData = data.map(record => {
        // Hanya hitung z-score untuk kategori bayi dan balita
        const isEligibleForZScore = record.visitor.category.toLowerCase().includes('bayi') || 
                                   record.visitor.category.toLowerCase().includes('balita');
        
        if (!isEligibleForZScore) {
          return {
            ...record,
            stuntingStatus: 'Tidak Berlaku',
            weightStatus: 'Tidak Berlaku'
          };
        }
        
        const birthDate = new Date(record.visitor.birthDate);
        const examDate = new Date(record.createdAt);
        const ageInMonths = getAgeInMonths(birthDate, examDate);
        
        // Menentukan tipe data berdasarkan jenis kelamin
        const heightType = record.visitor.gender.toLowerCase().includes('laki') || 
                          record.visitor.gender.toLowerCase() === 'male' ? 
                          'length_for_age_boys' : 'length_for_age_girls';
        
        const weightType = record.visitor.gender.toLowerCase().includes('laki') || 
                          record.visitor.gender.toLowerCase() === 'male' ? 
                          'weight_for_age_boys' : 'weight_for_age_girls';
        
        // Menghitung Z-score untuk tinggi dan berat badan
        const heightZScore = calculateZScore(record.height, ageInMonths, record.visitor.gender, heightType as any);
        const weightZScore = calculateZScore(record.weight, ageInMonths, record.visitor.gender, weightType as any);
        
        // Menentukan status berdasarkan Z-score
        const stuntingStatus = determineStuntingStatus(heightZScore);
        const weightStatus = determineWeightStatus(weightZScore);
        
        return {
          ...record,
          stuntingStatus,
          weightStatus
        };
      });
      
      setExaminationData(enhancedData);
    } catch (error: any) {
      console.error("Error fetching examinations:", error);
      toast({
        variant: "destructive",
        title: "Gagal Memuat Data",
        description:
          error.message || "Terjadi kesalahan saat memuat data pemeriksaan.",
      });
    }
  };

  const fetchVisitors = async () => {
    try {
      const response = await fetch('/api/pendaftaran');
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
        title: "Gagal Memuat Data Pengunjung",
        description:
          error.message || "Terjadi kesalahan saat memuat data pengunjung.",
      });
    }
  };

  const handleDateFilter = () => {
    fetchExaminations(startDate, endDate);
  };

  const handleVisitorSelect = (visitorId: string) => {
    const visitor = visitorData.find(v => v.id === visitorId);
    setSelectedVisitor(visitor || null);
    form.setValue('visitorId', visitorId);
  };

  async function onSubmit(data: ExaminationFormValues) {
    if (!user?.posyanduName) {
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan Data",
        description: "Nama Posyandu tidak ditemukan. Harap login ulang.",
      });
      return;
    }

    const payload = {
      ...data,
      posyanduName: user.posyanduName,
    };

    try {
      const response = await fetch("/api/pemeriksaan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save examination");
      }

      const resultRecord: ExaminationRecord = await response.json();
      
      // Menghitung status stunting dan berat badan untuk data baru
      if (selectedVisitor) {
        // Hanya hitung z-score untuk kategori bayi dan balita
        const isEligibleForZScore = selectedVisitor.category.toLowerCase().includes('bayi') || 
                                   selectedVisitor.category.toLowerCase().includes('balita');
        
        if (!isEligibleForZScore) {
          resultRecord.stuntingStatus = 'Tidak Berlaku';
          resultRecord.weightStatus = 'Tidak Berlaku';
        } else {
          const birthDate = new Date(selectedVisitor.birthDate);
          const examDate = new Date(resultRecord.createdAt);
          const ageInMonths = getAgeInMonths(birthDate, examDate);
          
          // Menentukan tipe data berdasarkan jenis kelamin
          const heightType = selectedVisitor.gender.toLowerCase().includes('laki') || 
                            selectedVisitor.gender.toLowerCase() === 'male' ? 
                            'length_for_age_boys' : 'length_for_age_girls';
          
          const weightType = selectedVisitor.gender.toLowerCase().includes('laki') || 
                            selectedVisitor.gender.toLowerCase() === 'male' ? 
                            'weight_for_age_boys' : 'weight_for_age_girls';
          
          // Menghitung Z-score untuk tinggi dan berat badan
          const heightZScore = calculateZScore(resultRecord.height, ageInMonths, selectedVisitor.gender, heightType as any);
          const weightZScore = calculateZScore(resultRecord.weight, ageInMonths, selectedVisitor.gender, weightType as any);
          
          // Menentukan status berdasarkan Z-score
          const stuntingStatus = determineStuntingStatus(heightZScore);
          const weightStatus = determineWeightStatus(weightZScore);
          
          // Menambahkan status ke data hasil
          resultRecord.stuntingStatus = stuntingStatus;
          resultRecord.weightStatus = weightStatus;
        }
      }
      
      setExaminationData((prev) => [resultRecord, ...prev]);

      form.reset();
      setIsCreateDialogOpen(false);
      setSelectedVisitor(null);
      toast({
        title: "Sukses",
        description: "Data pemeriksaan berhasil disimpan.",
      });
    } catch (error: any) {
      console.error("Error saving examination:", error);
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan Data",
        description:
          error.message || "Terjadi kesalahan saat menyimpan data pemeriksaan.",
      });
    }
  }

  const renderForm = () => (
    <Form {...form}>
      <form id="create-pemeriksaan-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="visitorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pengunjung</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleVisitorSelect(value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pengunjung" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {visitorData.map((visitor) => (
                      <SelectItem key={visitor.id} value={visitor.id}>
                        {visitor.name} - {visitor.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedVisitor && (
            <div className="rounded-md border p-4 bg-slate-50">
              <h3 className="font-medium mb-2">Data Pengunjung:</h3>
              <p><span className="font-medium">Nama:</span> {selectedVisitor.name}</p>
              <p><span className="font-medium">Tanggal Lahir:</span> {format(new Date(selectedVisitor.birthDate), 'dd MMMM yyyy', { locale: id })}</p>
              <p><span className="font-medium">Jenis Kelamin:</span> {selectedVisitor.gender}</p>
              <p><span className="font-medium">Kategori:</span> {selectedVisitor.category}</p>
              
              {form.watch('height') && form.watch('weight') && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h3 className="font-medium mb-2">Hasil Perhitungan:</h3>
                  {(() => {
                    const height = parseFloat(form.watch('height') as unknown as string);
                    const weight = parseFloat(form.watch('weight') as unknown as string);
                    
                    if (isNaN(height) || isNaN(weight)) return null;
                    
                    // Hanya hitung z-score untuk kategori bayi dan balita
                    const isEligibleForZScore = selectedVisitor.category.toLowerCase().includes('bayi') || 
                                               selectedVisitor.category.toLowerCase().includes('balita');
                    
                    if (!isEligibleForZScore) {
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p><span className="font-medium">Status TB:</span></p>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Tidak Berlaku
                              </span>
                            </div>
                            <div>
                              <p><span className="font-medium">Status BB:</span></p>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Tidak Berlaku
                              </span>
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">*Perhitungan z-score hanya berlaku untuk kategori bayi dan balita</p>
                        </>
                      );
                    }
                    
                    const birthDate = new Date(selectedVisitor.birthDate);
                    const examDate = new Date();
                    const ageInMonths = getAgeInMonths(birthDate, examDate);
                    
                    // Menentukan tipe data berdasarkan jenis kelamin
                    const heightType = selectedVisitor.gender.toLowerCase().includes('laki') || 
                                      selectedVisitor.gender.toLowerCase() === 'male' ? 
                                      'length_for_age_boys' : 'length_for_age_girls';
                    
                    const weightType = selectedVisitor.gender.toLowerCase().includes('laki') || 
                                      selectedVisitor.gender.toLowerCase() === 'male' ? 
                                      'weight_for_age_boys' : 'weight_for_age_girls';
                    
                    // Menghitung Z-score untuk tinggi dan berat badan
                    const heightZScore = calculateZScore(height, ageInMonths, selectedVisitor.gender, heightType as any);
                    const weightZScore = calculateZScore(weight, ageInMonths, selectedVisitor.gender, weightType as any);
                    
                    // Menentukan status berdasarkan Z-score
                    const stuntingStatus = determineStuntingStatus(heightZScore);
                    const weightStatus = determineWeightStatus(weightZScore);
                    
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p><span className="font-medium">Status TB:</span></p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${stuntingStatus === 'Normal' ? 'bg-green-100 text-green-800' : stuntingStatus === 'Pendek' ? 'bg-yellow-100 text-yellow-800' : stuntingStatus === 'Sangat Pendek' ? 'bg-red-100 text-red-800' : stuntingStatus === 'Tinggi' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                              {stuntingStatus}
                            </span>
                          </div>
                          <div>
                            <p><span className="font-medium">Status BB:</span></p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${weightStatus === 'Berat Normal' ? 'bg-green-100 text-green-800' : weightStatus === 'Kurus' ? 'bg-yellow-100 text-yellow-800' : weightStatus === 'Sangat Kurus' ? 'bg-red-100 text-red-800' : weightStatus === 'Berat Lebih' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                              {weightStatus}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">*Berdasarkan standar WHO untuk usia {ageInMonths} bulan</p>
                      </>
                    );
                  })()
                }
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tinggi Badan (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Masukkan tinggi badan"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Berat Badan (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Masukkan berat badan"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catatan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Masukkan catatan pemeriksaan (opsional)"
                    {...field}
                  />
                </FormControl>
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
              Pemeriksaan Pengunjung
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[#5D1451] hover:bg-[#4A1040] text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Pemeriksaan
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
              <PopoverContent className="w-auto p-0">
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
                  {endDate ? format(endDate, "PPP", { locale: id }) : <span>Tanggal Akhir</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button onClick={handleDateFilter} className="bg-[#5D1451] hover:bg-[#4A1040] text-white">
              <Search className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <Dialog open={selectedRecord !== null} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Detail Status Pemeriksaan</DialogTitle>
              <DialogDescription>
                Detail status tinggi badan dan berat badan berdasarkan standar WHO.
              </DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nama</p>
                    <p className="text-base">{selectedRecord.visitor.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tanggal Pemeriksaan</p>
                    <p className="text-base">{format(new Date(selectedRecord.createdAt), 'dd MMMM yyyy', { locale: id })}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                   <h3 className="font-medium mb-3">Status Berdasarkan WHO</h3>
                   <div className="space-y-3">
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium">Tinggi Badan ({selectedRecord.height} cm):</span>
                       <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                         selectedRecord.stuntingStatus === 'Normal' ? 'bg-green-100 text-green-800' : 
                         selectedRecord.stuntingStatus === 'Pendek' ? 'bg-yellow-100 text-yellow-800' : 
                         selectedRecord.stuntingStatus === 'Sangat Pendek' ? 'bg-red-100 text-red-800' : 
                         selectedRecord.stuntingStatus === 'Tinggi' ? 'bg-blue-100 text-blue-800' : 
                         selectedRecord.stuntingStatus === 'Tidak Berlaku' ? 'bg-gray-100 text-gray-800' : 
                         'bg-gray-100 text-gray-800'
                       }`}>
                         {selectedRecord.stuntingStatus || 'Tidak Diketahui'}
                       </span>
                     </div>
                     
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium">Berat Badan ({selectedRecord.weight} kg):</span>
                       <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                         selectedRecord.weightStatus === 'Berat Normal' ? 'bg-green-100 text-green-800' : 
                         selectedRecord.weightStatus === 'Kurus' ? 'bg-yellow-100 text-yellow-800' : 
                         selectedRecord.weightStatus === 'Sangat Kurus' ? 'bg-red-100 text-red-800' : 
                         selectedRecord.weightStatus === 'Berat Lebih' ? 'bg-blue-100 text-blue-800' : 
                         selectedRecord.weightStatus === 'Tidak Berlaku' ? 'bg-gray-100 text-gray-800' : 
                         'bg-gray-100 text-gray-800'
                       }`}>
                         {selectedRecord.weightStatus || 'Tidak Diketahui'}
                       </span>
                     </div>
                   </div>
                 </div>

                {(() => {
                  const isEligibleForZScore = selectedRecord.visitor.category.toLowerCase().includes('bayi') || 
                                             selectedRecord.visitor.category.toLowerCase().includes('balita');
                  
                  if (!isEligibleForZScore) {
                    return (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">
                          *Perhitungan z-score hanya berlaku untuk kategori bayi dan balita
                        </p>
                      </div>
                    );
                  }
                  
                  const birthDate = new Date(selectedRecord.visitor.birthDate);
                  const examDate = new Date(selectedRecord.createdAt);
                  const ageInMonths = getAgeInMonths(birthDate, examDate);
                  return (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-700">
                        *Berdasarkan standar WHO untuk usia {ageInMonths} bulan ({selectedRecord.visitor.gender})
                      </p>
                    </div>
                  );
                })()}

                {selectedRecord.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Catatan</p>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedRecord.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => setSelectedRecord(null)}
                className="bg-[#5D1451] hover:bg-[#4A1040] text-white"
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Tambah Pemeriksaan Baru</DialogTitle>
              <DialogDescription>
                Isi formulir untuk menambahkan data pemeriksaan baru.
              </DialogDescription>
            </DialogHeader>
            {renderForm()}
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
                form="create-pemeriksaan-form"
                className="bg-[#5D1451] hover:bg-[#4A1040] text-white"
              >
                Simpan Pemeriksaan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-5">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Data Pemeriksaan</CardTitle>
                <CardDescription>
                  Daftar semua pemeriksaan yang telah dilakukan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Kategori</TableHead>

                        <TableHead>Status</TableHead>
                        <TableHead>Catatan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {examinationData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Tidak ada data pemeriksaan
                          </TableCell>
                        </TableRow>
                      ) : (
                        examinationData.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              {format(new Date(record.createdAt), 'dd MMM yyyy', { locale: id })}
                            </TableCell>
                            <TableCell>{record.visitor.name}</TableCell>
                            <TableCell>{record.visitor.category}</TableCell>

                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRecord(record)}
                                className="text-xs"
                              >
                                Lihat Detail
                              </Button>
                            </TableCell>
                            <TableCell>{record.notes || '-'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}