
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, UserPlus, FilePlus } from 'lucide-react';

interface User {
  id: string;
  email: string;
  fullName?: string | null;
  role: 'ADMIN' | 'USER';
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
    email: '',
    password: '',
    fullName: '',
    role: 'USER' as 'ADMIN' | 'USER',
    posyanduName: '',
  });
  
  const [editUser, setEditUser] = useState({
    id: '',
    email: '',
    fullName: '',
    posyanduName: '',
    permissions: [] as string[],
  });

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    if (!isAdmin()) {
      router.push('/');
      return;
    }
    
    fetchData();
  }, [currentUser, isAdmin, router]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('auth-token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const [usersRes, permissionsRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/permissions', { headers }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      } else {
         const errorData = await usersRes.json();
         toast({ title: 'Error', description: errorData.error, variant: 'destructive' });
      }

      if (permissionsRes.ok) {
        const permissionsData = await permissionsRes.json();
        setPermissions(permissionsData.permissions.map((p: any) => p.name));
      } else {
        const errorData = await permissionsRes.json();
        toast({ title: 'Error', description: errorData.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'User berhasil dibuat',
        });
        setCreateDialogOpen(false);
        setNewUser({ email: '', password: '', fullName: '', role: 'USER', posyanduName: '' });
        fetchData();
      } else {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan server',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'User berhasil dihapus',
        });
        fetchData();
      } else {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan server',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      id: user.id,
      email: user.email,
      fullName: user.fullName || '',
      posyanduName: user.posyanduName || '',
      permissions: user.permissions,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ 
          fullName: editUser.fullName,
          posyanduName: editUser.posyanduName,
          permissions: editUser.permissions 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'User berhasil diupdate',
        });
        setEditDialogOpen(false);
        setSelectedUser(null);
        fetchData();
      } else {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan server',
        variant: 'destructive',
      });
    }
  };
  
  const handlePermissionChange = (permission: string, checked: boolean) => {
    setEditUser(prev => ({
        ...prev,
        permissions: checked 
            ? [...prev.permissions, permission]
            : prev.permissions.filter(p => p !== permission)
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="space-x-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Tambah User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah User Baru</DialogTitle>
                  <DialogDescription>
                    Buat akun user baru dengan peran dan izin yang sesuai.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input id="fullName" type="text" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} placeholder="Contoh: John Doe" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="posyanduName">Nama Posyandu</Label>
                    <Input id="posyanduName" type="text" value={newUser.posyanduName} onChange={(e) => setNewUser({ ...newUser, posyanduName: e.target.value })} placeholder="Contoh: Posyandu Melati 1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value: 'ADMIN' | 'USER') => setNewUser({ ...newUser, role: value })}>
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
                  <Button type="submit" className="w-full">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Nama Posyandu</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.fullName || '-'}</TableCell>
                  <TableCell>{user.posyanduName || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {user.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {currentUser?.id !== user.id && (
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.email}</DialogTitle>
            <DialogDescription>
              Ubah nama posyandu dan izin akses untuk user ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="editFullName">Nama Lengkap</Label>
                <Input id="editFullName" type="text" value={editUser.fullName} onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="editPosyanduName">Nama Posyandu</Label>
                <Input id="editPosyanduName" type="text" value={editUser.posyanduName} onChange={(e) => setEditUser({ ...editUser, posyanduName: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto rounded-md border p-2">
                {permissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${permission}`}
                      checked={editUser.permissions.includes(permission)}
                      onCheckedChange={(checked) => handlePermissionChange(permission, !!checked)}
                    />
                    <Label htmlFor={`edit-${permission}`} className="font-normal">{permission}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full">
              Simpan Perubahan
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
