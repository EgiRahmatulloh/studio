"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, UserPlus, FilePlus } from "lucide-react";

// Daftar nama posyandu
const POSYANDU_NAMES = [
  "DAHLIA",
  "KENANGA I", 
  "MAWAR MERAH",
  "CEMPAKA",
  "KENANGA II",
  "MELATI"
];

interface User {
  id: string;
  email: string;
  fullName?: string | null;
  role: "ADMIN" | "USER";
  permissions: string[];
  posyanduName?: string | null;
}

export default function AdminPage() {
  const { user: currentUser, hasPermission, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "USER" as "ADMIN" | "USER",
    posyanduName: "",
  });

  const [editUser, setEditUser] = useState({
    id: "",
    email: "",
    fullName: "",
    posyanduName: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (!isAdmin()) {
      router.push("/");
      return;
    }

    fetchData();
  }, [currentUser, isAdmin, router]);

  const getAuthHeader = () => {
    const token = localStorage.getItem("auth-token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const [usersRes, permissionsRes] = await Promise.all([
        fetch("/api/admin/users", { headers }),
        fetch("/api/admin/permissions", { headers }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      } else {
        const errorData = await usersRes.json();
        toast({
          title: "Error",
          description: errorData.error,
          variant: "destructive",
        });
      }

      if (permissionsRes.ok) {
        const permissionsData = await permissionsRes.json();
        setPermissions(permissionsData.permissions.map((p: any) => p.name));
      } else {
        const errorData = await permissionsRes.json();
        toast({
          title: "Error",
          description: errorData.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "User berhasil dibuat",
        });
        setCreateDialogOpen(false);
        setNewUser({
          email: "",
          password: "",
          fullName: "",
          role: "USER",
          posyanduName: "",
        });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan server",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "User berhasil dihapus",
        });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan server",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      id: user.id,
      email: user.email,
      fullName: user.fullName || "",
      posyanduName: user.posyanduName || "",
      permissions: user.permissions,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({
          fullName: editUser.fullName,
          posyanduName: editUser.posyanduName,
          permissions: editUser.permissions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "User berhasil diupdate",
        });
        setEditDialogOpen(false);
        setSelectedUser(null);
        fetchData();
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan server",
        variant: "destructive",
      });
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setEditUser((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter((p) => p !== permission),
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
        <div className="w-full sm:w-auto">
          <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-[#5D1451] hover:bg-[#4A1040] text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Tambah User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tambah User Baru</DialogTitle>
                <DialogDescription>
                  Buat akun user baru dengan peran dan izin yang sesuai.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={newUser.fullName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, fullName: e.target.value })
                    }
                    placeholder="Contoh: John Doe"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="posyanduName">Nama Posyandu</Label>
                  <Select
                    value={newUser.posyanduName}
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, posyanduName: value })
                    }q
                  >
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
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: "ADMIN" | "USER") =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      {/* Admin tidak bisa membuat admin lain untuk saat ini */}
                      {/* <SelectItem value="ADMIN">Admin</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#5D1451] hover:bg-[#4A1040] text-white"
                >
                  Buat User
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manajemen User</CardTitle>
          <CardDescription>
            Kelola user, peran, dan izin akses mereka.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px] p-2 sm:p-4">Email</TableHead>
                  <TableHead className="min-w-[150px] p-2 sm:p-4 hidden md:table-cell">Nama Lengkap</TableHead>
                  <TableHead className="min-w-[150px] p-2 sm:p-4 hidden lg:table-cell">Nama Posyandu</TableHead>
                  <TableHead className="min-w-[80px] p-2 sm:p-4">Role</TableHead>
                  <TableHead className="min-w-[200px] p-2 sm:p-4 hidden md:table-cell">Permissions</TableHead>
                  <TableHead className="min-w-[100px] p-2 sm:p-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-xs sm:text-sm p-2 sm:p-4">{user.email}</TableCell>
                    <TableCell className="text-xs sm:text-sm p-2 sm:p-4 hidden md:table-cell">{user.fullName || "-"}</TableCell>
                    <TableCell className="text-xs sm:text-sm p-2 sm:p-4 hidden lg:table-cell">{user.posyanduName || "-"}</TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <Badge
                        variant={user.role === "ADMIN" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {user.permissions.map((permission) => (
                          <Badge
                            key={permission}
                            variant="outline"
                            className="text-xs"
                          >
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <div className="flex space-x-1 sm:space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(user)}
                          className="border-[#5D1451] text-[#5D1451] hover:bg-[#5D1451] hover:text-white p-1 h-auto sm:p-2"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        {currentUser?.id !== user.id && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 h-auto sm:p-2"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.email}</DialogTitle>
            <DialogDescription>
              Ubah nama posyandu dan izin akses untuk user ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editFullName">Nama Lengkap</Label>
              <Input
                id="editFullName"
                type="text"
                value={editUser.fullName}
                onChange={(e) =>
                  setEditUser({ ...editUser, fullName: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editPosyanduName">Nama Posyandu</Label>
              <Select
                value={editUser.posyanduName}
                onValueChange={(value) =>
                  setEditUser({ ...editUser, posyanduName: value })
                }
              >
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
            </div>

            <div className="grid gap-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto rounded-md border p-2">
                {permissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${permission}`}
                      checked={editUser.permissions.includes(permission)}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(permission, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`edit-${permission}`}
                      className="font-normal"
                    >
                      {permission}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#5D1451] hover:bg-[#4A1040] text-white"
            >
              Simpan Perubahan
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
