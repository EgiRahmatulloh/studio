import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../src/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
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
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
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
}
