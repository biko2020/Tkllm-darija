/**
 * @tkllm/types — Shared TypeScript types & interfaces
 *
 * Single source of truth for domain entities used across:
 *   apps/api, apps/web-contributor, apps/web-b2b,
 *   services/*, and the ML workspace.
 *
 * Rules:
 *  - No runtime code (no class instances, no function implementations)
 *  - No external dependencies
 *  - Every entity mirrors its Prisma model exactly
 *  - Enums are string enums so they are safe across JSON boundaries
 */

// ─────────────────────────────────────────────────────────────────────────────
// Utility types
// ─────────────────────────────────────────────────────────────────────────────

export type UUID = string;
export type ISODateString = string; // ISO 8601 UTC

export interface Timestamps {
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export enum UserRole {
  CONTRIBUTOR = 'CONTRIBUTOR',
  ADMIN       = 'ADMIN',
  B2B_CLIENT  = 'B2B_CLIENT',
  REVIEWER    = 'REVIEWER',
}

export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE               = 'ACTIVE',
  SUSPENDED            = 'SUSPENDED',
  BANNED               = 'BANNED',
}

export enum Gender {
  MALE          = 'MALE',
  FEMALE        = 'FEMALE',
  NON_BINARY    = 'NON_BINARY',
  PREFER_NOT    = 'PREFER_NOT',
}

export enum AgeGroup {
  AGE_18_24 = '18-24',
  AGE_25_34 = '25-34',
  AGE_35_44 = '35-44',
  AGE_45_54 = '45-54',
  AGE_55_64 = '55-64',
  AGE_65_PLUS = '65+',
}

export enum MoroccanRegion {
  CASABLANCA_SETTAT      = 'CASABLANCA_SETTAT',
  RABAT_SALE_KENITRA     = 'RABAT_SALE_KENITRA',
  FES_MEKNES             = 'FES_MEKNES',
  MARRAKECH_SAFI         = 'MARRAKECH_SAFI',
  TANGER_TETOUAN_ALHOCEIMA = 'TANGER_TETOUAN_ALHOCEIMA',
  SOUSS_MASSA            = 'SOUSS_MASSA',
  ORIENTAL               = 'ORIENTAL',
  BENI_MELLAL_KHENIFRA   = 'BENI_MELLAL_KHENIFRA',
  DRAA_TAFILALET         = 'DRAA_TAFILALET',
  GUELMIM_OUED_NOUN      = 'GUELMIM_OUED_NOUN',
  LAAYOUNE_SAKIA_ALHAMRA = 'LAAYOUNE_SAKIA_ALHAMRA',
  DAKHLA_OUED_EDDAHAB    = 'DAKHLA_OUED_EDDAHAB',
}

export enum DarijaDialect {
  CASABLANCI = 'CASABLANCI',
  MARRAKCHI  = 'MARRAKCHI',
  FASSI      = 'FASSI',
  RBATI      = 'RBATI',
  SOUSS      = 'SOUSS',
  JEBLI      = 'JEBLI',
  SAHRAWI    = 'SAHRAWI',
  OTHER      = 'OTHER',
}

export enum Language {
  DARIJA     = 'darija',
  DARIJA_FR  = 'darija-fr',   // Code-switched Darija + French
  DARIJA_AR  = 'darija-ar',   // Code-switched Darija + MSA
  DARIJA_EN  = 'darija-en',   // Code-switched Darija + English
  TAMAZIGHT  = 'tamazight',
  MSA        = 'msa',         // Modern Standard Arabic
}

export enum TaskType {
  VOICE_RECORDING   = 'VOICE_RECORDING',
  TEXT_LABELING     = 'TEXT_LABELING',
  TRANSLATION       = 'TRANSLATION',
  SENTIMENT         = 'SENTIMENT',
  NER               = 'NER',
  IMAGE_DESCRIPTION = 'IMAGE_DESCRIPTION',
  VIDEO_DESCRIPTION = 'VIDEO_DESCRIPTION',
  TRANSCRIPT_CORRECTION = 'TRANSCRIPT_CORRECTION',
}

export enum TaskDomain {
  GENERAL     = 'GENERAL',
  BANKING     = 'BANKING',
  HEALTHCARE  = 'HEALTHCARE',
  ECOMMERCE   = 'ECOMMERCE',
  TOURISM     = 'TOURISM',
  LEGAL       = 'LEGAL',
  SOCIAL      = 'SOCIAL',
}

