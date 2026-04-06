# Module — ElastiCache (Redis 7)

Provisions an Amazon ElastiCache Redis 7 replication group used for
BullMQ job queues, session storage, and application cache.

## Redis DB Allocation

| DB Index | Purpose | TTL |
|---|---|---|
| DB 0 | General cache (allkeys-lru) | Varies |
| DB 1 | BullMQ job queues | Job-defined |
| DB 2 | Session store | 7 days |
| DB 3 | Rate limiting counters | 60s |

## Configuration

| Setting | Dev | Staging | Prod |
|---|---|---|---|
| Node type | `cache.t4g.micro` | `cache.t4g.small` | `cache.t4g.medium` |
| Num nodes | 1 | 1 | 2 (primary + replica) |
| Multi-AZ | No | No | Yes |
| Auto failover | No | No | Yes |
| Snapshots | 0 days | 0 days | 3 days |

## Usage

```hcl
module "elasticache" {
  source = "./modules/elasticache"

  name_prefix           = "tkllm-darija-prod"
  environment           = "prod"
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.isolated_subnet_ids
  node_type             = "cache.t4g.medium"
  auth_token            = var.redis_auth_token
  eks_security_group_id = module.eks.node_security_group_id
  tags                  = { Project = "tkllm-darija" }
}
```

## Security

- TLS in-transit enforced (`transit_encryption_enabled = true`)
- AES-256 encryption at rest
- AUTH token required (stored in SSM and injected via ESO)
- Security group: port 6379 from EKS worker nodes only

## Outputs

| Name | Description |
|---|---|
| `primary_endpoint` | Redis primary endpoint address (sensitive) |
| `port` | Redis port (6379) |
| `security_group_id` | ElastiCache security group ID |