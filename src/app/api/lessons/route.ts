import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const lessons = await prisma.lesson.findMany({
    include: { student: true,
                group: true,
                topic: true,
    },
    orderBy: { startsAt: "asc" },
    
  });

  return NextResponse.json(lessons);
}

export async function POST(req: Request) {
  const body = await req.json();

    if (body.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: body.studentId,
                status: {
                  not: "FINISHED"
                },
        },
      });

      if (!student || student.status === "FINISHED") {
        return NextResponse.json(
          { error: "Нельзя создать занятие для выпускника" },
          { status: 400 }
        );
      }
    }

  const repeatWeeks = Number(body.repeatWeeks || 0);
  const count = repeatWeeks > 0 ? repeatWeeks : 1;

  const baseDate = new Date(body.startsAt);

  

  const lessons = await Promise.all(
    Array.from({ length: count }).map((_, index) => {
      const startsAt = new Date(baseDate);
      startsAt.setDate(baseDate.getDate() + index * 7);

      return prisma.lesson.create({
        data: {
          studentId: body.studentId || null,
          groupId: body.groupId || null,
          topicId: body.topicId || null,
          startsAt,
          durationMin: Number(body.durationMin),
          price: Number(body.price),
          status: body.status || "PLANNED",
          note: body.note || null,
        },
      });
    })
  );

  return NextResponse.json(lessons);
}

export async function PATCH(req: Request) {
  const body = await req.json();

    if (body.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: body.studentId },
      });

      if (!student || student.status === "FINISHED") {
        return NextResponse.json(
          { error: "Нельзя создать занятие для выпускника" },
          { status: 400 }
        );
      }
    }

  const oldLesson = await prisma.lesson.findUnique({
    where: { id: body.id },
  });

  const lesson = await prisma.lesson.update({
    where: { id: body.id },
    data: {
      startsAt: new Date(body.startsAt),
      durationMin: Number(body.durationMin),
      price: Number(body.price),
      studentId: body.studentId || null,
      groupId: body.groupId || null,
      status: body.status || "PLANNED",
      note: body.note || null,
    },
  });

  if (
    oldLesson?.status !== "COMPLETED" &&
    lesson.status === "COMPLETED" &&
    lesson.studentId
  ) {
    await prisma.studentNote.create({
      data: {
        studentId: lesson.studentId,
        content: `Занятие проведено: ${new Date(
          lesson.startsAt
        ).toLocaleString("ru-RU")} · ${lesson.durationMin} мин · ${lesson.price} ₽`,
      },
    });
  }

  if (
    oldLesson?.status !== "COMPLETED" &&
    lesson.status === "COMPLETED" &&
    lesson.groupId
    ) {
    const groupStudents = await prisma.groupStudent.findMany({
      where: {
        groupId: lesson.groupId,
      },
      include: {
        group: true,
      },
    });

    await prisma.studentNote.createMany({
      data: groupStudents.map((gs) => ({
        studentId: gs.studentId,
        content: `Групповое занятие проведено: ${
          gs.group.name
        } · ${new Date(lesson.startsAt).toLocaleString("ru-RU")} · ${
          lesson.durationMin
        } мин · ${lesson.price} ₽`,
      })),
    });
    }

  return NextResponse.json(lesson);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.lesson.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}