export enum TaskDifficulty {
  EASY   = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD   = 'HARD',
}

export enum TaskStatus {
  AVAILABLE    = 'AVAILABLE',
  ASSIGNED     = 'ASSIGNED',
  SUBMITTED    = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED     = 'APPROVED',
  REJECTED     = 'REJECTED',
  EXPIRED      = 'EXPIRED',
}

export enum SubmissionStatus {
  PENDING      = 'PENDING',
  TRANSCRIBING = 'TRANSCRIBING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED     = 'APPROVED',
  REJECTED     = 'REJECTED',
  FLAGGED      = 'FLAGGED',
}

export enum RejectionReason {
  BACKGROUND_NOISE     = 'BACKGROUND_NOISE',
  CLIPPING             = 'CLIPPING',
  WRONG_LANGUAGE       = 'WRONG_LANGUAGE',
  INCOMPLETE_PROMPT    = 'INCOMPLETE_PROMPT',
  TOO_SHORT            = 'TOO_SHORT',
  TOO_LONG             = 'TOO_LONG',
  PROFANITY            = 'PROFANITY',
  PII_DETECTED         = 'PII_DETECTED',
  DUPLICATE_SUBMISSION = 'DUPLICATE_SUBMISSION',
  INAUDIBLE            = 'INAUDIBLE',
  SCRIPTED_NOT_NATURAL = 'SCRIPTED_NOT_NATURAL',
  OTHER                = 'OTHER',
}

export enum ConsentCategory {
  AUDIO    = 'AUDIO',
  TEXT     = 'TEXT',
  METADATA = 'METADATA',
  LOCATION = 'LOCATION',
  BIOMETRIC = 'BIOMETRIC',
}

export enum TransactionType {
  REWARD   = 'REWARD',
  PAYOUT   = 'PAYOUT',
  REVERSAL = 'REVERSAL',
  BONUS    = 'BONUS',
  PENALTY  = 'PENALTY',
}

export enum TransactionStatus {
  PENDING   = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED    = 'FAILED',
  REVERSED  = 'REVERSED',
}

export enum PaymentProvider {
  ORANGE_MONEY = 'ORANGE_MONEY',
  INWI_MONEY   = 'INWI_MONEY',
  CMI          = 'CMI',
  PAYPAL       = 'PAYPAL',
  WISE         = 'WISE',
}

export enum AudioMimeType {
  WEBM = 'audio/webm',
  MP4  = 'audio/mp4',
  OGG  = 'audio/ogg',
  WAV  = 'audio/wav',
  M4A  = 'audio/x-m4a',
  FLAC = 'audio/flac',
}

export enum ReviewMethod {
  AUTOMATED  = 'AUTOMATED',
  HUMAN      = 'HUMAN',
  CONSENSUS  = 'CONSENSUS',
}

// ─────────────────────────────────────────────────────────────────────────────
// Core domain entities (mirror Prisma models)
// ─────────────────────────────────────────────────────────────────────────────

export interface User extends Timestamps {
  id:           UUID;
  email:        string | null;
  phone:        string | null;       // E.164 format (+212...)
  role:         UserRole;
  status:       UserStatus;
  supabaseId:   string | null;
  lastLoginAt:  ISODateString | null;
}

export interface ContributorProfile extends Timestamps {
  id:              UUID;
  userId:          UUID;
  displayName:     string;
  region:          MoroccanRegion | null;
  ageGroup:        AgeGroup | null;
  gender:          Gender | null;
  nativeDialect:   DarijaDialect | null;
  firstLanguage:   Language | null;
  otherLanguages:  Language[];
  completeness:    number;           // 0–100 profile completeness score
  reputationScore: number;           // 0–100 rolling 30-day quality average
  totalTasks:      number;
  totalEarnings:   number;           // MAD, 2 decimal places
  streakDays:      number;
  lastActiveAt:    ISODateString | null;
}

export interface ConsentRecord extends Timestamps {
  id:          UUID;
  userId:      UUID;
  category:    ConsentCategory;
  version:     string;               // Consent form version (e.g. "v2.1")
  grantedAt:   ISODateString;
  revokedAt:   ISODateString | null;
  ipAddress:   string | null;        // Pseudonymised (last octet zeroed)
  userAgent:   string | null;
}

