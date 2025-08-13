import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const config = await prisma.attendanceConfig.findFirst();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching attendance config:', error);
    return NextResponse.json({ message: 'Error fetching attendance config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { configDate } = await req.json();
    const newConfig = await prisma.attendanceConfig.create({
      data: {
        configDate: new Date(configDate),
      },
    });
    return NextResponse.json(newConfig, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance config:', error);
    return NextResponse.json({ message: 'Error creating attendance config' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, configDate } = await req.json();
    const updatedConfig = await prisma.attendanceConfig.update({
      where: { id },
      data: {
        configDate: new Date(configDate),
      },
    });
    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Error updating attendance config:', error);
    return NextResponse.json({ message: 'Error updating attendance config' }, { status: 500 });
  }
}