import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

function getPeriodStart(period: string) {
  const now = new Date();

  if (period === "day") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  if (period === "week") {
    const d = new Date(now);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const d = new Date(now.getFullYear(), now.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "month";

  const startDate = getPeriodStart(period);

  const lessons = await prisma.lesson.findMany({
    where: {
      status: "COMPLETED",
      startsAt: {
        gte: startDate,
      },
    },
    include: {
      student: true,
      group: {
        include: {
          students: {
            include: {
              student: true,
            },
          },
        },
      },
    },
    orderBy: {
      startsAt: "asc",
    },
  });

  const payments = await prisma.payment.findMany({
    where: {
      paidAt: {
        gte: startDate,
      },
    },
    include: {
      student: true,
    },
    orderBy: {
      paidAt: "asc",
    },
  });

  const incomeByDate: Record<string, number> = {};
  const incomeByStudent: Record<string, number> = {};

  for (const lesson of lessons) {
    const dateKey = lesson.startsAt.toISOString().slice(0, 10);

    if (lesson.student) {
      incomeByDate[dateKey] = (incomeByDate[dateKey] || 0) + lesson.price;
      incomeByStudent[lesson.student.fullName] =
        (incomeByStudent[lesson.student.fullName] || 0) + lesson.price;
    }

    if (lesson.group) {
      const groupIncome = lesson.price * lesson.group.students.length;
      incomeByDate[dateKey] = (incomeByDate[dateKey] || 0) + groupIncome;

      for (const gs of lesson.group.students) {
        incomeByStudent[gs.student.fullName] =
          (incomeByStudent[gs.student.fullName] || 0) + lesson.price;
      }
    }
  }

  const totalAccrued = Object.values(incomeByDate).reduce(
    (sum, value) => sum + value,
    0
  );

  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);

  return NextResponse.json({
    period,
    totalAccrued,
    totalReceived,
    lessonsCount: lessons.length,
    paymentsCount: payments.length,
    incomeByDate: Object.entries(incomeByDate).map(([date, amount]) => ({
      date,
      amount,
    })),
    incomeByStudent: Object.entries(incomeByStudent)
      .map(([student, amount]) => ({
        student,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount),
  });
}