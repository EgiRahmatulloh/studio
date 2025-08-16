import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withPermission } from '@/lib/middleware';

const prisma = new PrismaClient();

export const GET = withPermission('view_pendaftaran', async (req: NextRequest, user, context) => {
  try {
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let whereClause: any = {};
    
    // Admin dapat melihat semua data, user biasa hanya data posyandu mereka
    if (user.role !== 'ADMIN') {
      whereClause.posyanduName = user.posyanduName;
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

    const visitors = await prisma.visitor.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(visitors, { status: 200 });
  } catch (error) {
    console.error("Error fetching visitors:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});

export const POST = withPermission('create_pendaftaran', async (req: NextRequest, user, context) => {
  try {
    const body = await req.json();
    const { name, birthDate, gender, category } = body;
    const posyanduName = user.posyanduName;

    if (!name || !birthDate || !gender || !category || !posyanduName) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const registrationDate = new Date();
    registrationDate.setHours(0, 0, 0, 0); // Set to start of day for comparison

    let activityRecord = await prisma.activityRecord.findFirst({
      where: {
        activityDate: registrationDate,
        posyanduName: posyanduName,
      },
    });

    if (!activityRecord) {
      activityRecord = await prisma.activityRecord.create({
        data: {
          activityDate: registrationDate,
          posyanduName: posyanduName,
          sasaranBalita: 0,
          sasaranBumil: 0,
          sasaranRemaja: 0,
          sasaranLansia: 0,
          sasaranBusu: 0,
          sasaranBayi: 0,
          sasaranDewasa: 0,
          sasaranBufas: 0,
          pengunjungBalita: 0,
          pengunjungBumil: 0,
          pengunjungRemaja: 0,
          pengunjungLansia: 0,
          pengunjungBusu: 0,
          pengunjungBayi: 0,
          pengunjungDewasa: 0,
          pengunjungBufas: 0,
        },
      });
    }

    const newVisitor = await prisma.visitor.create({
      data: {
        name,
        birthDate: new Date(birthDate),
        gender,
        category,
        posyanduName,
        activityRecord: {
          connect: {
            id: activityRecord.id,
          },
        },
      },
    });

    // Update visitor count in ActivityRecord based on category
    const updateData: { [key: string]: number } = {};
    switch (category) {
      case "Balita":
        updateData.pengunjungBalita = (activityRecord.pengunjungBalita || 0) + 1;
        break;
      case "Ibu Hamil":
        updateData.pengunjungBumil = (activityRecord.pengunjungBumil || 0) + 1;
        break;
      case "Remaja":
        updateData.pengunjungRemaja = (activityRecord.pengunjungRemaja || 0) + 1;
        break;
      case "Lansia":
        updateData.pengunjungLansia = (activityRecord.pengunjungLansia || 0) + 1;
        break;
      case "Ibu Menyusui":
        updateData.pengunjungBusu = (activityRecord.pengunjungBusu || 0) + 1;
        break;
      case "Bayi":
        updateData.pengunjungBayi = (activityRecord.pengunjungBayi || 0) + 1;
        break;
      case "Dewasa":
        updateData.pengunjungDewasa = (activityRecord.pengunjungDewasa || 0) + 1;
        break;
      case "Ibu Nifas":
        updateData.pengunjungBufas = (activityRecord.pengunjungBufas || 0) + 1;
        break;
      default:
        break;
    }

    await prisma.activityRecord.update({
      where: { id: activityRecord.id },
      data: updateData,
    });

    return NextResponse.json(newVisitor, { status: 201 });
  } catch (error) {
    console.error("Error creating visitor:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
