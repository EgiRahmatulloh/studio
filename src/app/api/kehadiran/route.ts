
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../src/generated/prisma';
import { withPermission } from '@/lib/middleware';

const prisma = new PrismaClient();

export const GET = withPermission('view_kehadiran', async () => {
  try {
    const attendances = await prisma.attendanceRecord.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    });
    return NextResponse.json(attendances);
  } catch (error) {
    console.error('Error fetching attendances:', error);
    return NextResponse.json({ error: 'Failed to fetch attendances' }, { status: 500 });
  }
});

export const POST = withPermission('create_kehadiran', async (req: NextRequest) => {
  try {
    const data = await req.json();
    const newAttendance = await prisma.attendanceRecord.create({
      data: {
        posyanduName: data.posyanduName,
        fullName: data.fullName,
        attendanceDate: new Date(data.attendanceDate),
      },
    });
    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json({ error: 'Failed to create attendance' }, { status: 500 });
  }
});
