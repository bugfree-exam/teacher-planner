import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { startsAt: "desc" },
      },
      homeworks: {
        orderBy: { createdAt: "desc" },
      },
      payments: {
        orderBy: { paidAt: "desc" },
      },
      groupStudents: {
        include: {
          group: {
            include: {
              homeworks: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      },
      notes: {
        orderBy: { createdAt: "desc" },
      },
      topics: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json(student);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const student = await prisma.student.update({
    where: { id },
    data: {
      grade: body.grade ? Number(body.grade) : null,
      fullName: body.fullName,
      phone: body.phone || null,
      parentName: body.parentName || null,
      parentPhone: body.parentPhone || null,
      parentEmail: body.parentEmail || null,
      startedAt: body.startedAt ? new Date(body.startedAt) : null,
      defaultRate: body.defaultRate ? Number(body.defaultRate) : null,
      sourceName: body.sourceName || null,
      sourceLink: body.sourceLink || null,
      desiredResult: body.desiredResult || null,
      actualScore: body.actualScore ? Number(body.actualScore) : null,
      university: body.university || null,
      direction: body.direction || null,
      status: body.status || "ACTIVE",
    },
  });

  return NextResponse.json(student);
}