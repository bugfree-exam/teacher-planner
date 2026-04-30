import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const topics = await prisma.topic.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      { grade: "asc" },
      { order: "asc" },
      { title: "asc" },
    ],
  });

  return NextResponse.json(topics);
}

export async function POST(req: Request) {
  const body = await req.json();

  const topic = await prisma.topic.create({
    data: {
      title: body.title,
      description: body.description || null,
      subject: body.subject || null,
      grade: body.grade ? Number(body.grade) : null,
      order: body.order ? Number(body.order) : 0,
    },
  });

  return NextResponse.json(topic);
}