import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const child = await prisma.child.findUnique({
      where: { id },
      include: { stuntingRecords: true },
    });

    if (!child) {
      return NextResponse.json({ message: 'Child not found' }, { status: 404 });
    }
    return NextResponse.json(child);
  } catch (error) {
    console.error('Error fetching child:', error);
    return NextResponse.json({ message: 'Error fetching child' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { fullName, dateOfBirth, gender, posyanduName } = await request.json();
    const updatedChild = await prisma.child.update({
      where: { id },
      data: {
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        posyanduName,
      },
    });
    return NextResponse.json(updatedChild);
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json({ message: 'Error updating child' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.stuntingRecord.deleteMany({
      where: { childId: id },
    });
    await prisma.child.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Child and associated stunting records deleted successfully' });
  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json({ message: 'Error deleting child' }, { status: 500 });
  }
}
