"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Child {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  posyanduName: string;
  stuntingRecords: StuntingRecord[];
}

interface StuntingRecord {
  id: string;
  height: number;
  weight: number;
  headCircumference?: number | null;
  armCircumference?: number | null;
  weightForAgeZScore?: number | null;
  heightForAgeZScore?: number | null;
  weightForHeightZScore?: number | null;
  measurementDate: string;
}

export default function ChildDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedChild, setEditedChild] = useState<Partial<Child>>({});
  const [newStuntingRecord, setNewStuntingRecord] = useState({
    height: "",
    weight: "",
    headCircumference: "",
    armCircumference: "",
    measurementDate: "",
    weightForAgeZScore: "",
    heightForAgeZScore: "",
    weightForHeightZScore: "",
  });

  useEffect(() => {
    if (id) {
      fetchChildDetails();
    }
  }, [id]);

  const fetchChildDetails = async () => {
    const res = await fetch(`/api/children/${id}`);
    const data = await res.json();
    setChild(data);
    setEditedChild(data);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedChild((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateChild = async () => {
    await fetch(`/api/children/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedChild),
    });
    setIsEditing(false);
    fetchChildDetails();
  };

  const handleDeleteChild = async () => {
    await fetch(`/api/children/${id}`, {
      method: "DELETE",
    });
    router.push("/children");
  };

  const handleStuntingRecordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStuntingRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStuntingRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/stunting-records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ childId: id, ...newStuntingRecord }),
    });
    setNewStuntingRecord({ height: "", weight: "", headCircumference: "", armCircumference: "", measurementDate: "", weightForAgeZScore: "", heightForAgeZScore: "", weightForHeightZScore: "" });
    fetchChildDetails();
  };

  const handleDeleteStuntingRecord = async (recordId: string) => {
    await fetch(`/api/stunting-records/${recordId}`, {
      method: "DELETE",
    });
    fetchChildDetails();
  };

  if (!child) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Detail Anak: {child.fullName}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informasi Anak</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={editedChild.fullName || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={editedChild.dateOfBirth ? format(new Date(editedChild.dateOfBirth), "yyyy-MM-dd") : ""}
                  onChange={handleEditChange}
                />
              </div>
              <div>
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <Select
                  onValueChange={(value) => setEditedChild((prev) => ({ ...prev, gender: value }))}
                  value={editedChild.gender || ""}
                >
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="posyanduName">Nama Posyandu</Label>
                <Input
                  id="posyanduName"
                  name="posyanduName"
                  value={editedChild.posyanduName || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button onClick={handleUpdateChild}>Simpan</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Batal</Button>
              </div>
            </div>
          ) : (
            <div>
              <p><strong>Nama Lengkap:</strong> {child.fullName}</p>
              <p><strong>Tanggal Lahir:</strong> {format(new Date(child.dateOfBirth), "dd MMMM yyyy")}</p>
              <p><strong>Jenis Kelamin:</strong> {child.gender}</p>
              <p><strong>Nama Posyandu:</strong> {child.posyanduName}</p>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Hapus Anak</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Ini akan menghapus anak ini dan semua catatan stunting terkait secara permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteChild}>Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tambah Catatan Stunting Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddStuntingRecord} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="height">Tinggi Badan / Panjang Badan (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                step="0.1"
                value={newStuntingRecord.height}
                onChange={handleStuntingRecordChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="weight">Berat Badan (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                value={newStuntingRecord.weight}
                onChange={handleStuntingRecordChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="headCircumference">Lingkar Kepala (cm) (Opsional)</Label>
              <Input
                id="headCircumference"
                name="headCircumference"
                type="number"
                step="0.1"
                value={newStuntingRecord.headCircumference}
                onChange={handleStuntingRecordChange}
              />
            </div>
            <div>
              <Label htmlFor="armCircumference">Lingkar Lengan Atas (LILA) (cm) (Opsional)</Label>
              <Input
                id="armCircumference"
                name="armCircumference"
                type="number"
                step="0.1"
                value={newStuntingRecord.armCircumference}
                onChange={handleStuntingRecordChange}
              />
            </div>
            <div>
              <Label htmlFor="measurementDate">Tanggal Pengukuran</Label>
              <Input
                id="measurementDate"
                name="measurementDate"
                type="date"
                value={newStuntingRecord.measurementDate}
                onChange={handleStuntingRecordChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="weightForAgeZScore">BB/U Z-score (Opsional)</Label>
              <Input
                id="weightForAgeZScore"
                name="weightForAgeZScore"
                type="number"
                step="0.01"
                value={newStuntingRecord.weightForAgeZScore}
                onChange={handleStuntingRecordChange}
              />
            </div>
            <div>
              <Label htmlFor="heightForAgeZScore">TB/U Z-score (Opsional)</Label>
              <Input
                id="heightForAgeZScore"
                name="heightForAgeZScore"
                type="number"
                step="0.01"
                value={newStuntingRecord.heightForAgeZScore}
                onChange={handleStuntingRecordChange}
              />
            </div>
            <div>
              <Label htmlFor="weightForHeightZScore">BB/TB Z-score (Opsional)</Label>
              <Input
                id="weightForHeightZScore"
                name="weightForHeightZScore"
                type="number"
                step="0.01"
                value={newStuntingRecord.weightForHeightZScore}
                onChange={handleStuntingRecordChange}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <Button type="submit">Tambah Catatan</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Catatan Stunting</CardTitle>
        </CardHeader>
        <CardContent>
          {child.stuntingRecords.length === 0 ? (
            <p>Belum ada catatan stunting untuk anak ini.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal Pengukuran</TableHead>
                  <TableHead>Tinggi Badan / Panjang Badan (cm)</TableHead>
                  <TableHead>Berat Badan (kg)</TableHead>
                  <TableHead>Lingkar Kepala (cm)</TableHead>
                  <TableHead>LILA (cm)</TableHead>
                  <TableHead>BB/U Z-score</TableHead>
                  <TableHead>TB/U Z-score</TableHead>
                  <TableHead>BB/TB Z-score</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {child.stuntingRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.measurementDate), "dd MMMM yyyy")}</TableCell>
                    <TableCell>{record.height}</TableCell>
                    <TableCell>{record.weight}</TableCell>
                    <TableCell>{record.headCircumference ?? '-'}</TableCell>
                    <TableCell>{record.armCircumference ?? '-'}</TableCell>
                    <TableCell>{record.weightForAgeZScore ?? '-'}</TableCell>
                    <TableCell>{record.heightForAgeZScore ?? '-'}</TableCell>
                    <TableCell>{record.weightForHeightZScore ?? '-'}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">Hapus</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus catatan stunting ini secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteStuntingRecord(record.id)}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
