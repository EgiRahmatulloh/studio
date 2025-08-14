import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CATEGORY_FIELD_MAP: Record<string, string> = {
  bayi: 'pengunjungBayi',
  balita: 'pengunjungBalita',
  bumil: 'pengunjungBumil',
  remaja: 'pengunjungRemaja',
  lansia: 'pengunjungLansia',
  bufas: 'pengunjungBufas',
  busu: 'pengunjungBusu',
  dewasa: 'pengunjungDewasa',
};

export async function GET() {
  try {
    const visitors = await prisma.visitor.findMany();
    return NextResponse.json(visitors);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    return NextResponse.json({ message: 'Error fetching visitors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { fullName, dateOfBirth, category } = await request.json();
    const visitor = await prisma.visitor.create({
      data: {
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        category,
      },
    });

    const latestActivity = await prisma.activityRecord.findFirst({
      orderBy: { activityDate: 'desc' },
    });

    if (latestActivity) {
      const field = CATEGORY_FIELD_MAP[category.toLowerCase()];
      if (field) {
        await prisma.activityRecord.update({
          where: { id: latestActivity.id },
          data: {
            [field]: (latestActivity as any)[field] + 1,
          },
        });
      }
    }

    return NextResponse.json(visitor, { status: 201 });
  } catch (error) {
    console.error('Error creating visitor:', error);
    return NextResponse.json({ message: 'Error creating visitor' }, { status: 500 });
  }
}
