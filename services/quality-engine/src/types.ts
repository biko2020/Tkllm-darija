export interface QualityReviewJob {
  jobId: string;
  submissionId: string;
  audioUrl: string;
  transcript?: string;
  taskId: string;
  contributorId: string;
  requestedAt: string;
}

export interface QualityReviewResult {
  submissionId: string;
  overallScore: number;
  audioScore: number;
  transcriptScore: number;
  completionScore: number;
  iaa: number;
  status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  reviewedAt: string;
  reviewerId?: string;
}

export interface ActiveLearningSample {
  submissionId: string;
  qualityScore: number;
  confidenceScore?: number;
  contributorId: string;
  transcript?: string;
}