export interface TaskTemplate extends Timestamps {
  id:               UUID;
  type:             TaskType;
  domain:           TaskDomain;
  difficulty:       TaskDifficulty;
  language:         Language;
  promptText:       string | null;   // The spoken/written prompt
  promptArabic:     string | null;   // Arabic script version
  instructions:     string;
  estimatedMinutes: number;
  baseRewardMad:    number;
  maxRewardMad:     number;
  isActive:         boolean;
  totalAssigned:    number;
  totalApproved:    number;
}

export interface TaskAssignment extends Timestamps {
  id:            UUID;
  taskId:        UUID;
  contributorId: UUID;
  status:        TaskStatus;
  assignedAt:    ISODateString;
  submittedAt:   ISODateString | null;
  expiresAt:     ISODateString;
  campaignId:    UUID | null;
}

export interface AudioSubmission extends Timestamps {
  id:              UUID;
  taskId:          UUID;
  contributorId:   UUID;
  assignmentId:    UUID;
  status:          SubmissionStatus;
  storageBucket:   string;
  storageKey:      string;           // S3/R2 object key — never the full URL
  mimeType:        AudioMimeType;
  durationSeconds: number;
  sizeBytes:       number;
  checksumSha256:  string;
  transcript:      string | null;    // ASR output
  transcriptArabizi: string | null;
  confidenceScore: number | null;    // 0–1 Whisper confidence
  qualityScore:    number | null;    // 0–1 composite quality
  snrDb:           number | null;
  rejectionReason: RejectionReason | null;
}

export interface QualityReview extends Timestamps {
  id:              UUID;
  submissionId:    UUID;
  reviewerId:      UUID | null;      // null = automated
  method:          ReviewMethod;
  overallScore:    number;           // 0–1
  audioScore:      number | null;
  transcriptScore: number | null;
  completionScore: number | null;
  outcome:         SubmissionStatus;
  notes:           string | null;
  durationSeconds: number | null;    // Time reviewer spent
  iaa:             number | null;    // Inter-annotator agreement (Cohen's kappa)
}

export interface Wallet extends Timestamps {
  id:              UUID;
  contributorId:   UUID;
  balanceMad:      number;           // Current spendable balance
  pendingMad:      number;           // Approved but not yet paid out
  lifetimeMad:     number;           // Total ever earned
  lastPayoutAt:    ISODateString | null;
}

export interface Transaction extends Timestamps {
  id:              UUID;
  walletId:        UUID;
  contributorId:   UUID;
  type:            TransactionType;
  status:          TransactionStatus;
  amountMad:       number;
  provider:        PaymentProvider | null;
  gatewayRef:      string | null;    // Provider transaction ID
  idempotencyKey:  string;           // Prevents double-processing
  submissionId:    UUID | null;      // Linked submission (for rewards)
  metadata:        Record<string, unknown> | null;
}

export interface Campaign extends Timestamps {
  id:             UUID;
  name:           string;
  description:    string;
  sponsorId:      UUID | null;       // B2B client who funded this campaign
  domain:         TaskDomain;
  language:       Language;
  targetHours:    number;
  collectedHours: number;
  rewardMultiplier: number;          // e.g. 1.5 = 50% bonus
  startDate:      ISODateString;
  endDate:        ISODateString | null;
  isActive:       boolean;
}

export interface B2BClient extends Timestamps {
  id:          UUID;
  userId:      UUID;
  companyName: string;
  plan:        B2BPlan;
  apiKey:      string;               // Hashed in DB — shown once on creation
  monthlyQuota: number;             // Max records downloadable per month
  usedQuota:   number;
  webhookUrl:  string | null;
}

export enum B2BPlan {
  STARTER      = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE   = 'ENTERPRISE',
  RESEARCH     = 'RESEARCH',
}

export interface Dataset extends Timestamps {
  id:          UUID;
  name:        string;
  description: string;
  version:     string;              // e.g. "v1.2"
  type:        DatasetType;
  language:    Language;
  domain:      TaskDomain | null;
  sizeRecords: number;
  sizeHours:   number;
  storagePath: string;             // S3/R2 prefix
  format:      DatasetFormat;
  license:     DatasetLicense;
  isPublished: boolean;
  publishedAt: ISODateString | null;
  qualityScore: number | null;
}

