# Module — S3

Provisions AWS S3 buckets for Terraform remote state and database backups.
Primary object storage (audio files, datasets, exports, models) is on
**Cloudflare R2** (zero egress cost) — see `modules/cloudflare/`.

## Buckets Created

| Bucket | Purpose | Versioning | Lifecycle |
|---|---|---|---|
| `tkllm-darija-tfstate` | Terraform remote state | Enabled | Expire old versions after 90 days |
| `tkllm-darija-backups` | RDS snapshots, DB dumps | Enabled | Transition to Glacier after 30 days, expire after 365 |

## Security

- AES-256 encryption at rest via KMS
- Public access fully blocked
- Versioning enabled on all buckets
- `force_destroy = false` in prod (prevents accidental deletion)

## Usage

```hcl
module "s3" {
  source = "./modules/s3"

  name_prefix = "tkllm-darija"
  environment = "prod"
  aws_region  = "eu-west-1"
  tags        = { Project = "tkllm-darija" }
}
```

## Outputs

| Name | Description |
|---|---|
| `bucket_names` | Map of logical bucket names to actual S3 bucket names |
| `bucket_arns` | Map of logical bucket names to S3 bucket ARNs |
| `tfstate_bucket_name` | Terraform state bucket name |
| `backups_bucket_name` | Backup bucket name |
| `tfstate_bucket_arn` | State bucket ARN |
| `backups_bucket_arn` | Backup bucket ARN |
| `kms_key_arn` | KMS key used for encryption |