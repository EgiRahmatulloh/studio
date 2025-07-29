import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware';
import { getAllUsers, createUser, AuthUser } from '@/lib/auth';

// GET - Mendapatkan semua user (hanya admin)
export const GET = withAdminAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
});

// POST - Membuat user baru (hanya admin)
export const POST = withAdminAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    const newUser = await createUser(email, password, role || 'USER');

    return NextResponse.json({
      message: 'User berhasil dibuat',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions,
      },
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
});
