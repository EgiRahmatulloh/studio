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