# Module — SSM Parameter Store

Bootstraps AWS SSM Parameter Store with all secrets required by the platform.
External Secrets Operator (ESO) reads these at cluster boot to populate
the `tkllm-secrets` Kubernetes Secret in the `tkllm-darija` namespace.

## Parameter Hierarchy

```
/tkllm-darija/{environment}/
  DATABASE_URL
  DATABASE_PASSWORD
  REDIS_URL
  REDIS_PASSWORD
  KAFKA_BROKER
  JWT_SECRET
  COOKIE_SECRET
  ENCRYPTION_KEY
  S3_ENDPOINT / S3_ACCESS_KEY / S3_SECRET_KEY
  SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_JWT_SECRET
  KEYCLOAK_URL / KEYCLOAK_CLIENT_SECRET
  TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER
  HUGGINGFACE_TOKEN
  PINECONE_API_KEY / PINECONE_ENVIRONMENT
  CMI_MERCHANT_ID / CMI_STORE_KEY
  ORANGE_MONEY_CLIENT_ID / ORANGE_MONEY_CLIENT_SECRET / ORANGE_MONEY_MERCHANT_KEY
  INWI_MONEY_PARTNER_ID / INWI_MONEY_API_KEY
  SENDGRID_API_KEY
  SENTRY_DSN
```

## Ownership model

- **Terraform manages**: infra-derived values (`DATABASE_URL`, `REDIS_URL`, `KAFKA_BROKER`)
  — these are updated automatically when RDS/ElastiCache/MSK endpoints change.
- **CI/CD manages**: application secrets (JWT, payment keys, API tokens)
  — Terraform creates placeholders with `lifecycle { ignore_changes = [value] }`.
- **ESO syncs**: all parameters → single `tkllm-secrets` K8s Secret, refreshed every 1h.

## Rotating a secret

```bash
bash infrastructure/scripts/rotate-secrets.sh \
  --env prod \
  --key JWT_SECRET \
  --value "$(openssl rand -hex 64)"
```

## Usage

```hcl
module "ssm" {
  source = "./modules/ssm"

  name_prefix   = "tkllm-darija"
  environment   = "prod"
  rds_endpoint  = module.rds.endpoint
  redis_endpoint= module.elasticache.primary_endpoint
  msk_brokers   = module.msk.bootstrap_brokers
  tags          = { Project = "tkllm-darija" }
}
```

## Outputs

| Name | Description |
|---|---|
| `parameter_prefix` | SSM path prefix `/tkllm-darija/{env}` |
| `parameter_names` | List of all managed parameter names |