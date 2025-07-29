import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, AuthUser } from './auth';

type HandlerWithParams<T> = (
  req: NextRequest,
  user: AuthUser,
  context: { params: T }
) => Promise<NextResponse> | NextResponse;

type HandlerWithoutParams = (
    req: NextRequest,
    user: AuthUser,
) => Promise<NextResponse> | NextResponse;

type ContextWithParams<T> = { params: T };

export function withAuth<T = any>(handler: HandlerWithParams<T> | HandlerWithoutParams) {
  return async (req: NextRequest, context: ContextWithParams<T>) => {
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
      
      return (handler as HandlerWithParams<T>)(req, user, context);
    } catch (error) {
        console.error("Middleware error:", error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}

export function withAdminAuth<T = any>(handler: HandlerWithParams<T> | HandlerWithoutParams) {
  return withAuth(async (req: NextRequest, user: AuthUser, context: ContextWithParams<T>) => {
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang diizinkan.' }, { status: 403 });
    }
    return (handler as HandlerWithParams<T>)(req, user, context);
  });
}

export function withPermission<T = any>(permission: string, handler: HandlerWithParams<T> | HandlerWithoutParams) {
  return withAuth(async (req: NextRequest, user: AuthUser, context: ContextWithParams<T>) => {
    if (user.role !== 'ADMIN' && !user.permissions.includes(permission)) {
      return NextResponse.json({ error: `Akses ditolak. Diperlukan izin: ${permission}` }, { status: 403 });
    }
    return (handler as HandlerWithParams<T>)(req, user, context);
  });
}
