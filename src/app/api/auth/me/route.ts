import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { AuthUser } from '@/lib/auth';

// GET - Mendapatkan informasi user yang sedang login
export const GET = withAuth(async (req: NextRequest, user: AuthUser) => {
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      posyanduName: user.posyanduName,
      role: user.role,
      permissions: user.permissions,
    },
  });
});
