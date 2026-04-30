import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);


  const monthCompletedLessons = await prisma.lesson.findMany({
    where: {
      status: "COMPLETED",
      startsAt: {
        gte: startOfMonth,
      },
    },
    include: {
      group: {
        include: {
          students: true,
        },
      },
    },
  });

  const monthPayments = await prisma.payment.findMany({
    where: {
      paidAt: {
        gte: startOfMonth,
      },
    },
  });

  const students = await prisma.student.findMany({
    include: {
      payments: true,
      lessons: {
        where: { status: "COMPLETED" },
      },
      groupStudents: {
        include: {
          group: {
            include: {
              lessons: {
                where: { status: "COMPLETED" },
              },
            },
          },
        },
      },
    },
    orderBy: { fullName: "asc" },
  });

  const balances = students.map((student) => {
    const paid = student.payments.reduce((sum, p) => sum + p.amount, 0);

    const individualCharged = student.lessons.reduce(
      (sum, lesson) => sum + lesson.price,
      0
    );

    const groupCharged = student.groupStudents.reduce((sum, groupStudent) => {
      const groupLessonsSum = groupStudent.group.lessons.reduce(
        (lessonSum, lesson) => lessonSum + lesson.price,
        0
      );

      return sum + groupLessonsSum;
    }, 0);

    const charged = individualCharged + groupCharged;

    return {
      studentId: student.id,
      fullName: student.fullName,
      paid,
      charged,
      balance: paid - charged,
    };
  });

  const earnedByLessons = monthCompletedLessons.reduce((sum, lesson) => {
    if (lesson.studentId) {
      return sum + lesson.price;
    }

    if (lesson.groupId && lesson.group) {
      return sum + lesson.price * lesson.group.students.length;
    }

    return sum;
  }, 0);

  const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

const todayEnd = new Date();
todayEnd.setHours(23, 59, 59, 999);

const todayLessonsRaw = await prisma.lesson.findMany({
  where: {
    startsAt: {
      gte: todayStart,
      lte: todayEnd,
    },
    status: {
      not: "CANCELLED",
    },
    OR: [
      {
        student: {
          status: {
            not: "FINISHED",
          },
        },
      },
      {
        groupId: {
          not: null,
        },
      },
    ],
  },
  include: {
    student: true,
    group: true,
  },
  orderBy: {
    startsAt: "asc",
  },
});

const formatTime = (date: Date) =>
  date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

const todayLessons = todayLessonsRaw.map((lesson) => {
  const start = lesson.startsAt;

  const end = new Date(
    lesson.startsAt.getTime() + lesson.durationMin * 60 * 1000
  );

  return {
    id: lesson.id,
    studentName: lesson.student?.fullName ?? null,
    groupName: lesson.group?.name ?? null,
    grade: lesson.student?.grade ?? null,
    time: `${formatTime(start)} – ${formatTime(end)}`,
  };
});

  return NextResponse.json({
    todayLessons,
    monthStats: {
      completedLessonsCount: monthCompletedLessons.length,
      earnedByLessons,
      receivedPayments: monthPayments.reduce((sum, p) => sum + p.amount, 0),
    },
    balances,
    debtors: balances.filter((b) => b.balance < 0),
  });
}