import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seeds a quality review into the database.
 * @param sampleId - ID of the sample being reviewed
 * @param reviewerId - ID of the user performing the review
 * @param overrides - Optional fields to override defaults
 */
export async function seedQualityReview(
  sampleId: string,
  reviewerId: string,
  overrides: Partial<{ score: number; status: string; comments: string }> = {}
) {
  const score = overrides.score ?? 85;
  const status = overrides.status || "approved";
  const comments = overrides.comments || "Looks good.";

  const review = await prisma.qualityReview.create({
    data: {
      sampleId,
      reviewerId,
      score,
      status,
      comments,
      createdAt: new Date(),
    },
  });

  return review;
}

/**
 * Seeds multiple quality reviews for a given sample.
 */
export async function seedQualityReviews(
  sampleId: string,
  reviewerId: string,
  count: number = 3
) {
  const reviews = [];
  for (let i = 0; i < count; i++) {
    reviews.push(
      await seedQualityReview(sampleId, reviewerId, {
        score: 70 + i * 5,
        comments: `Review ${i + 1}`,
      })
    );
  }
  return reviews;
}
