# Module — ECR (Elastic Container Registry)

Provisions one private ECR repository per application service with image
scanning on push and a lifecycle policy to limit image accumulation.

## Repositories Created

| Repository | Image |
|---|---|
| `tkllm-darija-{env}/api` | NestJS REST + GraphQL API |
| `tkllm-darija-{env}/web-contributor` | Next.js contributor web app |
| `tkllm-darija-{env}/web-b2b` | Next.js B2B enterprise portal |
| `tkllm-darija-{env}/asr-worker` | Whisper ASR transcription worker |
| `tkllm-darija-{env}/quality-engine` | Annotation quality scoring service |
| `tkllm-darija-{env}/analytics-service` | Metrics and KPI tracking |
| `tkllm-darija-{env}/financial-service` | Payments, wallet, fraud detection |
| `tkllm-darija-{env}/data-pipeline` | ETL and dataset versioning |

## Lifecycle Policy

- Keep last **10 tagged** images (tags: `v*`, `sha-*`, `latest`)
- Expire **untagged** images after 7 days

## Usage

```hcl
module "ecr" {
  source = "./modules/ecr"

  name_prefix  = "tkllm-darija-prod"
  environment  = "prod"
  repositories = ["api", "web-contributor", "web-b2b", "asr-worker",
                  "quality-engine", "analytics-service",
                  "financial-service", "data-pipeline"]
  tags         = { Project = "tkllm-darija" }
}
```

## Push images (CI/CD)

```bash
aws ecr get-login-password --region eu-west-1 \
  | docker login --username AWS \
    --password-stdin 123456789.dkr.ecr.eu-west-1.amazonaws.com

docker build -t tkllm-darija-prod/api:sha-$(git rev-parse --short HEAD) .
docker push 123456789.dkr.ecr.eu-west-1.amazonaws.com/tkllm-darija-prod/api:sha-...
```

## Outputs

| Name | Description |
|---|---|
| `repository_urls` | Map of service → ECR URL |
| `registry_id` | AWS account ID (registry prefix) |