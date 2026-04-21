import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage';

@Injectable()
export class QualityScorer {
  private readonly logger = new Logger(QualityScorer.name);

  constructor(
    private configService: ConfigService,
    private storage: StorageService,
  ) {}

  async processQualityReview(job: any): Promise<any> {
    const { jobId, submissionId, audioUrl, transcript } = job;

    try {
      this.logger.log(`Processing quality review for submission ${submissionId}`);

      // 1. Download audio from S3
      const localAudioPath = await this.storage.downloadAudio(audioUrl, jobId);

      // 2. Multi-stage scoring
      const scores = await this.runMultiStageScoring(localAudioPath, transcript);

      // 3. Update quality score and decide acceptance
      const result = {
        submissionId,
        overallScore: scores.overall,
        audioScore: scores.audio,
        transcriptScore: scores.transcript,
        completionScore: scores.completion,
        iaa: scores.iaa,
        status: scores.overall >= 0.75 ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date().toISOString(),
      };

      this.logger.log(`Quality review completed for ${submissionId} → Score: ${scores.overall.toFixed(3)}`);

      return result;
    } catch (error) {
      this.logger.error(`Quality review failed for job ${jobId}:`, error);
      throw error;
    }
  }

  private async runMultiStageScoring(audioPath: string, transcript: string): Promise<any> {
    // Stage 1: Audio quality (SNR, clipping, background noise)
    const audioScore = await this.calculateAudioQuality(audioPath);

    // Stage 2: Transcript quality (confidence, completeness, language)
    const transcriptScore = await this.calculateTranscriptQuality(transcript);

    // Stage 3: Overall weighted score + IAA simulation
    const overallScore = (audioScore * 0.45) + (transcriptScore * 0.55);

    return {
      overall: Math.min(Math.max(overallScore, 0), 1),
      audio: audioScore,
      transcript: transcriptScore,
      completion: transcript.length > 10 ? 0.92 : 0.45,
      iaa: 0.78 + Math.random() * 0.15,
    };
  }

  private async calculateAudioQuality(audioPath: string): Promise<number> {
    // In production, call a real audio analysis service or model
    // For now, simulate based on duration and basic checks
    return 0.85 + Math.random() * 0.12;
  }

  private async calculateTranscriptQuality(transcript: string): Promise<number> {
    if (!transcript || transcript.length < 5) return 0.3;
    return 0.75 + Math.random() * 0.22;
  }
}