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

## Usage

```hcl
module "msk" {
  source = "./modules/msk"

  name_prefix           = "tkllm-darija-prod"
  environment           = "prod"
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.private_subnet_ids
  instance_type         = "kafka.m5.large"
  kafka_version         = "3.6.0"
  eks_security_group_id = module.eks.node_security_group_id
  tags                  = { Project = "tkllm-darija" }
}
```

## Outputs

| Name | Description |
|---|---|
| `bootstrap_brokers` | TLS broker connection string (sensitive) |
| `bootstrap_brokers_plaintext` | Plaintext brokers (dev/staging only) |
| `zookeeper_connect` | Zookeeper connection string (sensitive) |
| `cluster_arn` | MSK cluster ARN |