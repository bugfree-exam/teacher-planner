import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const students = await prisma.student.findMany({
    include: {
      groupStudents: {
        include: {
          group: true,
        },
      },
    },
    orderBy: { fullName: "asc" },
    
  });

  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const body = await req.json();

  const student = await prisma.student.create({
    data: {
      grade: body.grade ? Number(body.grade) : null,
      fullName: body.fullName,
      phone: body.phone || null,
      parentName: body.parentName || null,
      parentPhone: body.parentPhone || null,
      parentEmail: body.parentEmail || null,
      defaultRate: body.defaultRate ? Number(body.defaultRate) : null,
      sourceName: body.sourceName || null,
      sourceLink: body.sourceLink || null,
      startedAt: body.startedAt ? new Date(body.startedAt) : null,
    },
  });

  return NextResponse.json(student);
}