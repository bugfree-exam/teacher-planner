import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const notes = await prisma.studentNote.findMany({
    where: {
      studentId: params.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(notes);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const note = await prisma.studentNote.create({
    data: {
      studentId: params.id,
      content: body.content,
    },
  });

  return NextResponse.json(note);
}