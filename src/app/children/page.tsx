"use client";

import { useState, useEffect } from "react";
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
import Link from "next/link";

interface Child {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  posyanduName: string;
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [newChild, setNewChild] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    posyanduName: "",
  });

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    const res = await fetch("/api/children");
    const data = await res.json();
    setChildren(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewChild((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/children", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newChild),
    });
    setNewChild({ fullName: "", dateOfBirth: "", gender: "", posyanduName: "" });
    fetchChildren();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manajemen Data Anak</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tambah Anak Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddChild} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                name="fullName"
                value={newChild.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={newChild.dateOfBirth}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="gender">Jenis Kelamin</Label>
              <Select
                onValueChange={(value) => setNewChild((prev) => ({ ...prev, gender: value }))}
                value={newChild.gender}
                required
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
                value={newChild.posyanduName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Tambah Anak</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Anak</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Tanggal Lahir</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>Posyandu</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {children.map((child) => (
                <TableRow key={child.id}>
                  <TableCell>{child.fullName}</TableCell>
                  <TableCell>{format(new Date(child.dateOfBirth), "dd MMMM yyyy")}</TableCell>
                  <TableCell>{child.gender}</TableCell>
                  <TableCell>{child.posyanduName}</TableCell>
                  <TableCell>
                    <Link href={`/children/${child.id}`} passHref>
                      <Button variant="link">Lihat Detail</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