export enum DatasetType {
  SPEECH_TO_TEXT  = 'SPEECH_TO_TEXT',
  PARALLEL_CORPUS = 'PARALLEL_CORPUS',
  ANNOTATED_FULL  = 'ANNOTATED_FULL',
  CUSTOM          = 'CUSTOM',
}

export enum DatasetFormat {
  PARQUET    = 'PARQUET',
  JSONL      = 'JSONL',
  CSV        = 'CSV',
  HF_DATASET = 'HF_DATASET',
}

export enum DatasetLicense {
  COMMERCIAL    = 'COMMERCIAL',
  RESEARCH_ONLY = 'RESEARCH_ONLY',
  CC_BY_4       = 'CC_BY_4',
}

// ─────────────────────────────────────────────────────────────────────────────
// Kafka event payloads (mirror messaging/queues/schemas/*.json)
// ─────────────────────────────────────────────────────────────────────────────

export interface KafkaEventBase {
  eventId:   UUID;
  eventType: string;
  version:   string;
  timestamp: ISODateString;
}

export interface AudioUploadedEvent extends KafkaEventBase {
  eventType:     'audio.uploaded';
  audioId:       UUID;
  contributorId: UUID;
  taskId:        UUID;
  storageBucket: string;
  storageKey:    string;
  sizeBytes:     number;
  mimeType:      AudioMimeType;
  durationSeconds: number;
}

export interface TranscriptionCompletedEvent extends KafkaEventBase {
  eventType:     'transcription.completed';
  audioId:       UUID;
  contributorId: UUID;
  taskId:        UUID;
  status:        'success' | 'failed' | 'partial';
  transcript:    string;
  transcriptArabizi: string | null;
  confidence:    number;
  language:      string;
  rtf:           number;
}

export interface QualityReviewCompletedEvent extends KafkaEventBase {
  eventType:      'quality.review.completed';
  audioId:        UUID;
  contributorId:  UUID;
  taskId:         UUID;
  outcome:        'approved' | 'rejected' | 're-record-requested' | 'escalated';
  finalScore:     number;
  rewardEligible: boolean;
  datasetEligible: boolean;
}

export interface RewardIssuedEvent extends KafkaEventBase {
  eventType:     'reward.issued';
  rewardId:      UUID;
  contributorId: UUID;
  audioId:       UUID;
  amountMad:     number;
  walletBalance: number;
  idempotencyKey: string;
}

export interface PaymentProcessedEvent extends KafkaEventBase {
  eventType:     'payment.processed';
  paymentId:     UUID;
  contributorId: UUID;
  provider:      PaymentProvider;
  amountMad:     number;
  status:        'success' | 'failed' | 'pending';
  gatewayRef:    string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API request / response DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface RegisterDto {
  email?:    string;
  phone?:    string;
  password:  string;
  role?:     UserRole;
}

export interface LoginDto {
  email?:   string;
  phone?:   string;
  password: string;
}

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    number;   // seconds
}

export interface SubmitTaskDto {
  taskId:   UUID;
  type:     TaskType;
  // For voice recordings
  audioKey?:    string;
  transcript?:  string;
  // For text tasks
  label?:       string;
  translation?: string;
  sentiment?:   'positive' | 'negative' | 'neutral' | 'mixed';
  entities?:    Array<{ text: string; type: string; start: number; end: number }>;
}

export interface UploadPresignedUrlResponse {
  uploadUrl:  string;    // PUT URL to upload audio directly to S3/R2
  objectKey:  string;    // Key to reference in submit payload
  expiresAt:  ISODateString;
  maxBytes:   number;
}

export interface LeaderboardEntry {
  rank:            number;
  contributorId:   UUID;
  displayName:     string;
  region:          MoroccanRegion | null;
  weeklyEarnings:  number;
  tasksCompleted:  number;
  qualityScore:    number;
}

export interface DashboardStats {
  totalContributors:  number;
  activeToday:        number;
  totalHoursCollected: number;
  totalTasksApproved: number;
  avgQualityScore:    number;
  totalPayoutsMad:    number;
  datasetVersions:    number;
}