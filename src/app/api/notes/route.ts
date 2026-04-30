import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  const notes = await prisma.studentNote.findMany({
    where: { studentId: studentId || undefined },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const body = await req.json();

  const note = await prisma.studentNote.create({
    data: {
      studentId: body.studentId,
      content: body.content,
    },
  });

  return NextResponse.json(note);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.studentNote.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  const note = await prisma.studentNote.update({
    where: {
      id: body.id,
    },
    data: {
      content: body.content,
    },
  });

  return NextResponse.json(note);
}