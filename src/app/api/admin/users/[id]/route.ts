import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware';
import { getUserById, updateUserPermissions, deleteUser, AuthUser } from '@/lib/auth';

// GET - Mendapatkan detail user berdasarkan ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return withAdminAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      const targetUser = await getUserById(params.id);
      
      if (!targetUser) {
        return NextResponse.json(
          { error: 'User tidak ditemukan' },
          { status: 404 }
        );
      }

      return NextResponse.json({ user: targetUser });
    } catch (error) {
      console.error('Get user error:', error);
      return NextResponse.json(
        { error: 'Terjadi kesalahan server' },
        { status: 500 }
      );
    }
  })(req);
}

// PUT - Update permissions user
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withAdminAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      const { permissions } = await request.json();

      if (!Array.isArray(permissions)) {
        return NextResponse.json(
          { error: 'Permissions harus berupa array' },
          { status: 400 }
        );
      }

      await updateUserPermissions(params.id, permissions);
      const updatedUser = await getUserById(params.id);

      return NextResponse.json({
        message: 'Permissions user berhasil diupdate',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Update user permissions error:', error);
      return NextResponse.json(
        { error: 'Terjadi kesalahan server' },
        { status: 500 }
      );
    }
  })(req);
}

// DELETE - Hapus user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withAdminAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      // Cegah admin menghapus dirinya sendiri
      if (params.id === user.id) {
        return NextResponse.json(
          { error: 'Tidak dapat menghapus akun sendiri' },
          { status: 400 }
        );
      }

      await deleteUser(params.id);

      return NextResponse.json({
        message: 'User berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      return NextResponse.json(
        { error: 'Terjadi kesalahan server' },
        { status: 500 }
      );
    }
  })(req);
}
