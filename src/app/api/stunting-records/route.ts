import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateZScore, getAgeInMonths } from '@/lib/stuntingUtils';

export async function GET() {
  try {
    const stuntingRecords = await prisma.stuntingRecord.findMany({
      include: {
        child: true, // Include child data
      },
    });
    return NextResponse.json(stuntingRecords);
  } catch (error) {
    console.error('Error fetching stunting records:', error);
    return NextResponse.json({ message: 'Error fetching stunting records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    const newStuntingRecord = await prisma.stuntingRecord.create({
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
    return NextResponse.json(newStuntingRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating stunting record:', error);
    return NextResponse.json({ message: 'Error creating stunting record' }, { status: 500 });
  }
}
