import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seeds a task into the database for a given user.
 * @param userId - ID of the user assigned to the task
 * @param overrides - Optional fields to override defaults
 */
export async function seedTestTask(
  userId: string,
  overrides: Partial<{ title: string; status: string; sampleId?: string }> = {}
) {
  const title = overrides.title || "Transcription Task";
  const status = overrides.status || "assigned";

  const task = await prisma.task.create({
    data: {
      title,
      status,
      userId,
      sampleId: overrides.sampleId || null,
      createdAt: new Date(),
    },
  });

  return task;
}

/**
 * Seeds multiple tasks for a given user.
 */
export async function seedTasks(userId: string, count: number = 3) {
  const tasks = [];
  for (let i = 0; i < count; i++) {
    tasks.push(
      await seedTestTask(userId, {
        title: `Task ${i + 1}`,
        status: "assigned",
      })
    );
  }
  return tasks;
}
