export interface ContributorMetrics {
  userId: string;
  tasksSubmitted: number;
  tasksApproved: number;
  audioHours: number;
  earningsMad: number;
  streakDays: number;
}

export interface DatasetMetrics {
  datasetId: string;
  sizeRecords: number;
  sizeHours: number;
  qualityScore: number;
}

export interface GrowthMetrics {
  timestamp: Date;
  activeContributors: number;
  submissionsPerHour: number;
  payoutsMad: number;
}
