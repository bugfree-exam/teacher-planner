import { prisma } from "../lib/prisma";

type UpdateTopicProgressParams = {
  studentId?: string | null;
  groupId?: string | null;
  topicId: string;
  increment?: number;
};

export async function updateTopicProgress({
  studentId,
  groupId,
  topicId,
  increment = 20,
}: UpdateTopicProgressParams) {
  if (studentId) {
    const existing = await prisma.topicProgress.findUnique({
      where: {
        studentId_topicId: {
          studentId,
          topicId,
        },
      },
    });

    const nextProgress = Math.min((existing?.progress ?? 0) + increment, 100);

    await prisma.topicProgress.upsert({
      where: {
        studentId_topicId: {
          studentId,
          topicId,
        },
      },
      update: {
        progress: nextProgress,
        status: nextProgress >= 100 ? "COMPLETED" : "IN_PROGRESS",
      },
      create: {
        studentId,
        topicId,
        progress: nextProgress,
        status: nextProgress >= 100 ? "COMPLETED" : "IN_PROGRESS",
      },
    });
  }

  if (groupId) {
    const existing = await prisma.topicProgress.findUnique({
      where: {
        groupId_topicId: {
          groupId,
          topicId,
        },
      },
    });

    const nextProgress = Math.min((existing?.progress ?? 0) + increment, 100);

    await prisma.topicProgress.upsert({
      where: {
        groupId_topicId: {
          groupId,
          topicId,
        },
      },
      update: {
        progress: nextProgress,
        status: nextProgress >= 100 ? "COMPLETED" : "IN_PROGRESS",
      },
      create: {
        groupId,
        topicId,
        progress: nextProgress,
        status: nextProgress >= 100 ? "COMPLETED" : "IN_PROGRESS",
      },
    });
  }
}