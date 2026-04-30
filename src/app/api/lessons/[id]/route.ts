import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { updateTopicProgress } from "../../../../lib/progress";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  const lesson = await prisma.lesson.update({
    where: { id },
    data: {
      studentId: body.studentId ?? undefined,
      groupId: body.groupId ?? undefined,
      topicId: body.topicId ?? undefined,

      startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
      durationMin: body.durationMin ? Number(body.durationMin) : undefined,
      price: body.price ? Number(body.price) : undefined,

      type: body.type ?? undefined,
      status: body.status ?? undefined,
      note: body.note ?? undefined,
    },
    include: {
      student: true,
      group: true,
      topic: true,
    },
  });
  

  if (lesson.status === "COMPLETED" && lesson.topicId) {
    await updateTopicProgress({
      studentId: lesson.studentId,
      groupId: lesson.groupId,
      topicId: lesson.topicId,
      increment: 20,
    });
  }

  return NextResponse.json(lesson);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await prisma.lesson.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}