import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seeds a sample (e.g., audio upload) into the database.
 * @param overrides - Optional fields to override defaults
 * @param userId - ID of the user who owns the sample
 */
export async function seedTestSample(
  userId: string,
  overrides: Partial<{ transcript: string; status: string; language: string }> = {}
) {
  const transcript = overrides.transcript || "This is a test transcript.";
  const status = overrides.status || "submitted";
  const language = overrides.language || "darija";

  const sample = await prisma.sample.create({
    data: {
      userId,
      transcript,
      status,
      language,
      createdAt: new Date(),
    },
  });

  return sample;
}

/**
 * Seeds multiple samples for a given user.
 */
export async function seedSamples(userId: string, count: number = 3) {
  const samples = [];
  for (let i = 0; i < count; i++) {
    samples.push(
      await seedTestSample(userId, {
        transcript: `Transcript ${i}`,
      })
    );
  }
  return samples;
}
