import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const students = await prisma.student.findMany({
    include: {
      payments: true,
      lessons: {
        where: {
          status: "COMPLETED",
        },
      },
      groupStudents: {
        include: {
          group: {
            include: {
              lessons: {
                where: {
                  status: "COMPLETED",
                },
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

  return NextResponse.json(balances);
}