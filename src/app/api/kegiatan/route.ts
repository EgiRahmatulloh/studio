
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withPermission } from '@/lib/middleware';

const prisma = new PrismaClient();

export const GET = withPermission('view_kegiatan', async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause = {};

    if (startDate && endDate) {
      whereClause = {
        activityDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    } else if (startDate) {
      whereClause = {
        activityDate: {
          gte: new Date(startDate),
        },
      };
    } else if (endDate) {
      whereClause = {
        activityDate: {
          lte: new Date(endDate),
        },
      };
    }

    const activities = await prisma.activityRecord.findMany({
      where: whereClause,
      orderBy: {
        timestamp: 'desc',
      },
    });
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
});

export const POST = withPermission('create_kegiatan', async (request: NextRequest) => {
  try {
    const data = await request.json();
    const newActivity = await prisma.activityRecord.create({
      data: {
        posyanduName: data.posyanduName,
        activityDate: new Date(data.activityDate),
        sasaranBalita: data.sasaranBalita,
        sasaranBumil: data.sasaranBumil,
        sasaranRemaja: data.sasaranRemaja,
        sasaranLansia: data.sasaranLansia,
        sasaranBufas: data.sasaranBufas,
        sasaranBusu: data.sasaranBusu,
        sasaranBayi: data.sasaranBayi,
        sasaranDewasa: data.sasaranDewasa,
        pengunjungBalita: data.pengunjungBalita,
        pengunjungBumil: data.pengunjungBumil,
        pengunjungRemaja: data.pengunjungRemaja,
        pengunjungLansia: data.pengunjungLansia,
        pengunjungBufas: data.pengunjungBufas,
        pengunjungBusu: data.pengunjungBusu,
        pengunjungBayi: data.pengunjungBayi,
        pengunjungDewasa: data.pengunjungDewasa,
        fotoUrl: data.fotoUrl,
      },
    });
    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
});
