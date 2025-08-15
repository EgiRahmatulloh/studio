import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, birthDate, gender, category } = body;

    if (!name || !birthDate || !gender || !category) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const updatedVisitor = await prisma.visitor.update({
      where: { id },
      data: {
        name,
        birthDate: new Date(birthDate),
        gender,
        category,
      },
    });

    return NextResponse.json(updatedVisitor, { status: 200 });
  } catch (error) {
    console.error("Error updating visitor:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
