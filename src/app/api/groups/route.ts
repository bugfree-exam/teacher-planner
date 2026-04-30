import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const groups = await prisma.group.findMany({
    include: {
      students: {
        include: {
          student: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(groups);
}

export async function POST(req: Request) {
  const body = await req.json();

  const group = await prisma.group.create({
    data: {
      name: body.name,
      description: body.description || null,
      defaultRate: body.defaultRate ? Number(body.defaultRate) : null,
    },
  });

  return NextResponse.json(group);
}