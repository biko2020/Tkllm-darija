# Module — MSK (Amazon Managed Streaming for Apache Kafka)

Provisions an Amazon MSK Kafka cluster for the Tkllm-darija async
event pipeline covering audio upload → transcription → quality → payments.

## Topics Provisioned

| Topic | Partitions | Retention | Consumer Groups |
|---|---|---|---|
| `audio.uploaded` | 3 | 7 days | asr-worker-group |
| `transcription.requested` | 3 | 7 days | asr-worker-group (KEDA trigger) |
| `transcription.completed` | 3 | 7 days | quality, analytics, api |
| `annotation.task.created` | 3 | 14 days | analytics |
| `quality.review.requested` | 3 | 14 days | quality-review-group |
| `quality.review.completed` | 3 | 14 days | api, rewards, analytics, pipeline |
| `reward.issued` | 1 | 30 days | wallet-group, analytics |
| `payment.processed` | 1 | 30 days | api, analytics |
| `export.requested` | 2 | 3 days | pipeline, analytics |

## Configuration

| Setting | Dev | Staging | Prod |
|---|---|---|---|
| Brokers | 1 | 1 | 3 (one per AZ) |
| Instance type | `kafka.t3.small` | `kafka.t3.small` | `kafka.m5.large` |
| Storage | 20 GB | 50 GB | 100 GB |
| Auth | Unauthenticated | Unauthenticated | IAM (SASL) |
| Replication | 1 | 1 | 3 |
| Min ISR | 1 | 1 | 2 |

## Files

- main.tf: MSK cluster
- variables.tf: Module input variables
- outputs.tf: Module outputs
- README.md: Documentation

## Usage

```hcl
module "msk" {
  source                = "../../modules/msk"
  name_prefix           = var.name_prefix
  subnet_ids            = var.kafka_subnet_ids
  security_group_ids    = var.kafka_security_group_ids
  kafka_version         = var.kafka_version
  broker_count          = var.kafka_broker_count
  broker_instance_type  = var.kafka_broker_instance_type
  broker_volume_size    = var.kafka_broker_volume_size
  kms_key_arn           = var.kafka_kms_key_arn
  enhanced_monitoring   = var.kafka_enhanced_monitoring
  tags                  = var.tags
}
```

## Inputs
- `name_prefix`: Prefix for resource names
- `subnet_ids`: List of subnet IDs for MSK brokers
- `security_group_ids`: List of security group IDs for MSK
- `kafka_version`: Kafka version
- `broker_count`: Number of broker nodes
- `broker_instance_type`: Instance type for brokers
- `broker_volume_size`: EBS volume size for brokers (GiB)
- `kms_key_arn`: KMS key ARN for encryption at rest
- `enhanced_monitoring`: Enhanced monitoring level
- `tags`: Tags to apply to resources

## Outputs
- `bootstrap_brokers_tls`: TLS bootstrap brokers string
- `zookeeper_connect_string`: Zookeeper connect string
- `msk_cluster_arn`: MSK cluster ARN

---

This module provisions an Amazon MSK (Kafka) cluster for the Tkllm-darija platform. It supports encryption, enhanced monitoring, and secure configuration.