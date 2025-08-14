import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateZScore, getAgeInMonths } from '@/lib/stuntingUtils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const stuntingRecord = await prisma.stuntingRecord.findUnique({
      where: { id },
      include: { child: true },
    });

    if (!stuntingRecord) {
      return NextResponse.json({ message: 'Stunting record not found' }, { status: 404 });
    }
    return NextResponse.json(stuntingRecord);
  } catch (error) {
    console.error('Error fetching stunting record:', error);
    return NextResponse.json({ message: 'Error fetching stunting record' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { childId, height, weight, headCircumference, armCircumference, measurementDate } = await request.json();

    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { dateOfBirth: true, gender: true },
    });

    if (!child) {
      return NextResponse.json({ message: 'Child not found' }, { status: 404 });
    }

    const ageInMonths = getAgeInMonths(new Date(child.dateOfBirth), new Date(measurementDate));

    // Calculate Z-scores
    const growthDataType = (child.gender.toLowerCase() === 'male' || child.gender.toLowerCase() === 'laki-laki') ? 'length_for_age_boys' : 'length_for_age_girls';
    const growthDataTypeLength = (child.gender.toLowerCase() === 'male' || child.gender.toLowerCase() === 'laki-laki') ? 'length_for_age_boys' : 'length_for_age_girls';
    const calculatedHeightForAgeZScore = calculateZScore(parseFloat(height), ageInMonths, child.gender, growthDataTypeLength);

    const growthDataTypeWeight = (child.gender.toLowerCase() === 'male' || child.gender.toLowerCase() === 'laki-laki') ? 'weight_for_age_boys' : 'weight_for_age_girls';
    const calculatedWeightForAgeZScore = calculateZScore(parseFloat(weight), ageInMonths, child.gender, growthDataTypeWeight);

    const updatedStuntingRecord = await prisma.stuntingRecord.update({
      where: { id },
      data: {
        childId,
        height: parseFloat(height),
        weight: parseFloat(weight),
        headCircumference: headCircumference ? parseFloat(headCircumference) : null,
        armCircumference: armCircumference ? parseFloat(armCircumference) : null,
        measurementDate: new Date(measurementDate),
        weightForAgeZScore: calculatedWeightForAgeZScore,
        heightForAgeZScore: calculatedHeightForAgeZScore,
        weightForHeightZScore: null, // Placeholder for now
      },
    });
    return NextResponse.json(updatedStuntingRecord);
  } catch (error) {
    console.error('Error updating stunting record:', error);
    return NextResponse.json({ message: 'Error updating stunting record' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.stuntingRecord.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Stunting record deleted successfully' });
  } catch (error) {
    console.error('Error deleting stunting record:', error);
    return NextResponse.json({ message: 'Error deleting stunting record' }, { status: 500 });
  }
}
