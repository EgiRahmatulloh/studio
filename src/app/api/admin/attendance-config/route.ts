import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const posyanduName = searchParams.get('posyanduName');
    
    if (!posyanduName) {
      return NextResponse.json({ message: 'posyanduName parameter is required' }, { status: 400 });
    }
    
    const config = await prisma.attendanceConfig.findFirst({
      where: {
        posyanduName: posyanduName
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching attendance config:', error);
    return NextResponse.json({ message: 'Error fetching attendance config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { configDate, posyanduName } = await req.json();
    
    if (!posyanduName) {
      return NextResponse.json({ message: 'posyanduName is required' }, { status: 400 });
    }
    
    const newConfig = await prisma.attendanceConfig.create({
      data: {
        configDate: new Date(configDate),
        posyanduName: posyanduName,
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
    const { id, configDate, posyanduName } = await req.json();
    
    if (!posyanduName) {
      return NextResponse.json({ message: 'posyanduName is required' }, { status: 400 });
    }
    
    const updatedConfig = await prisma.attendanceConfig.update({
      where: { id },
      data: {
        configDate: new Date(configDate),
        posyanduName: posyanduName,
      },
    });
    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Error updating attendance config:', error);
    return NextResponse.json({ message: 'Error updating attendance config' }, { status: 500 });
  }
}