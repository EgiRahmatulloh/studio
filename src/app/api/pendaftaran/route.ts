import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, birthDate, gender, category } = body;

    if (!name || !birthDate || !gender || !category) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const newVisitor = await prisma.visitor.create({
      data: {
        name,
        birthDate: new Date(birthDate),
        gender,
        category,
      },
    });

    return NextResponse.json(newVisitor, { status: 201 });
  } catch (error) {
    console.error("Error creating visitor:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
