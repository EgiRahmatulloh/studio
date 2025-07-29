import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, AuthUser } from './auth';

export function withAuth(handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                   req.cookies.get('auth-token')?.value;

      if (!token) {
        return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 });
      }

      const user = verifyToken(token);
      if (!user) {
        return NextResponse.json({ error: 'Token tidak valid' }, { status: 401 });
      }

      return handler(req, user);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}

export function withAdminAuth(handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return withAuth(async (req: NextRequest, user: AuthUser) => {
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang diizinkan.' }, { status: 403 });
    }
    return handler(req, user);
  });
}

export function withPermission(permission: string, handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return withAuth(async (req: NextRequest, user: AuthUser) => {
    if (user.role !== 'ADMIN' && !user.permissions.includes(permission)) {
      return NextResponse.json({ error: `Akses ditolak. Diperlukan izin: ${permission}` }, { status: 403 });
    }
    return handler(req, user);
  });
}
