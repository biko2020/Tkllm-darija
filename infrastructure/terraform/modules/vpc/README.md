# Module — VPC

Provisions a production-grade multi-AZ VPC for the Tkllm-darija platform.

## Architecture

```
VPC (10.0.0.0/16)
├── Public subnets  × 3 AZs  — ALB ingress, NAT Gateway EIPs
├── Private subnets × 3 AZs  — EKS worker nodes, application traffic
└── Isolated subnets× 3 AZs  — RDS, ElastiCache (no internet route)
```

- **Single NAT Gateway** in dev/staging (cost saving)
- **Per-AZ NAT Gateways** in prod (HA egress — `var.environment == "prod"`)
- VPC Flow Logs → CloudWatch (30-day retention)
- Subnet tags required by AWS Load Balancer Controller and EKS cluster autoscaler

## Usage

```hcl
module "vpc" {
  source = "./modules/vpc"

  name_prefix        = "tkllm-darija-prod"
  cidr               = "10.0.0.0/16"
  availability_zones = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  environment        = "prod"
  tags               = { Project = "tkllm-darija" }
}
```

## Inputs

| Name | Type | Default | Description |
|---|---|---|---|
| `name_prefix` | `string` | — | Prefix for all resource names |
| `cidr` | `string` | `10.0.0.0/16` | VPC CIDR block |
| `availability_zones` | `list(string)` | — | AZs to deploy into (min 2) |
| `environment` | `string` | — | `dev` \| `staging` \| `prod` |
| `tags` | `map(string)` | `{}` | Tags applied to all resources |

## Outputs

| Name | Description |
|---|---|
| `vpc_id` | VPC ID |
| `public_subnet_ids` | Public subnet IDs (for ALB) |
| `private_subnet_ids` | Private subnet IDs (for EKS nodes) |
| `isolated_subnet_ids` | Isolated subnet IDs (for RDS/Redis) |
| `vpc_cidr` | VPC CIDR block |