
import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware';
import { getAllPermissions, createPermission, AuthUser } from '@/lib/auth';

// GET - Mendapatkan semua permissions
export const GET = withAdminAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    const permissions = await getAllPermissions();
    return NextResponse.json({ permissions });
  } catch (error) {
    console.error('Get permissions error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
});

// POST - Membuat permission baru
export const POST = withAdminAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    const { name } = await req.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Nama permission harus diisi' },
        { status: 400 }
      );
    }

    const newPermission = await createPermission(name.trim());

    return NextResponse.json({
      message: 'Permission berhasil dibuat',
      permission: newPermission,
    });
  } catch (error: any) {
    console.error('Create permission error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Permission sudah ada' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
});

    