/**
 * @tkllm/validators — Shared Zod validation schemas
 *
 * Runtime validation used by:
 *   - apps/api  (DTO validation via ValidationPipe)
 *   - apps/web-contributor  (form validation via react-hook-form)
 *   - apps/web-b2b          (form + API response validation)
 *   - services/*            (Kafka event payload validation)
 *
 * Every schema mirrors a type from @tkllm/types.
 * Naming: <Entity>Schema → inferred type: z.infer<typeof <Entity>Schema>
 */

import { z } from 'zod';
import {
    UserRole, UserStatus, Gender, AgeGroup, MoroccanRegion, DarijaDialect,
    Language, TaskType, TaskDomain, TaskDifficulty, TaskStatus, SubmissionStatus,
    RejectionReason, ConsentCategory, TransactionType, TransactionStatus,
    PaymentProvider, AudioMimeType, ReviewMethod, B2BPlan,
    DatasetType, DatasetFormat, DatasetLicense,
} from '@tkllm/types';

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

export const UUIDSchema = z
    .string()
    .uuid({ message: 'Must be a valid UUID v4' });

export const ISODateSchema = z
    .string()
    .datetime({ message: 'Must be an ISO 8601 UTC date string' });

/** Moroccan phone number — +212 prefix, 9 digits after country code */
export const MoroccanPhoneSchema = z
    .string()
    .regex(/^\+212[5-7]\d{8}$/, {
        message: 'Phone must be a valid Moroccan number (+212 6XXXXXXXX or +212 7XXXXXXXX)',
    });

export const EmailSchema = z
    .string()
    .email({ message: 'Must be a valid email address' })
    .toLowerCase()
    .trim();

export const PasswordSchema = z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(128, { message: 'Password must be at most 128 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one digit' });

export const PaginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ─────────────────────────────────────────────────────────────────────────────
// Enum schemas (generated from @tkllm/types enums)
// ─────────────────────────────────────────────────────────────────────────────

export const UserRoleSchema = z.nativeEnum(UserRole);
export const UserStatusSchema = z.nativeEnum(UserStatus);
export const GenderSchema = z.nativeEnum(Gender);
export const AgeGroupSchema = z.nativeEnum(AgeGroup);
export const MoroccanRegionSchema = z.nativeEnum(MoroccanRegion);
export const DarijaDialectSchema = z.nativeEnum(DarijaDialect);
export const LanguageSchema = z.nativeEnum(Language);
export const TaskTypeSchema = z.nativeEnum(TaskType);
export const TaskDomainSchema = z.nativeEnum(TaskDomain);
export const TaskDifficultySchema = z.nativeEnum(TaskDifficulty);
export const TaskStatusSchema = z.nativeEnum(TaskStatus);
export const SubmissionStatusSchema = z.nativeEnum(SubmissionStatus);
export const RejectionReasonSchema = z.nativeEnum(RejectionReason);
export const ConsentCategorySchema = z.nativeEnum(ConsentCategory);
export const TransactionTypeSchema = z.nativeEnum(TransactionType);
export const TransactionStatusSchema = z.nativeEnum(TransactionStatus);
export const PaymentProviderSchema = z.nativeEnum(PaymentProvider);
export const AudioMimeTypeSchema = z.nativeEnum(AudioMimeType);
export const ReviewMethodSchema = z.nativeEnum(ReviewMethod);
export const B2BPlanSchema = z.nativeEnum(B2BPlan);
export const DatasetTypeSchema = z.nativeEnum(DatasetType);
export const DatasetFormatSchema = z.nativeEnum(DatasetFormat);
export const DatasetLicenseSchema = z.nativeEnum(DatasetLicense);

// ─────────────────────────────────────────────────────────────────────────────
// Auth schemas
// ─────────────────────────────────────────────────────────────────────────────

export const RegisterSchema = z
    .object({
        email: EmailSchema.optional(),
        phone: MoroccanPhoneSchema.optional(),
        password: PasswordSchema,
        role: UserRoleSchema.default(UserRole.CONTRIBUTOR),
    })
    .refine(
        (data) => data.email !== undefined || data.phone !== undefined,
        { message: 'Either email or phone number is required', path: ['email'] },
    );

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z
    .object({
        email: EmailSchema.optional(),
        phone: MoroccanPhoneSchema.optional(),
        password: z.string().min(1, 'Password is required'),
    })
    .refine(
        (data) => data.email !== undefined || data.phone !== undefined,
        { message: 'Either email or phone number is required', path: ['email'] },
    );

