import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const studentId = searchParams.get("studentId");
  const groupId = searchParams.get("groupId");

  const homeworks = await prisma.homework.findMany({
    where: {
      ...(studentId ? { studentId } : {}),
      ...(groupId ? { groupId } : {}),
    },
    include: {
      student: true,
      group: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(homeworks);
}

export async function POST(req: Request) {
  const body = await req.json();

  const homework = await prisma.homework.create({
    data: {
      title: body.title,
      description: body.description || null,
      deadline: body.deadline ? new Date(body.deadline) : null,
      status: body.status || "ASSIGNED",
      studentId: body.studentId || null,
      groupId: body.groupId || null,
    },
  });

  if (body.studentId) {
    await prisma.studentNote.create({
      data: {
        studentId: body.studentId,
        content: `Выдано ДЗ: ${body.title}${
          body.deadline
            ? ` · дедлайн ${new Date(body.deadline).toLocaleDateString("ru-RU")}`
            : ""
        }`,
      },
    });
  }

  return NextResponse.json(homework);
}

export async function PATCH(req: Request) {
  const body = await req.json();

  const homework = await prisma.homework.update({
    where: { id: body.id },
    data: {
      title: body.title,
      description: body.description || null,
      deadline: body.deadline ? new Date(body.deadline) : null,
      status: body.status || "ASSIGNED",
    },
  });

  return NextResponse.json(homework);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.homework.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}