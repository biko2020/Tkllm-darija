# Module — Monitoring (CloudWatch + SNS)

Provisions AWS-native monitoring resources that complement the
Prometheus/Grafana stack in `infrastructure/monitoring/`.

## Resources Created

### SNS Topics
- `*-alerts-critical` — paging-level alerts (RDS storage, Kafka controller loss)
- `*-alerts-warning` — degraded state alerts (high CPU, memory pressure)

### CloudWatch Alarms

| Alarm | Threshold | Severity |
|---|---|---|
| RDS CPU > 80% for 3m | 80% | Warning |
| RDS free storage < 10 GB | 10 GB | **Critical** |
| RDS connections > 180 | 180 | **Critical** |
| RDS replica lag > 30s (prod only) | 30s | **Critical** |
| Redis memory > 85% | 85% | Warning |
| Redis CPU > 90% | 90% | **Critical** |
| MSK disk free < 20% | 20% | **Critical** |
| MSK active controller count < 1 | 1 | **Critical** |
| EKS node CPU > 85% for 5m | 85% | Warning |
| EKS node memory > 85% for 5m | 85% | Warning |

### CloudWatch Log Groups
One log group per service (30-day retention in dev/staging, 90-day in prod):
`/tkllm-darija/{env}/api`, `/asr-worker`, `/quality-engine`, etc.

### CloudWatch Dashboard
`tkllm-darija-{env}-overview` — key infrastructure metrics at a glance.

## Usage

```hcl
module "monitoring" {
  source = "./modules/monitoring"

  name_prefix = "tkllm-darija-prod"
  environment = "prod"
  alert_email = "ops@tkllm-darija.ma"
  tags        = { Project = "tkllm-darija" }
}
```

## Outputs

| Name | Description |
|---|---|
| `critical_sns_arn` | Critical alerts SNS topic ARN |
| `warning_sns_arn` | Warning alerts SNS topic ARN |
| `log_group_names` | Map of service → CloudWatch log group name |
| `dashboard_name` | CloudWatch dashboard name |