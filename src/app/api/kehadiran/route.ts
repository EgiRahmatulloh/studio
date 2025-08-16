
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withPermission } from '@/lib/middleware';
import { AuthUser } from '@/lib/auth';

const prisma = new PrismaClient();

export const GET = withPermission('view_kehadiran', async (req: NextRequest, user, context) => {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause: any = {};
    
    // Admin dapat melihat semua data, user biasa hanya data posyandu mereka
    if (user.role !== 'ADMIN') {
      whereClause.posyanduName = user.posyanduName;
    }

    if (startDate && endDate) {
      whereClause.attendanceDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      whereClause.attendanceDate = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      whereClause.attendanceDate = {
        lte: new Date(endDate),
      };
    }

    const attendances = await prisma.attendanceRecord.findMany({
      where: whereClause,
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


export const POST = withPermission('create_kehadiran', async (req: NextRequest, user: AuthUser, context) => {
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
        posyanduName: user.posyanduName,
        fullName: user.fullName,
        attendanceDate: new Date(data.attendanceDate),
        schedule: {
          connectOrCreate: {
            where: {
              scheduleDate: new Date(new Date(data.attendanceDate).setHours(0, 0, 0, 0)),
            },
            create: {
              scheduleDate: new Date(new Date(data.attendanceDate).setHours(0, 0, 0, 0)),
            },
          },
        },
      },
    });
    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json({ error: 'Failed to create attendance' }, { status: 500 });
  }
});
