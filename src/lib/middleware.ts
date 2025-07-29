import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, AuthUser } from './auth';

type HandlerWithParams = (
  req: NextRequest,
  user: AuthUser,
  context: { params: any }
) => Promise<NextResponse>;

export function withAuth(handler: HandlerWithParams | ((req: NextRequest, user: AuthUser) => Promise<NextResponse>)) {
  return async (req: NextRequest, context: { params: any }) => {
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
      
      // Pass both req, user, and context (which contains params) to the handler
      return (handler as HandlerWithParams)(req, user, context);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}

export function withAdminAuth(handler: HandlerWithParams) {
  return withAuth(async (req: NextRequest, user: AuthUser, context: { params: any }) => {
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang diizinkan.' }, { status: 403 });
    }
    return handler(req, user, context);
  });
}

export function withPermission(permission: string, handler: HandlerWithParams) {
  return withAuth(async (req: NextRequest, user: AuthUser, context: { params: any }) => {
    if (user.role !== 'ADMIN' && !user.permissions.includes(permission)) {
      return NextResponse.json({ error: `Akses ditolak. Diperlukan izin: ${permission}` }, { status: 403 });
    }
    return handler(req, user, context);
  });
}