export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const OtpVerifySchema = z.object({
    phone: MoroccanPhoneSchema,
    otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/),
});

export const ChangePasswordSchema = z
    .object({
        currentPassword: z.string().min(1),
        newPassword: PasswordSchema,
        confirmPassword: z.string().min(1),
    })
    .refine(
        (data) => data.newPassword === data.confirmPassword,
        { message: 'Passwords do not match', path: ['confirmPassword'] },
    );

// ─────────────────────────────────────────────────────────────────────────────
// Profile schemas
// ─────────────────────────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
    displayName: z.string().min(2).max(60).trim().optional(),
    region: MoroccanRegionSchema.optional(),
    ageGroup: AgeGroupSchema.optional(),
    gender: GenderSchema.optional(),
    nativeDialect: DarijaDialectSchema.optional(),
    firstLanguage: LanguageSchema.optional(),
    otherLanguages: z.array(LanguageSchema).max(5).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const ConsentSchema = z.object({
    category: ConsentCategorySchema,
    version: z.string().min(1).max(20),
    granted: z.boolean(),
});

export type ConsentInput = z.infer<typeof ConsentSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Task & submission schemas
// ─────────────────────────────────────────────────────────────────────────────

export const CreateTaskTemplateSchema = z.object({
    type: TaskTypeSchema,
    domain: TaskDomainSchema,
    difficulty: TaskDifficultySchema,
    language: LanguageSchema,
    promptText: z.string().max(500).optional(),
    promptArabic: z.string().max(500).optional(),
    instructions: z.string().min(10).max(2000),
    estimatedMinutes: z.number().int().min(1).max(60),
    baseRewardMad: z.number().min(0).max(100),
    maxRewardMad: z.number().min(0).max(500),
});

export type CreateTaskTemplateInput = z.infer<typeof CreateTaskTemplateSchema>;

/** Audio constraints matching the API upload rules */
export const AudioUploadConstraints = {
    maxSizeBytes: 50 * 1024 * 1024,  // 50 MB
    maxDurationSeconds: 300,               // 5 minutes
    minDurationSeconds: 1,
    allowedMimeTypes: Object.values(AudioMimeType),
    minSampleRate: 8_000,
} as const;

export const AudioMetadataSchema = z.object({
    mimeType: AudioMimeTypeSchema,
    sizeBytes: z
        .number()
        .int()
        .min(1024, 'File too small')
        .max(AudioUploadConstraints.maxSizeBytes, 'File exceeds 50 MB limit'),
    durationSeconds: z
        .number()
        .min(AudioUploadConstraints.minDurationSeconds, 'Recording too short')
        .max(AudioUploadConstraints.maxDurationSeconds, 'Recording exceeds 5 minute limit'),
    checksumSha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
});

export type AudioMetadataInput = z.infer<typeof AudioMetadataSchema>;

export const SubmitVoiceTaskSchema = z.object({
    taskId: UUIDSchema,
    storageKey: z.string().min(1).max(500),
    mimeType: AudioMimeTypeSchema,
    durationSeconds: z.number().min(1).max(300),
    sizeBytes: z.number().int().min(1),
    checksumSha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    transcript: z.string().max(5000).optional(),
});

export type SubmitVoiceTaskInput = z.infer<typeof SubmitVoiceTaskSchema>;

export const SubmitTextTaskSchema = z.object({
    taskId: UUIDSchema,
    label: z.string().max(200).optional(),
    translation: z.string().max(5000).optional(),
    sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']).optional(),
    entities: z
        .array(
            z.object({
                text: z.string().min(1),
                type: z.string().min(1),
                start: z.number().int().min(0),
                end: z.number().int().min(0),
            }),
        )
        .max(100)
        .optional(),
});

export type SubmitTextTaskInput = z.infer<typeof SubmitTextTaskSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Quality review schemas
// ─────────────────────────────────────────────────────────────────────────────

export const QualityReviewSchema = z.object({
    submissionId: UUIDSchema,
    outcome: z.enum(['approved', 'rejected', 're-record-requested', 'escalated']),
    audioScore: z.number().min(0).max(1).optional(),
    transcriptScore: z.number().min(0).max(1).optional(),
    completionScore: z.number().min(0).max(1).optional(),
    rejectionReason: RejectionReasonSchema.optional(),
    correctedTranscript: z.string().max(5000).optional(),
    notes: z.string().max(1000).optional(),
});

export type QualityReviewInput = z.infer<typeof QualityReviewSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Financial schemas
// ─────────────────────────────────────────────────────────────────────────────

