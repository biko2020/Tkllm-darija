# Module — RDS (PostgreSQL 16 + TimescaleDB)

Provisions an Amazon RDS PostgreSQL 16 instance with TimescaleDB extension
support, used as the primary data store for the Tkllm-darija platform.

## Configuration

| Setting | Dev | Staging | Prod |
|---|---|---|---|
| Instance class | `db.t4g.small` | `db.t4g.medium` | `db.t4g.large` |
| Multi-AZ | No | No | Yes |
| Storage | 20 GB | 50 GB | 100 GB (auto-scales to 500 GB) |
| Backup retention | 1 day | 3 days | 7 days |
| Deletion protection | No | No | Yes |
| Performance Insights | Yes | Yes | Yes |

## Extensions (auto-enabled via init script)

- `timescaledb` — time-series hypertables for analytics
- `postgis` — geospatial data for regional accent metadata
- `pg_trgm` — fuzzy text search on transcripts
- `uuid-ossp` — UUID generation
- `pgcrypto` — PII encryption helpers

## Usage

```hcl
module "rds" {
  source = "./modules/rds"

  name_prefix           = "tkllm-darija-prod"
  environment           = "prod"
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.isolated_subnet_ids
  db_password           = var.db_password
  instance_class        = "db.t4g.large"
  allocated_storage     = 100
  max_allocated_storage = 500
  eks_security_group_id = module.eks.node_security_group_id
  aws_region            = "eu-west-1"
  tags                  = { Project = "tkllm-darija" }
}
```

## Security

- Deployed in isolated subnets — no internet route
- Security group allows port 5432 from EKS worker nodes only
- AES-256 encryption at rest via dedicated KMS key
- SSL enforced (`ssl=on` in parameter group)
- `wal_level=logical` enabled for future replication

## Outputs

| Name | Description |
|---|---|
| `endpoint` | `host:port` connection string (sensitive) |
| `db_name` | Database name (`tkllm_darija`) |
| `security_group_id` | RDS security group ID |