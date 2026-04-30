import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const payments = await prisma.payment.findMany({
    include: { student: true },
    orderBy: { paidAt: "desc" },
  });

  return NextResponse.json(payments);
}

export async function POST(req: Request) {
  const body = await req.json();

  const payment = await prisma.payment.create({
    data: {
      studentId: body.studentId,
      amount: Number(body.amount),
      paidAt: body.paidAt ? new Date(body.paidAt) : new Date(),
      type: body.type || "LESSON",
      comment: body.comment || null,
    },
  });

  await prisma.studentNote.create({
    data: {
      studentId: body.studentId,
      content: `Добавлена оплата: ${Number(body.amount)} ₽${
        body.comment ? ` · ${body.comment}` : ""
      }`,
    },
  });

  return NextResponse.json(payment);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.payment.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}