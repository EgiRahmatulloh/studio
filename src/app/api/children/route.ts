import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const children = await prisma.child.findMany();
    return NextResponse.json(children);
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({ message: 'Error fetching children' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { fullName, dateOfBirth, gender, posyanduName } = await request.json();
    const newChild = await prisma.child.create({
      data: {
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        posyanduName,
      },
    });
    return NextResponse.json(newChild, { status: 201 });
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json({ message: 'Error creating child' }, { status: 500 });
  }
}
