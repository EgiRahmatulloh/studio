import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const examination = await prisma.examinationRecord.findUnique({
      where: { id },
      include: {
        visitor: true,
      },
    });

    if (!examination) {
      return NextResponse.json(
        { error: "Data pemeriksaan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(examination, { status: 200 });
  } catch (error) {
    console.error("Error fetching examination:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { height, weight, notes } = body;

    if (!height || !weight) {
      return NextResponse.json(
        { error: "Tinggi dan berat badan harus diisi" },
        { status: 400 }
      );
    }

    const updatedExamination = await prisma.examinationRecord.update({
      where: { id },
      data: {
        height: parseFloat(height.toString()),
        weight: parseFloat(weight.toString()),
        notes,
      },
      include: {
        visitor: true,
      },
    });

    return NextResponse.json(updatedExamination, { status: 200 });
  } catch (error) {
    console.error("Error updating examination:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.examinationRecord.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Data pemeriksaan berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting examination:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}