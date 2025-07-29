import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { withPermission } from '@/lib/middleware';
import { AuthUser } from '@/lib/auth';

const prisma = new PrismaClient();

type RouteContext = {
    params: {
        id: string;
    }
}

// PUT - Update attendance record
export const PUT = withPermission('edit_kehadiran', async (req: NextRequest, user: AuthUser, context: RouteContext) => {
  try {
    const { id } = context.params;
    const data = await req.json();

    const updatedAttendance = await prisma.attendanceRecord.update({
      where: { id },
      data: {
        posyanduName: data.posyanduName,
        fullName: data.fullName,
        attendanceDate: new Date(data.attendanceDate),
      },
    });

    return NextResponse.json(updatedAttendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
});
