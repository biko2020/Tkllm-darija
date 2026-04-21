import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@tkllm/api/prisma/prisma.service'; 

@Injectable()
export class ActiveLearningService {
  private readonly logger = new Logger(ActiveLearningService.name);
  private readonly threshold: number;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.threshold = this.configService.get<number>('QUALITY_HUMAN_REVIEW_THRESHOLD') || 0.65;
  }

  /**
   * Decide whether a submission should go to human review using active learning logic
   */
  async shouldGoToHumanReview(submission: any): Promise<boolean> {
    const { qualityScore, confidenceScore, snrDb } = submission;

    // Low confidence or poor audio quality → human review
    if (qualityScore < this.threshold || (confidenceScore && confidenceScore < 0.7)) {
      return true;
    }

    // Borderline cases → active learning selection (uncertainty sampling)
    if (qualityScore >= this.threshold && qualityScore < 0.82) {
      // 30% chance for borderline cases (exploration)
      return Math.random() < 0.3;
    }

    // High quality → auto-approve (exploitation)
    return false;
  }

  /**
   * Select samples for active learning pool (uncertainty + diversity)
   */
  async selectActiveLearningSamples(limit: number = 50): Promise<any[]> {
    // Find submissions with medium confidence (most informative for model improvement)
    const samples = await this.prisma.audioSubmission.findMany({
      where: {
        qualityScore: { gte: 0.4, lte: 0.75 },
        status: 'UNDER_REVIEW',
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        contributor: true,
      },
    });

    this.logger.log(`Selected ${samples.length} samples for active learning pool`);
    return samples;
  }

  async updateReputationAfterReview(submissionId: string, reviewerScore: number) {
    // Simple reputation update logic
    const submission = await this.prisma.audioSubmission.findUnique({
      where: { id: submissionId },
      include: { contributor: true },
    });

    if (!submission?.contributor) return;

    const newReputation = Math.max(
      50,
      Math.min(98, submission.contributor.reputationScore + (reviewerScore - 0.5) * 8)
    );

    await this.prisma.contributorProfile.update({
      where: { userId: submission.contributor.id },
      data: { reputationScore: newReputation },
    });
  }
}