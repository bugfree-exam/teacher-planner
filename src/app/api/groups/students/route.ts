import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const relation = await prisma.groupStudent.create({
    data: {
      groupId: body.groupId,
      studentId: body.studentId,
    },
  });

  return NextResponse.json(relation);
}

export async function DELETE(req: Request) {
  const body = await req.json();

  await prisma.groupStudent.delete({
    where: {
      groupId_studentId: {
        groupId: body.groupId,
        studentId: body.studentId,
      },
    },
  });

  return NextResponse.json({ ok: true });
}