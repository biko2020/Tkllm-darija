# Module — Cloudflare (R2 + DNS)

Provisions Cloudflare R2 buckets for object storage and DNS records
pointing to the EKS ALB.

## R2 Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `tkllm-audio` | `processed/` public-read | Voice recordings |
| `tkllm-datasets` | Private | Versioned annotated datasets |
| `tkllm-exports` | Private | B2B export packages (7-day expiry) |
| `tkllm-models` | Private | Whisper model weights + MLflow artefacts |

R2 is chosen over S3 for primary storage because egress is free — critical
for audio streaming and large dataset downloads.

## DNS Records

| Subdomain | Target | Proxied |
|---|---|---|
| `api.tkllm-darija.ma` | EKS ALB hostname | Yes |
| `app.tkllm-darija.ma` | EKS ALB hostname | Yes |
| `b2b.tkllm-darija.ma` | EKS ALB hostname | Yes |
| `mlflow.tkllm-darija.ma` | EKS ALB hostname | No (internal tool) |
| `prefect.tkllm-darija.ma` | EKS ALB hostname | No (internal tool) |

## Usage

```hcl
module "cloudflare" {
  source = "./modules/cloudflare"

  account_id      = var.cloudflare_account_id
  zone_id         = var.cloudflare_zone_id
  environment     = "prod"
  buckets         = ["tkllm-audio", "tkllm-datasets", "tkllm-exports", "tkllm-models"]
  eks_lb_hostname = module.eks.load_balancer_hostname
}
```

## Outputs

| Name | Description |
|---|---|
| `bucket_names` | List of created R2 bucket names |
| `dns_record_hostnames` | Map of subdomain → FQDN |