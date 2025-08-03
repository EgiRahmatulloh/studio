
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

import { AuthUser } from '@/lib/auth'; // Import AuthUser

export const POST = withPermission('create_kehadiran', async (req: NextRequest, user: AuthUser) => { // Add user parameter
  try {
    const data = await req.json();

    if (!user.fullName) {
      return NextResponse.json(
        { error: 'Nama lengkap user tidak ditemukan.' },
        { status: 400 }
      );
    }

    // Check if user has already recorded attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today

    const existingAttendance = await prisma.attendanceRecord.findFirst({
      where: {
        fullName: user.fullName,
        attendanceDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // End of today
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Anda sudah mencatat kehadiran untuk hari ini.' },
        { status: 400 }
      );
    }

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
