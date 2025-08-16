import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withPermission } from '@/lib/middleware';

const prisma = new PrismaClient();

export const GET = withPermission('view_pemeriksaan', async (req: NextRequest, user, context) => {
  try {
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get("visitorId");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let whereClause: any = {};
    
    // Admin dapat melihat semua data, user biasa hanya data posyandu mereka
    if (user.role !== 'ADMIN') {
      whereClause.posyanduName = user.posyanduName;
    }

    if (visitorId) {
      whereClause.visitorId = visitorId;
    }

    if (startDateParam && endDateParam) {
      whereClause.createdAt = {
        gte: new Date(startDateParam),
        lte: new Date(endDateParam),
      };
    } else if (startDateParam) {
      whereClause.createdAt = {
        gte: new Date(startDateParam),
      };
    } else if (endDateParam) {
      whereClause.createdAt = {
        lte: new Date(endDateParam),
      };
    }

    const examinations = await prisma.examinationRecord.findMany({
      where: whereClause,
      include: {
        visitor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(examinations, { status: 200 });
  } catch (error) {
    console.error("Error fetching examinations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});

export const POST = withPermission('create_pemeriksaan', async (req: NextRequest, user, context) => {
  try {
    const body = await req.json();
    const { visitorId, height, weight, notes } = body;
    const posyanduName = user.posyanduName;

    if (!visitorId || !height || !weight || !posyanduName) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Verify visitor exists
    const visitor = await prisma.visitor.findUnique({
      where: { id: visitorId },
    });

    if (!visitor) {
      return NextResponse.json(
        { error: "Pengunjung tidak ditemukan" },
        { status: 404 }
      );
    }

    const newExamination = await prisma.examinationRecord.create({
      data: {
        height: parseFloat(height.toString()),
        weight: parseFloat(weight.toString()),
        notes,
        posyanduName,
        visitor: {
          connect: {
            id: visitorId,
          },
        },
      },
      include: {
        visitor: true,
      },
    });

    return NextResponse.json(newExamination, { status: 201 });
  } catch (error) {
    console.error("Error creating examination:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});