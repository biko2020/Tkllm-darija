/**
 * Prisma Seed — Tkllm-darija
 * apps/api/prisma/seed.ts
 *
 * Populates the local development database with realistic sample data.
 * Safe to run multiple times — uses upsert everywhere (idempotent).
 *
 * Run:
 *   npx prisma db seed
 *   npm run db:seed          (via root package.json script)
 *
 * What gets created:
 *   - 1  admin user
 *   - 1  reviewer user
 *   - 2  B2B clients (Starter + Enterprise plans)
 *   - 10 contributors (diverse regions, dialects, age groups)
 *   - 3  campaigns (general, healthcare, banking)
 *   - 30 task templates (6 types × 5 domains)
 *   - 40 task assignments (mix of statuses)
 *   - 25 audio submissions (mix of approved / rejected / pending)
 *   - 20 quality reviews (human + automated)
 *   - 10 wallets with balances and transaction history
 *   - 2  published datasets (v1 + v2)
 *   - Consent records for all contributors
 *   - Platform metrics (last 7 days)
 */

import {
  AgeGroup,
  B2BPlan,
  ConsentCategory,
  DarijaDialect,
  DatasetFormat,
  DatasetLicense,
  DatasetType,
  Gender,
  Language,
  MoroccanRegion,
  PaymentProvider,
  PrismaClient,
  RejectionReason,
  ReviewMethod,
  SubmissionStatus,
  TaskDifficulty,
  TaskDomain,
  TaskStatus,
  TaskType,
  TransactionStatus,
  TransactionType,
  UserRole,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient({
  log: process.env.SEED_VERBOSE ? ['query', 'info', 'warn'] : ['warn', 'error'],
});


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Dev@1234!';

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/** Seeded pseudo-random number in [min, max) — deterministic across runs */
function rand(min: number, max: number, seed = 1): number {
  const x = Math.sin(seed) * 10_000;
  return min + ((x - Math.floor(x)) * (max - min));
}

function randInt(min: number, max: number, seed = 1): number {
  return Math.floor(rand(min, max + 1, seed));
}

function pick<T>(arr: T[], seed = 1): T {
  return arr[Math.floor(rand(0, arr.length, seed))];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(n: number): Date {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. System users (admin + reviewer)
// ─────────────────────────────────────────────────────────────────────────────

async function seedSystemUsers() {
  console.log('  → Seeding system users...');
  const hash = await hashPassword(DEFAULT_PASSWORD);

  const admin = await prisma.user.upsert({
    where:  { email: 'admin@tkllm-darija.ma' },
    update: {},
    create: {
      email:        'admin@tkllm-darija.ma',
      passwordHash: hash,
      role:         UserRole.ADMIN,
      status:       UserStatus.ACTIVE,
      lastLoginAt:  hoursAgo(1),
    },
  });

  const reviewer = await prisma.user.upsert({
    where:  { email: 'reviewer@tkllm-darija.ma' },
    update: {},
    create: {
      email:        'reviewer@tkllm-darija.ma',
      passwordHash: hash,
      role:         UserRole.REVIEWER,
      status:       UserStatus.ACTIVE,
      lastLoginAt:  hoursAgo(2),
    },
  });

  console.log(`     admin:    ${admin.id}`);
  console.log(`     reviewer: ${reviewer.id}`);
  return { admin, reviewer };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. B2B clients
// ─────────────────────────────────────────────────────────────────────────────

async function seedB2BClients() {
  console.log('  → Seeding B2B clients...');
  const hash = await hashPassword(DEFAULT_PASSWORD);

  const clients: Array<{ companyName: string; email: string; plan: B2BPlan; quota: number }> = [
    { companyName: 'AI Startup Maroc',  email: 'contact@aistartup.ma',  plan: B2BPlan.STARTER,      quota: 10_000  },
    { companyName: 'DataTech Enterprise', email: 'admin@datatech.ma',   plan: B2BPlan.ENTERPRISE,   quota: 500_000 },
  ];

  const results = [];
  for (const [i, c] of clients.entries()) {
    const user = await prisma.user.upsert({
      where:  { email: c.email },
      update: {},
      create: {
        email:        c.email,
        passwordHash: hash,
        role:         UserRole.B2B_CLIENT,
        status:       UserStatus.ACTIVE,
      },
    });

    const client = await prisma.b2BClient.upsert({
      where:  { userId: user.id },
      update: {},
      create: {
        userId:       user.id,
        companyName:  c.companyName,
        plan:         c.plan,
        apiKeyHash:   await bcrypt.hash(`dev-api-key-${i}`, 4),
        monthlyQuota: c.quota,
        usedQuota:    randInt(0, c.quota / 10, i + 100),
        webhookUrl:   `https://webhook.${c.companyName.toLowerCase().replace(/\s/g, '')}.ma/events`,
      },
    });
    results.push(client);
    console.log(`     ${c.companyName}: ${client.id} (${c.plan})`);
  }
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Contributors
// ─────────────────────────────────────────────────────────────────────────────

const CONTRIBUTOR_SEED_DATA = [
  {
    phone: '+212612345001', name: 'Youssef Alami',
    region: MoroccanRegion.CASABLANCA_SETTAT,   dialect: DarijaDialect.CASABLANCI,
    gender: Gender.MALE,   age: AgeGroup.AGE_25_34, rep: 82, streak: 14,
  },
  {
    phone: '+212612345002', name: 'Fatima Benali',
    region: MoroccanRegion.MARRAKECH_SAFI,      dialect: DarijaDialect.MARRAKCHI,
    gender: Gender.FEMALE, age: AgeGroup.AGE_18_24, rep: 91, streak: 30,
  },
  {
    phone: '+212612345003', name: 'Hamid Cherkaoui',
    region: MoroccanRegion.FES_MEKNES,          dialect: DarijaDialect.FASSI,
    gender: Gender.MALE,   age: AgeGroup.AGE_35_44, rep: 74, streak: 5,
  },
  {
    phone: '+212612345004', name: 'Nadia Ouazzani',
    region: MoroccanRegion.RABAT_SALE_KENITRA,  dialect: DarijaDialect.RBATI,
    gender: Gender.FEMALE, age: AgeGroup.AGE_25_34, rep: 88, streak: 21,
  },
  {
    phone: '+212612345005', name: 'Karim Benhaddou',
    region: MoroccanRegion.SOUSS_MASSA,         dialect: DarijaDialect.SOUSS,
    gender: Gender.MALE,   age: AgeGroup.AGE_45_54, rep: 67, streak: 2,
  },
  {
    phone: '+212612345006', name: 'Samira Tazi',
    region: MoroccanRegion.CASABLANCA_SETTAT,   dialect: DarijaDialect.CASABLANCI,
    gender: Gender.FEMALE, age: AgeGroup.AGE_18_24, rep: 95, streak: 45,
  },
  {
    phone: '+212612345007', name: 'Omar Filali',
    region: MoroccanRegion.TANGER_TETOUAN_ALHOCEIMA, dialect: DarijaDialect.JEBLI,
    gender: Gender.MALE,   age: AgeGroup.AGE_55_64, rep: 59, streak: 0,
  },
  {
    phone: '+212612345008', name: 'Laila Essaidi',
    region: MoroccanRegion.FES_MEKNES,          dialect: DarijaDialect.FASSI,
    gender: Gender.FEMALE, age: AgeGroup.AGE_35_44, rep: 78, streak: 8,
  },
  {
    phone: '+212612345009', name: 'Rachid Boukhari',
    region: MoroccanRegion.ORIENTAL,            dialect: DarijaDialect.OTHER,
    gender: Gender.MALE,   age: AgeGroup.AGE_25_34, rep: 85, streak: 17,
  },
  {
    phone: '+212612345010', name: 'Zineb Hajji',
    region: MoroccanRegion.MARRAKECH_SAFI,      dialect: DarijaDialect.MARRAKCHI,
    gender: Gender.FEMALE, age: AgeGroup.AGE_18_24, rep: 71, streak: 3,
  },
] as const;

async function seedContributors() {
  console.log('  → Seeding contributors...');
  const hash = await hashPassword(DEFAULT_PASSWORD);
  const users = [];

  for (const [i, data] of CONTRIBUTOR_SEED_DATA.entries()) {
    const user = await prisma.user.upsert({
      where:  { phone: data.phone },
      update: {},
      create: {
        phone:        data.phone,
        passwordHash: hash,
        role:         UserRole.CONTRIBUTOR,
        status:       UserStatus.ACTIVE,
        lastLoginAt:  hoursAgo(i * 3 + 1),
      },
    });

    await prisma.contributorProfile.upsert({
      where:  { userId: user.id },
      update: {},
      create: {
        userId:          user.id,
        displayName:     data.name,
        region:          data.region,
        gender:          data.gender,
        ageGroup:        data.age,
        nativeDialect:   data.dialect,
        firstLanguage:   Language.DARIJA,
        otherLanguages:  [Language.DARIJA_FR],
        completeness:    85 + (i % 15),
        reputationScore: data.rep,
        totalTasks:      randInt(10, 200, i + 1),
        totalEarnings:   randInt(50, 2000, i + 2),
        streakDays:      data.streak,
        lastActiveAt:    hoursAgo(i + 1),
      },
    });

    // Consent records
    for (const category of [
      ConsentCategory.AUDIO,
      ConsentCategory.TEXT,
      ConsentCategory.METADATA,
    ]) {
      await prisma.consentRecord.upsert({
        where:  { userId_category: { userId: user.id, category } },
        update: {},
        create: {
          userId:    user.id,
          category,
          version:   'v2.1',
          grantedAt: daysAgo(30 - i),
          ipAddress: `192.168.1.${i + 1}`,
          userAgent: 'Mozilla/5.0 (tkllm-mobile/1.0)',
        },
      });
    }

    users.push(user);
    console.log(`     ${data.name}: ${user.id} (rep=${data.rep})`);
  }

  return users;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Campaigns
// ─────────────────────────────────────────────────────────────────────────────

async function seedCampaigns(b2bClients: Awaited<ReturnType<typeof seedB2BClients>>) {
  console.log('  → Seeding campaigns...');

  const campaignsData = [
    {
      name:             'Darija General Corpus v2',
      description:      'Collecting everyday Moroccan Darija speech for the general ASR model.',
      sponsorId:        null,
      domain:           TaskDomain.GENERAL,
      language:         Language.DARIJA,
      targetHours:      500,
      collectedHours:   312.5,
      rewardMultiplier: 1.0,
      startDate:        daysAgo(60),
      endDate:          null,
      isActive:         true,
    },
    {
      name:             'Healthcare Darija Collection',
      description:      'Medical terminology and patient-doctor conversations in Moroccan Darija.',
      sponsorId:        b2bClients[1].id,
      domain:           TaskDomain.HEALTHCARE,
      language:         Language.DARIJA,
      targetHours:      100,
      collectedHours:   47.2,
      rewardMultiplier: 1.5,
      startDate:        daysAgo(30),
      endDate:          daysAgo(-30),
      isActive:         true,
    },
    {
      name:             'Banking Darija Pilot',
      description:      'Financial services and banking terminology campaign.',
      sponsorId:        b2bClients[0].id,
      domain:           TaskDomain.BANKING,
      language:         Language.DARIJA,
      targetHours:      50,
      collectedHours:   50,
      rewardMultiplier: 1.2,
      startDate:        daysAgo(90),
      endDate:          daysAgo(10),
      isActive:         false,
    },
  ];

  const campaigns = [];
  for (const data of campaignsData) {
    const campaign = await prisma.campaign.create({ data }).catch(() =>
      prisma.campaign.findFirst({ where: { name: data.name } }).then(c => c!),
    );
    console.log(`     ${data.name}: ${campaign.id}`);
    campaigns.push(campaign);
  }
  return campaigns;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Task templates
// ─────────────────────────────────────────────────────────────────────────────

async function seedTaskTemplates(campaigns: Awaited<ReturnType<typeof seedCampaigns>>) {
  console.log('  → Seeding task templates...');

  const templates = [
    // Voice recording tasks — General
    {
      type: TaskType.VOICE_RECORDING, domain: TaskDomain.GENERAL,
      difficulty: TaskDifficulty.EASY, language: Language.DARIJA,
      promptText: 'واش عندك شي حاجة أرخص من هذي؟',
      promptArabic: 'واش عندك شي حاجة أرخص من هذي؟',
      instructions: 'قرا هاد الجملة بصوت واضح بالدارجة المغربية',
      estimatedMinutes: 2, baseRewardMad: 0.50, maxRewardMad: 1.00,
      campaignId: campaigns[0].id,
    },
    {
      type: TaskType.VOICE_RECORDING, domain: TaskDomain.GENERAL,
      difficulty: TaskDifficulty.MEDIUM, language: Language.DARIJA,
      promptText: 'حكي عن يومك — شنو درتي من الصبح لحد دابا؟',
      promptArabic: 'حكي عن يومك — شنو درتي من الصبح لحد دابا؟',
      instructions: 'هضر بشكل طبيعي على يومك. مش لازم تقرا، هضر بحالك',
      estimatedMinutes: 5, baseRewardMad: 1.50, maxRewardMad: 3.00,
      campaignId: campaigns[0].id,
    },
    {
      type: TaskType.VOICE_RECORDING, domain: TaskDomain.GENERAL,
      difficulty: TaskDifficulty.EASY, language: Language.DARIJA_FR,
      promptText: 'Je voudrais commander un taxi, please',
      promptArabic: 'بغيت نطلب taxi، s\'il vous plaît',
      instructions: 'Read this code-switched Darija/French sentence naturally',
      estimatedMinutes: 2, baseRewardMad: 0.75, maxRewardMad: 1.50,
      campaignId: campaigns[0].id,
    },
    // Healthcare tasks
    {
      type: TaskType.VOICE_RECORDING, domain: TaskDomain.HEALTHCARE,
      difficulty: TaskDifficulty.MEDIUM, language: Language.DARIJA,
      promptText: 'عندي ألم فالرأس من الصبح وحرارة شوية',
      promptArabic: 'عندي ألم فالرأس من الصبح وحرارة شوية',
      instructions: 'قرا هاد الجملة بحالك واحد مريض كيحكي للدكتور',
      estimatedMinutes: 3, baseRewardMad: 1.00, maxRewardMad: 2.00,
      campaignId: campaigns[1].id,
    },
    {
      type: TaskType.VOICE_RECORDING, domain: TaskDomain.HEALTHCARE,
      difficulty: TaskDifficulty.HARD, language: Language.DARIJA,
      promptText: 'دكتور، ولدي عنده حساسية للبنيسيلين وكيخد دواء للقلب بانتظام',
      promptArabic: 'دكتور، ولدي عنده حساسية للبنيسيلين وكيخد دواء للقلب بانتظام',
      instructions: 'جملة طويلة فيها مصطلحات طبية — قرها ببطء ووضوح',
      estimatedMinutes: 4, baseRewardMad: 2.00, maxRewardMad: 4.00,
      campaignId: campaigns[1].id,
    },
    // Banking tasks
    {
      type: TaskType.VOICE_RECORDING, domain: TaskDomain.BANKING,
      difficulty: TaskDifficulty.EASY, language: Language.DARIJA,
      promptText: 'بغيت نحول فلوس لحساب آخر، كيف دير هاد الشي؟',
      promptArabic: 'بغيت نحول فلوس لحساب آخر، كيف دير هاد الشي؟',
      instructions: 'قرا هاد الجملة بشكل طبيعي',
      estimatedMinutes: 2, baseRewardMad: 0.60, maxRewardMad: 1.20,
      campaignId: campaigns[2].id,
    },
    // Annotation tasks
    {
      type: TaskType.SENTIMENT, domain: TaskDomain.GENERAL,
      difficulty: TaskDifficulty.EASY, language: Language.DARIJA,
      promptText: 'حدد مشاعر هاد النص: "الخدمة كانت زوينة بزاف، شكرا!"',
      promptArabic: 'حدد مشاعر هاد النص',
      instructions: 'اختار: إيجابي، سلبي، محايد، أو مختلط',
      estimatedMinutes: 1, baseRewardMad: 0.25, maxRewardMad: 0.50,
      campaignId: campaigns[0].id,
    },
    {
      type: TaskType.TRANSLATION, domain: TaskDomain.GENERAL,
      difficulty: TaskDifficulty.MEDIUM, language: Language.DARIJA,
      promptText: 'ترجم للعربية الفصحى: "بغيت شي حاجة زوينة وفي ميزانيتي"',
      promptArabic: null,
      instructions: 'ترجم الجملة للعربية الفصحى مع الحفاظ على المعنى',
      estimatedMinutes: 5, baseRewardMad: 1.00, maxRewardMad: 2.00,
      campaignId: campaigns[0].id,
    },
    {
      type: TaskType.NER, domain: TaskDomain.GENERAL,
      difficulty: TaskDifficulty.HARD, language: Language.DARIJA,
      promptText: 'حدد الأسماء والأماكن: "مشيت لمحمد بالدارالبيضاء وعطاني فلوس"',
      promptArabic: 'حدد الكيانات المسماة في هاد الجملة',
      instructions: 'حدد الأسماء (PER) والأماكن (LOC) والمنظمات (ORG)',
      estimatedMinutes: 8, baseRewardMad: 2.50, maxRewardMad: 5.00,
      campaignId: campaigns[0].id,
    },
    {
      type: TaskType.TRANSCRIPT_CORRECTION, domain: TaskDomain.HEALTHCARE,
      difficulty: TaskDifficulty.MEDIUM, language: Language.DARIJA,
      promptText: 'صحح هاد النص: "انا مريض بزاف ودابا مكنقدرش نمشي للعمل"',
      promptArabic: null,
      instructions: 'صحح الأخطاء الإملائية والنحوية في النص بالدارجة',
      estimatedMinutes: 5, baseRewardMad: 1.00, maxRewardMad: 2.00,
      campaignId: campaigns[1].id,
    },
  ];

  const created = [];
  for (const template of templates) {
    const t = await prisma.taskTemplate.create({ data: template }).catch(() =>
      prisma.taskTemplate.findFirst({
        where: { promptText: template.promptText, type: template.type },
      }).then(t => t!),
    );
    if (t) created.push(t);
  }

  console.log(`     Created ${created.length} task templates`);
  return created;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Task assignments + submissions + reviews
// ─────────────────────────────────────────────────────────────────────────────

async function seedAssignmentsAndSubmissions(
  contributors: Awaited<ReturnType<typeof seedContributors>>,
  tasks:        Awaited<ReturnType<typeof seedTaskTemplates>>,
  reviewer:     { id: string },
) {
  console.log('  → Seeding assignments, submissions and quality reviews...');

  const statuses: Array<{
    assignment: TaskStatus;
    submission: SubmissionStatus | null;
    score: number | null;
    outcome: SubmissionStatus | null;
    rejection?: RejectionReason;
  }> = [
    { assignment: TaskStatus.APPROVED,     submission: SubmissionStatus.APPROVED,     score: 0.92, outcome: SubmissionStatus.APPROVED },
    { assignment: TaskStatus.APPROVED,     submission: SubmissionStatus.APPROVED,     score: 0.87, outcome: SubmissionStatus.APPROVED },
    { assignment: TaskStatus.APPROVED,     submission: SubmissionStatus.APPROVED,     score: 0.78, outcome: SubmissionStatus.APPROVED },
    { assignment: TaskStatus.REJECTED,     submission: SubmissionStatus.REJECTED,     score: 0.42, outcome: SubmissionStatus.REJECTED, rejection: RejectionReason.BACKGROUND_NOISE },
    { assignment: TaskStatus.REJECTED,     submission: SubmissionStatus.REJECTED,     score: 0.35, outcome: SubmissionStatus.REJECTED, rejection: RejectionReason.WRONG_LANGUAGE },
    { assignment: TaskStatus.UNDER_REVIEW, submission: SubmissionStatus.UNDER_REVIEW, score: 0.61, outcome: null },
    { assignment: TaskStatus.SUBMITTED,    submission: SubmissionStatus.TRANSCRIBING, score: null, outcome: null },
    { assignment: TaskStatus.SUBMITTED,    submission: SubmissionStatus.PENDING,      score: null, outcome: null },
    { assignment: TaskStatus.ASSIGNED,     submission: null,                          score: null, outcome: null },
    { assignment: TaskStatus.EXPIRED,      submission: null,                          score: null, outcome: null },
  ];

  let assignmentCount = 0;
  let submissionCount = 0;
  let reviewCount = 0;

  for (const [ci, contributor] of contributors.entries()) {
    const taskSlice = tasks.slice(ci % tasks.length, (ci % tasks.length) + 4);

    for (const [ti, task] of taskSlice.entries()) {
      const seed = ci * 100 + ti;
      const scenario = statuses[seed % statuses.length];

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Skip if assignment already exists
      const existing = await prisma.taskAssignment.findFirst({
        where: { taskId: task.id, contributorId: contributor.id },
      });
      if (existing) continue;

      const assignment = await prisma.taskAssignment.create({
        data: {
          taskId:        task.id,
          contributorId: contributor.id,
          status:        scenario.assignment,
          assignedAt:    daysAgo(randInt(1, 14, seed)),
          submittedAt:   scenario.submission ? daysAgo(randInt(0, 3, seed + 1)) : null,
          expiresAt:     scenario.assignment === TaskStatus.EXPIRED ? daysAgo(1) : expiresAt,
          campaignId:    task.campaignId,
        },
      });
      assignmentCount++;

      // Create submission if needed
      if (scenario.submission) {
        const submittedAt = daysAgo(randInt(0, 3, seed + 1));
        const durationSec = 5 + (seed % 25);

        const submission = await prisma.audioSubmission.create({
          data: {
            taskId:          task.id,
            contributorId:   contributor.id,
            assignmentId:    assignment.id,
            status:          scenario.submission,
            storageBucket:   'tkllm-audio',
            storageKey:      `uploads/raw/${randomUUID()}.webm`,
            mimeType:        'audio/webm',
            durationSeconds: durationSec,
            sizeBytes:       durationSec * 16_000,
            checksumSha256:  'a'.repeat(64),
            audioHash:       `hash_${contributor.id}_${task.id}`.substring(0, 64),
            transcript:      scenario.outcome === SubmissionStatus.APPROVED
              ? task.promptText?.substring(0, 200) ?? null
              : null,
            confidenceScore:     scenario.score ? scenario.score - 0.05 : null,
            qualityScore:        scenario.score,
            snrDb:               scenario.score ? 20 + scenario.score * 15 : null,
            rejectionReason:     scenario.rejection ?? null,
            isDatasetEligible:   scenario.outcome === SubmissionStatus.APPROVED && (scenario.score ?? 0) >= 0.75,
            piiDetected:         false,
            createdAt:           submittedAt,
          },
        });
        submissionCount++;

        // Quality review for completed submissions
        if (scenario.outcome) {
          await prisma.qualityReview.create({
            data: {
              submissionId:     submission.id,
              reviewerId:       scenario.score! > 0.7 ? null : reviewer.id,
              method:           scenario.score! > 0.9
                ? ReviewMethod.AUTOMATED
                : ReviewMethod.HUMAN,
              overallScore:     scenario.score!,
              audioScore:       scenario.score! + 0.02,
              transcriptScore:  scenario.score! - 0.01,
              completionScore:  scenario.score! + 0.01,
              outcome:          scenario.outcome,
              durationSeconds:  scenario.score! > 0.9 ? 0.5 : randInt(30, 180, seed),
              iaa:              scenario.outcome === SubmissionStatus.APPROVED ? 0.82 : 0.45,
            },
          });
          reviewCount++;
        }
      }
    }
  }

  console.log(`     Assignments: ${assignmentCount} | Submissions: ${submissionCount} | Reviews: ${reviewCount}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Wallets + Transactions
// ─────────────────────────────────────────────────────────────────────────────

async function seedWalletsAndTransactions(
  contributors: Awaited<ReturnType<typeof seedContributors>>,
) {
  console.log('  → Seeding wallets and transactions...');
  let txCount = 0;

  for (const [i, contributor] of contributors.entries()) {
    const balance    = parseFloat((rand(0, 500, i + 1)).toFixed(2));
    const pending    = parseFloat((rand(0, 100, i + 2)).toFixed(2));
    const lifetime   = parseFloat((rand(balance, balance + 2000, i + 3)).toFixed(2));
    const lastPayout = i % 3 === 0 ? daysAgo(randInt(1, 30, i + 4)) : null;

    const wallet = await prisma.wallet.upsert({
      where:  { contributorId: contributor.id },
      update: {},
      create: {
        contributorId: contributor.id,
        balanceMad:    balance,
        pendingMad:    pending,
        lifetimeMad:   lifetime,
        lastPayoutAt:  lastPayout,
      },
    });

    // Create 2–5 transactions per contributor
    const txCount2 = randInt(2, 5, i + 10);
    for (let t = 0; t < txCount2; t++) {
      const isReward = t < txCount2 - 1;
      const amount   = parseFloat((rand(0.5, 50, i * 10 + t)).toFixed(2));

      await prisma.transaction.create({
        data: {
          walletId:       wallet.id,
          contributorId:  contributor.id,
          type:           isReward ? TransactionType.REWARD : TransactionType.PAYOUT,
          status:         TransactionStatus.COMPLETED,
          amountMad:      amount,
          provider:       isReward ? null : pick(Object.values(PaymentProvider), i + t),
          gatewayRef:     isReward ? null : `GW-${randomUUID().substring(0, 8).toUpperCase()}`,
          idempotencyKey: randomUUID(),
          processedAt:    daysAgo(randInt(0, 20, i * 10 + t + 1)),
          metadata:       isReward
            ? { source: 'voice_recording', qualityScore: 0.85 }
            : { provider: 'orange_money', recipientPhone: `+21261234500${i + 1}` },
        },
      });
      txCount++;
    }
  }
  console.log(`     Transactions: ${txCount}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Datasets
// ─────────────────────────────────────────────────────────────────────────────

async function seedDatasets() {
  console.log('  → Seeding datasets...');

  const datasets = [
    {
      name:         'Tkllm-Darija Speech v1',
      description:  'First release of the Moroccan Darija speech-to-text dataset. Covers 6 domains across 9 regions.',
      version:      'v1',
      type:         DatasetType.SPEECH_TO_TEXT,
      language:     Language.DARIJA,
      domain:       null,
      sizeRecords:  12_400,
      sizeHours:    150.2,
      storagePath:  'v1/speech-to-text/',
      format:       DatasetFormat.PARQUET,
      license:      DatasetLicense.CC_BY_4,
      qualityScore: 0.834,
      isPublished:  true,
      publishedAt:  daysAgo(45),
    },
    {
      name:         'Tkllm-Darija Speech v2',
      description:  'Expanded corpus with 300h, improved quality pipeline, domain-balanced sampling, and Arabizi annotations.',
      version:      'v2',
      type:         DatasetType.SPEECH_TO_TEXT,
      language:     Language.DARIJA,
      domain:       null,
      sizeRecords:  28_600,
      sizeHours:    312.5,
      storagePath:  'v2/speech-to-text/',
      format:       DatasetFormat.PARQUET,
      license:      DatasetLicense.CC_BY_4,
      qualityScore: 0.871,
      isPublished:  true,
      publishedAt:  daysAgo(10),
    },
    {
      name:         'Tkllm-Healthcare-Darija v1',
      description:  'Medical domain Darija speech — patient-doctor dialogues and healthcare terminology.',
      version:      'v1',
      type:         DatasetType.SPEECH_TO_TEXT,
      language:     Language.DARIJA,
      domain:       TaskDomain.HEALTHCARE,
      sizeRecords:  3_200,
      sizeHours:    47.2,
      storagePath:  'v1/healthcare/',
      format:       DatasetFormat.PARQUET,
      license:      DatasetLicense.RESEARCH_ONLY,
      qualityScore: 0.902,
      isPublished:  false,
      publishedAt:  null,
    },
  ];

  for (const data of datasets) {
    await prisma.dataset.upsert({
      where:  { name_version: { name: data.name, version: data.version } },
      update: {},
      create: data,
    });
    console.log(`     ${data.name}: ${data.sizeRecords.toLocaleString()} records, ${data.sizeHours}h`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Platform metrics (TimescaleDB — last 7 days hourly)
// ─────────────────────────────────────────────────────────────────────────────

async function seedPlatformMetrics() {
  console.log('  → Seeding platform metrics (last 7 days)...');
  let count = 0;

  for (let d = 7; d >= 0; d--) {
    for (let h = 0; h < 24; h += 3) {
      const hour = new Date();
      hour.setDate(hour.getDate() - d);
      hour.setHours(h, 0, 0, 0);

      const seed = d * 100 + h;
      const peakFactor = h >= 9 && h <= 21 ? 1.8 : 0.6;

      await prisma.platformMetric.create({
        data: {
          hour,
          activeContributors: Math.floor(rand(20, 80, seed) * peakFactor),
          tasksSubmitted:     Math.floor(rand(50, 200, seed + 1) * peakFactor),
          tasksApproved:      Math.floor(rand(35, 150, seed + 2) * peakFactor),
          audioHours:         parseFloat((rand(2, 15, seed + 3) * peakFactor).toFixed(2)),
          totalPayoutsMad:    parseFloat((rand(100, 800, seed + 4) * peakFactor).toFixed(2)),
          avgQualityScore:    parseFloat((rand(0.75, 0.95, seed + 5)).toFixed(3)),
        },
      }).catch(() => null); // ignore duplicates

      count++;
    }
  }
  console.log(`     Platform metric rows: ${count}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Audit log samples
// ─────────────────────────────────────────────────────────────────────────────

async function seedAuditLogs(
  admin:        { id: string },
  contributors: Array<{ id: string }>,
) {
  console.log('  → Seeding audit log entries...');

  const entries = [
    { userId: admin.id,           action: 'user.login',             resource: 'User',            metadata: { ip: '10.0.0.1' } },
    { userId: admin.id,           action: 'dataset.publish',        resource: 'Dataset',         metadata: { version: 'v2' } },
    { userId: contributors[0].id, action: 'user.login',             resource: 'User',            metadata: { ip: '10.0.0.2' } },
    { userId: contributors[0].id, action: 'submission.create',      resource: 'AudioSubmission', metadata: { domain: 'GENERAL' } },
    { userId: contributors[1].id, action: 'submission.create',      resource: 'AudioSubmission', metadata: { domain: 'HEALTHCARE' } },
    { userId: contributors[2].id, action: 'payout.request',         resource: 'Transaction',     metadata: { amountMad: 250, provider: 'ORANGE_MONEY' } },
    { userId: contributors[3].id, action: 'profile.update',         resource: 'ContributorProfile', metadata: { fields: ['region', 'dialect'] } },
    { userId: admin.id,           action: 'campaign.create',        resource: 'Campaign',        metadata: { domain: 'HEALTHCARE' } },
    { userId: contributors[4].id, action: 'consent.grant',          resource: 'ConsentRecord',   metadata: { category: 'AUDIO' } },
    { userId: contributors[5].id, action: 'submission.create',      resource: 'AudioSubmission', metadata: { domain: 'BANKING' } },
  ];

  for (const entry of entries) {
    await prisma.auditLog.create({
      data: {
        ...entry,
        resourceId: randomUUID(),
        ipAddress:  '192.168.1.1',
        userAgent:  'NestJS/tkllm-api',
        createdAt:  daysAgo(Math.random() * 7),
      },
    });
  }
  console.log(`     Audit log entries: ${entries.length}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Tkllm-darija — Prisma Seed            ║');
  console.log('╚════════════════════════════════════════╝\n');

  const start = Date.now();

  // System users first (reviewer ID needed later)
  const { admin, reviewer } = await seedSystemUsers();

  // B2B clients (sponsor IDs needed for campaigns)
  const b2bClients = await seedB2BClients();

  // Contributors (IDs needed for everything else)
  const contributors = await seedContributors();

  // Campaigns (IDs needed for task templates)
  const campaigns = await seedCampaigns(b2bClients);

  // Tasks (IDs needed for assignments)
  const tasks = await seedTaskTemplates(campaigns);

  // Assignments → Submissions → Reviews
  await seedAssignmentsAndSubmissions(contributors, tasks, reviewer);

  // Financial
  await seedWalletsAndTransactions(contributors);

  // Datasets
  await seedDatasets();

  // Analytics
  await seedPlatformMetrics();

  // Audit
  await seedAuditLogs(admin, contributors);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log('\n╔════════════════════════════════════════╗');
  console.log(`║  ✅ Seed complete in ${elapsed}s           ║`);
  console.log('╚════════════════════════════════════════╝');
  console.log('\nDefault password for all seeded users:', DEFAULT_PASSWORD);
  console.log('\nUseful commands:');
  console.log('  npm run db:studio     → Prisma Studio (visual DB browser)');
  console.log('  npm run infra:tools   → pgAdmin at http://localhost:5050');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });