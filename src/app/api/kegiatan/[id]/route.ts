
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { withPermission } from '@/lib/middleware';
import { AuthUser } from '@/lib/auth';

const prisma = new PrismaClient();

// PUT - Update activity record
export const PUT = withPermission('edit_kegiatan', async (req: NextRequest, user: AuthUser, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const data = await req.json();

    const updatedActivity = await prisma.activityRecord.update({
      where: { id },
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
        totalSasaran: data.totalSasaran,
        totalPengunjung: data.totalPengunjung,
        fotoUrl: data.fotoUrl,
      },
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
  }
});