export const PayoutRequestSchema = z.object({
    amountMad: z
        .number()
        .min(50, { message: 'Minimum payout is 50 MAD' })
        .max(5000, { message: 'Maximum single payout is 5,000 MAD' }),
    provider: PaymentProviderSchema,
    recipientPhone: MoroccanPhoneSchema.optional(),
    recipientEmail: EmailSchema.optional(),
});

export type PayoutRequestInput = z.infer<typeof PayoutRequestSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// B2B / Dataset schemas
// ─────────────────────────────────────────────────────────────────────────────

export const DatasetExportRequestSchema = z.object({
    type: DatasetTypeSchema,
    version: z.string().min(1).max(20).default('latest'),
    format: DatasetFormatSchema.default(DatasetFormat.PARQUET),
    includeAudio: z.boolean().default(false),
    license: DatasetLicenseSchema,
    domains: z.array(TaskDomainSchema).max(10).optional(),
    languages: z.array(LanguageSchema).max(10).optional(),
    regions: z.array(MoroccanRegionSchema).max(12).optional(),
    minQualityScore: z.number().min(0).max(1).default(0.75),
    maxRecords: z.number().int().min(1).max(1_000_000).optional(),
    dateRange: z
        .object({
            from: z.string().date(),
            to: z.string().date(),
        })
        .optional(),
    deliveryMethod: z.enum(['signed-url', 's3-push', 'hf-push']).default('signed-url'),
    notifyEmail: EmailSchema.optional(),
    webhookUrl: z.string().url().optional(),
});

export type DatasetExportRequestInput = z.infer<typeof DatasetExportRequestSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Kafka event payload schemas
// ─────────────────────────────────────────────────────────────────────────────

const KafkaEventBaseSchema = z.object({
    eventId: UUIDSchema,
    eventType: z.string(),
    version: z.string(),
    timestamp: ISODateSchema,
});

export const AudioUploadedEventSchema = KafkaEventBaseSchema.extend({
    eventType: z.literal('audio.uploaded'),
    audioId: UUIDSchema,
    contributorId: UUIDSchema,
    taskId: UUIDSchema,
    storageBucket: z.string(),
    storageKey: z.string(),
    sizeBytes: z.number(),
    mimeType: AudioMimeTypeSchema,
    durationSeconds: z.number(),
});

export const TranscriptionCompletedEventSchema = KafkaEventBaseSchema.extend({
    eventType: z.literal('transcription.completed'),
    audioId: UUIDSchema,
    contributorId: UUIDSchema,
    taskId: UUIDSchema,
    status: z.enum(['success', 'failed', 'partial']),
    transcript: z.string(),
    transcriptArabizi: z.string().nullable(),
    confidence: z.number().min(0).max(1),
    language: z.string(),
    rtf: z.number(),
});

export const QualityReviewCompletedEventSchema = KafkaEventBaseSchema.extend({
    eventType: z.literal('quality.review.completed'),
    audioId: UUIDSchema,
    contributorId: UUIDSchema,
    taskId: UUIDSchema,
    outcome: z.enum(['approved', 'rejected', 're-record-requested', 'escalated']),
    finalScore: z.number().min(0).max(1),
    rewardEligible: z.boolean(),
    datasetEligible: z.boolean(),
});

export const RewardIssuedEventSchema = KafkaEventBaseSchema.extend({
    eventType: z.literal('reward.issued'),
    rewardId: UUIDSchema,
    contributorId: UUIDSchema,
    audioId: UUIDSchema,
    amountMad: z.number().min(0),
    walletBalance: z.number(),
    idempotencyKey: z.string(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin / query schemas
// ─────────────────────────────────────────────────────────────────────────────

export const ListSubmissionsQuerySchema = PaginationSchema.extend({
    status: SubmissionStatusSchema.optional(),
    contributorId: UUIDSchema.optional(),
    domain: TaskDomainSchema.optional(),
    region: MoroccanRegionSchema.optional(),
    from: ISODateSchema.optional(),
    to: ISODateSchema.optional(),
    minScore: z.coerce.number().min(0).max(1).optional(),
    maxScore: z.coerce.number().min(0).max(1).optional(),
});

export type ListSubmissionsQuery = z.infer<typeof ListSubmissionsQuerySchema>;

export const LeaderboardQuerySchema = z.object({
    period: z.enum(['weekly', 'monthly', 'all-time']).default('weekly'),
    region: MoroccanRegionSchema.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type LeaderboardQuery = z.infer<typeof LeaderboardQuerySchema>;