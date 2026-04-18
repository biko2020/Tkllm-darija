# Contributing to Tkllm-darija

Thank you for investing your time in this project. Tkllm-darija exists to preserve
Moroccan linguistic heritage and make inclusive AI possible — every contribution matters.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Branch Naming](#branch-naming)
4. [Commit Conventions](#commit-conventions)
5. [Pull Request Process](#pull-request-process)
6. [Coding Standards](#coding-standards)
7. [Testing Requirements](#testing-requirements)
8. [Dataset Contributions](#dataset-contributions)
9. [Reporting Issues](#reporting-issues)

---

## Code of Conduct

Be respectful, inclusive, and constructive. We are especially committed to
welcoming contributors from Morocco and the broader Arabic-speaking world.
Harassment, discrimination, or gatekeeping of any kind will not be tolerated.

---

## Getting Started

```bash
# 1. Fork and clone
git clone https://github.com/<your-handle>/Tkllm-darija
cd Tkllm-darija

# 2. Install dependencies
npm install           # Node workspaces
cd ml && pip install -r requirements.txt   # Python ML stack

# 3. Spin up local infrastructure
npm run infra:up

# 4. Run migrations + seed
npm run db:migrate
npm run db:seed

# 5. Verify everything works
bash infrastructure/scripts/health-check.sh
turbo run build --dry-run
```

See `docs/local-setup.md` for a detailed walkthrough.

---

## Branch Naming

```
<type>/<scope>-<short-description>

Types:
  feat/     — new feature
  fix/      — bug fix
  chore/    — tooling, dependencies, non-functional changes
  docs/     — documentation only
  refactor/ — code restructuring (no behaviour change)
  test/     — adding or fixing tests
  infra/    — infrastructure / k8s / terraform changes
  ml/       — ML training scripts, notebooks, evaluation

Examples:
  feat/auth-otp-moroccan-numbers
  fix/quality-engine-majority-vote
  infra/eks-gpu-node-group
  ml/whisper-small-darija-finetune
  docs/local-setup-guide
```

Branch from `main`. One concern per branch.

---

## Commit Conventions

We follow **Conventional Commits** (`feat(scope): description`).

```
<type>(<scope>): <imperative description>

[optional body — explain WHY, not WHAT]

[optional footer — BREAKING CHANGE: ..., Closes #123]
```

### Types

| Type | When to use |
|---|---|
| `feat` | New user-visible feature |
| `fix` | Bug fix |
| `chore` | Maintenance (deps, config, CI) |
| `docs` | Documentation changes |
| `refactor` | Restructuring without behaviour change |
| `test` | Adding or fixing tests |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |
| `infra` | Terraform / k8s / docker |
| `ml` | ML scripts, notebooks, evaluation |

### Scopes

```
api          — apps/api NestJS backend
auth         — authentication module
task         — task engine
quality      — quality scoring
financial    — payments, wallet, fraud
analytics    — analytics service
asr          — ASR worker / Whisper
pipeline     — data-pipeline service
web          — web-contributor or web-b2b
mobile       — Flutter app
types        — packages/types
validators   — packages/validators
ui           — packages/ui
infra        — infrastructure (unscoped)
k8s          — Kubernetes manifests
terraform    — Terraform modules / environments
ml           — ML workspace
data         — data/ ingestion, schemas, registry
docs         — documentation
```

### Examples

```
feat(auth): add OTP verification for Moroccan +212 numbers
fix(quality): correct majority-vote threshold from 0.5 to 0.6
chore(deps): upgrade NestJS to 10.4.15
infra(k8s): add KEDA ScaledObject for ASR worker GPU autoscaling
ml(asr): add Whisper large-v3 fine-tuning config for Darija
docs(api): document audio upload endpoint constraints
```

### Rules

- Subject line ≤ 72 characters, imperative mood, no period at end
- Body wrapped at 100 characters
- Reference issues: `Closes #42`, `Refs #17`
- **Never** commit `.env`, secrets, or model weights

---

## Pull Request Process

### Before opening a PR

- [ ] Branch is up to date with `main`
- [ ] `turbo run build` passes with no errors
- [ ] `turbo run lint` passes
- [ ] `turbo run test` passes with ≥ 80% coverage on changed modules
- [ ] New features have tests
- [ ] Public API changes update `packages/types/`
- [ ] Infrastructure changes have been `terraform validate`-d

### PR title

Same format as commit subject: `feat(scope): description`

### PR description template

```markdown
## What
<!-- One paragraph: what does this PR do? -->

## Why
<!-- Why is this change needed? Link to issue. -->

## How
<!-- Key implementation decisions. What was tricky? -->

## Testing
<!-- How was this tested? Screenshots for UI changes. -->

## Checklist
- [ ] Tests added / updated
- [ ] Types updated in packages/types if API changed
- [ ] Docs updated if behaviour changed
- [ ] No secrets committed
```

### Review requirements

- Minimum **1 approval** from a maintainer
- All CI checks must be green
- No unresolved conversations
- PR description must be filled in (not left as template)

### Merge strategy

We use **Squash and Merge** — the PR title becomes the single commit message on `main`.
Write your PR title carefully — it becomes permanent history.

---

## Coding Standards

### TypeScript (apps/api, packages/, services/)

```typescript
// ✅ Explicit return types on all public functions
async createTask(dto: CreateTaskDto): Promise<Task> { ... }

// ✅ Readonly where appropriate
constructor(private readonly taskService: TaskService) {}

// ✅ Barrel exports via index.ts
export * from './task.service';
export * from './task.controller';

// ❌ No any — use unknown + type narrowing
const data: unknown = JSON.parse(raw);

// ❌ No console.log — use NestJS Logger
this.logger.log(`Task ${task.id} assigned`);
```

**NestJS conventions:**
- One module per feature folder (`task/task.module.ts`)
- DTOs validated with `class-validator` + `@nestjs/mapped-types`
- Services contain business logic; controllers are thin
- Repository pattern via Prisma service (no raw SQL outside migrations)
- Events published via `@nestjs/event-emitter` or KafkaJS

### Python (ml/, data/)

- **Black** for formatting (`line-length = 100`)
- **Ruff** for linting (`ruff check --fix`)
- **Mypy** with `strict = true`
- Type annotations on all functions
- Docstrings on all public functions (Google style)
- No bare `except:` — always catch specific exceptions

### Shell scripts

- `set -euo pipefail` at the top of every script
- `shellcheck` must pass
- Colour output helpers: `log()`, `success()`, `warn()`, `error()`, `die()`

---

## Testing Requirements

### Minimum coverage gate: 80% line coverage per module

```bash
# Run all tests with coverage
turbo run test

# Run a single package
cd apps/api && npm test -- --coverage

# Python ML tests
cd ml && pytest --cov=training --cov=evaluation
```

### What must be tested

| Layer | Tool | Minimum |
|---|---|---|
| NestJS services | Jest | 80% line coverage |
| NestJS controllers | Jest + Supertest | All endpoints, happy + error paths |
| E2E critical path | Jest + Testcontainers | Full register → submit → payout flow |
| Python ML | pytest | All evaluation + training functions |
| Kafka consumers | Embedded broker | Message handling + error paths |

### What NOT to test

- NestJS decorators / framework internals
- Third-party library internals
- Trivial getters/setters

---

## Dataset Contributions

If you are contributing voice recordings, annotation data, or NLP corpora:

1. **Consent** — only submit data you have explicit rights to share
2. **Anonymisation** — no full names, phone numbers, or identifying details in audio
3. **Format** — audio must be WAV or WebM, 16kHz mono, ≤ 60 seconds
4. **Metadata** — include region, age group, dialect using the schema at
   `data/schemas/audio_annotation.json`
5. **License** — all data contributions are licensed under CC BY 4.0 unless
   otherwise agreed in writing

For large dataset donations (> 1,000 recordings), please open an issue first
to discuss transfer format and ingestion pipeline.

---

## Reporting Issues

### Bug reports

Use the **Bug Report** issue template. Include:
- Exact error message + stack trace
- Steps to reproduce (minimal reproducible example)
- Environment (`node --version`, OS, Docker version)
- Expected vs actual behaviour

### Feature requests

Use the **Feature Request** template. Describe:
- The problem you are trying to solve (not the solution)
- Who benefits and how often
- Any constraints (performance, CNDP compliance, Darija specifics)

### Security vulnerabilities

**Do not open a public issue.** Email `aitoufkirbrahimab@gmail.com` directly.
Include `[SECURITY]` in the subject line. We will respond within 48 hours
and coordinate responsible disclosure.

---

*Made with ❤️ for Morocco's linguistic heritage.*