import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withPermission } from '@/lib/middleware';

const prisma = new PrismaClient();

export const GET = withPermission('view_kegiatan', async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const activity = await prisma.activityRecord.findUnique({
      where: { id },
    });
    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }
    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
});

export const PUT = withPermission('edit_kegiatan', async (req: NextRequest, { params }: { params: { id:string } }) => {
  try {
    const { id } = params;
    const data = await req.json();

    // Data validation could be added here with Zod

    const updatedActivity = await prisma.activityRecord.update({
      where: { id },
      data: {
        sasaranBalita: data.sasaranBalita,
        sasaranBumil: data.sasaranBumil,
        sasaranRemaja: data.sasaranRemaja,
        sasaranLansia: data.sasaranLansia,
        sasaranBufas: data.sasaranBufas,
        sasaranBusu: data.sasaranBusu,
        sasaranBayi: data.sasaranBayi,
        sasaranDewasa: data.sasaranDewasa,
        fotoUrl: data.fotoUrl,
        // Pengunjung fields are intentionally not updatable here
      },
    });

    return NextResponse.json(updatedActivity, { status: 200 });
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
  }
});

export const DELETE = withPermission('delete_kegiatan', async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    // Optional: Check for related visitors and decide on a cascade rule if needed
    await prisma.activityRecord.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Activity deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
  }
});