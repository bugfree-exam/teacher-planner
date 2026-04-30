import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  const body = await request.json();

  const note = await prisma.studentNote.update({
    where: {
      id: params.noteId,
    },
    data: {
      content: body.content,
    },
  });

  return NextResponse.json(note);
}

export async function DELETE(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  await prisma.studentNote.delete({
    where: {
      id: params.noteId,
    },
  });

  return NextResponse.json({ ok: true });
}