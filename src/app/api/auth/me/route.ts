import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { AuthUser, getUserById } from '@/lib/auth';

// GET - Mendapatkan informasi user yang sedang login
export const GET = withAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    const freshUser = await getUserById(user.id);
    if (!freshUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user: freshUser });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
