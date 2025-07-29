import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../src/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const activities = await prisma.activityRecord.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    });
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
        sasaranBufus: data.sasaranBufus,
        sasaranBusu: data.sasaranBusu,
        sasaranBayi: data.sasaranBayi,
        sasaranDewasa: data.sasaranDewasa,
        pengunjungBalita: data.pengunjungBalita,
        pengunjungBumil: data.pengunjungBumil,
        pengunjungRemaja: data.pengunjungRemaja,
        pengunjungLansia: data.pengunjungLansia,
        pengunjungBufus: data.pengunjungBufus,
        pengunjungBusu: data.pengunjungBusu,
        pengunjungBayi: data.pengunjungBayi,
        pengunjungDewasa: data.pengunjungDewasa,
        totalSasaran: data.totalSasaran,
        totalPengunjung: data.totalPengunjung,
        fotoUrl: data.fotoUrl,
      },
    });
    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
