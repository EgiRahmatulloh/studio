# Sistem Role-Based Access Control (RBAC)

Sistem aplikasi dengan dua jenis peran utama: **Admin** dan **User** yang telah berhasil diimplementasikan.

## 🔐 Fitur Utama

### Admin
- ✅ Dapat membuat, mengedit, dan menghapus akun user
- ✅ Dapat mengatur izin fitur (feature permissions) untuk setiap user secara individual
- ✅ Dapat melihat daftar user beserta detail izin akses mereka
- ✅ Akses penuh ke semua fitur aplikasi
- ✅ Panel admin khusus untuk manajemen sistem

### User
- ✅ Hanya dapat mengakses fitur yang telah diaktifkan atau diizinkan oleh admin
- ✅ Tidak memiliki akses ke panel manajemen user atau pengaturan izin
- ✅ Dashboard personal dengan informasi akun dan permissions

## 🏗️ Struktur Sistem

### Database Schema
```prisma
model User {
  id          String       @id @default(uuid())
  email       String       @unique
  password    String
  role        Role         @default(USER)
  permissions Permission[]
}

model Permission {
  id    String @id @default(uuid())
  name  String @unique
  users User[]
}

enum Role {
  ADMIN
  USER
}
```

### API Endpoints

#### Autentikasi
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Registrasi user baru
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Informasi user yang sedang login

#### Admin (Hanya untuk Admin)
- `GET /api/admin/users` - Daftar semua user
- `POST /api/admin/users` - Buat user baru
- `GET /api/admin/users/[id]` - Detail user
- `PUT /api/admin/users/[id]` - Update permissions user
- `DELETE /api/admin/users/[id]` - Hapus user
- `GET /api/admin/permissions` - Daftar semua permissions
- `POST /api/admin/permissions` - Buat permission baru

## 🚀 Cara Menjalankan

### 1. Setup Database
```bash
# Jalankan migrasi database
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed data awal (admin dan user demo)
npm run db:seed
```

### 2. Environment Variables
Salin `.env.example` ke `.env` dan sesuaikan:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-super-secret-jwt-key-here"
```

### 3. Jalankan Aplikasi
```bash
npm run dev
```

## 👤 Akun Default

Setelah menjalankan seed script, tersedia akun default:

### Admin
- **Password**: `a- **Email**: `admin@posyandu.com`
dmin123`
- **Akses**: Semua fitur + panel admin

### User Demo
- **Email**: `user@posyandu.com`
- **Password**: `user123`
- **Permissions**: `view_kehadiran`, `view_kegiatan`

## 🔧 Permissions Default

Sistem dilengkapi dengan permissions berikut:
- `view_kehadiran` - Melihat data kehadiran
- `create_kehadiran` - Membuat data kehadiran
- `edit_kehadiran` - Mengedit data kehadiran
- `delete_kehadiran` - Menghapus data kehadiran
- `view_kegiatan` - Melihat data kegiatan
- `create_kegiatan` - Membuat data kegiatan
- `edit_kegiatan` - Mengedit data kegiatan
- `delete_kegiatan` - Menghapus data kegiatan
- `view_reports` - Melihat laporan
- `export_data` - Export data

## 📱 Halaman Aplikasi

### `/login`
- Form login untuk autentikasi
- Redirect otomatis setelah login berhasil

### `/` (Dashboard)
- Informasi akun user yang sedang login
- Statistik aplikasi
- Menu navigasi berdasarkan permissions

### `/admin` (Khusus Admin)
- Manajemen user (CRUD)
- Pengaturan permissions per user
- Pembuatan permissions baru

## 🛡️ Keamanan

### Autentikasi
- Password di-hash menggunakan bcrypt
- JWT token untuk session management
- Cookie httpOnly untuk keamanan browser

### Autorisasi
- Middleware untuk proteksi route
- Role-based access control
- Permission-based feature access
- Admin-only endpoints protection

### Middleware Functions
```typescript
// Proteksi route dengan autentikasi
withAuth(handler)

// Proteksi route khusus admin
withAdminAuth(handler)

// Proteksi route dengan permission tertentu
withPermission('permission_name', handler)
```

## 🎨 UI Components

### Sidebar Dinamis
- Menu berubah berdasarkan role dan permissions
- Informasi user yang sedang login
- Tombol logout

### Admin Panel
- Tabel user dengan role dan permissions
- Dialog untuk create/edit user
- Checkbox permissions yang dinamis
- Konfirmasi delete user

### Dashboard
- Card informasi user
- Badge untuk role dan permissions
- Statistik aplikasi

## 🔄 Workflow Penggunaan

### Admin Workflow
1. Login sebagai admin
2. Akses Admin Panel dari sidebar
3. Buat user baru atau edit user existing
4. Atur permissions sesuai kebutuhan
5. Monitor aktivitas user

### User Workflow
1. Login dengan akun yang dibuat admin
2. Akses fitur sesuai permissions yang diberikan
3. Lihat informasi akun di dashboard
4. Gunakan fitur yang diizinkan

## 📝 Catatan Pengembangan

### Menambah Permission Baru
1. Tambahkan permission ke database via admin panel
2. Update middleware untuk cek permission
3. Kondisional render UI berdasarkan permission

### Menambah Role Baru
1. Update enum Role di schema Prisma
2. Jalankan migrasi database
3. Update logic di auth functions
4. Update UI components

Sistem ini memberikan fleksibilitas penuh untuk mengatur akses user berdasarkan role dan permissions yang dapat dikustomisasi sesuai kebutuhan aplikasi.
