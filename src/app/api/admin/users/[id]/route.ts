import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware';
import { getUserById, updateUser, deleteUser, AuthUser } from '@/lib/auth';

type RouteContext = {
    params: {
        id: string;
    }
}

// GET - Mendapatkan detail user berdasarkan ID
export const GET = withAdminAuth(async (req: NextRequest, user: AuthUser, context: RouteContext) => {
    try {
        const targetUser = await getUserById(context.params.id);
        
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
});

// PUT - Update user (permissions and posyanduName)
export const PUT = withAdminAuth(async (req: NextRequest, user: AuthUser, context: RouteContext) => {
    try {
      const { permissions, posyanduName } = await req.json();

      if (!Array.isArray(permissions)) {
        return NextResponse.json(
          { error: 'Permissions harus berupa array' },
          { status: 400 }
        );
      }

      await updateUser(context.params.id, { permissions, posyanduName });
      const updatedUser = await getUserById(context.params.id);

      return NextResponse.json({
        message: 'User berhasil diupdate',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Update user error:', error);
      return NextResponse.json(
        { error: 'Terjadi kesalahan server' },
        { status: 500 }
      );
    }
});

// DELETE - Hapus user
export const DELETE = withAdminAuth(async (req: NextRequest, user: AuthUser, context: RouteContext) => {
    try {
      // Cegah admin menghapus dirinya sendiri
      if (context.params.id === user.id) {
        return NextResponse.json(
          { error: 'Tidak dapat menghapus akun sendiri' },
          { status: 400 }
        );
      }

      await deleteUser(context.params.id);

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
});
