# Module — EKS

Provisions an Amazon EKS cluster with two managed node groups and installs
all required cluster-level Helm charts.

## Node Groups

| Group | Instance | Purpose | Scaling |
|---|---|---|---|
| `general` | `m6i.xlarge` / `m6a.xlarge` | API, workers, web apps | HPA 2–10 |
| `gpu` | `g4dn.xlarge` (T4 GPU) | ASR Worker (Whisper large-v3) | KEDA 0–5 |

GPU nodes carry a `nvidia.com/gpu=true:NoSchedule` taint — only ASR worker pods tolerate it.

## Helm Releases Installed

| Chart | Version | Purpose |
|---|---|---|
| `aws-load-balancer-controller` | 1.10.0 | ALB ingress controller |
| `cluster-autoscaler` | 9.43.2 | Node group autoscaling |
| `keda` | 2.16.1 | Kafka-lag-based ASR worker scaling |
| `external-secrets` | 0.12.1 | Pull secrets from AWS SSM |
| `cert-manager` | 1.16.3 | Let's Encrypt TLS |
| `metrics-server` | 3.12.2 | HPA metric source |
| `nvidia-device-plugin` | 0.17.0 | GPU resource scheduling |

## Security

- Secrets encrypted at rest with dedicated KMS key
- IMDSv2 enforced (`http_tokens = "required"`) on all launch templates
- OIDC provider created for IRSA (IAM Roles for Service Accounts)
- Endpoint private access enabled; public access disabled in prod

## Usage

```hcl
module "eks" {
  source = "./modules/eks"

  name_prefix         = "tkllm-darija-prod"
  cluster_version     = "1.31"
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.private_subnet_ids
  node_instance_types = ["m6i.xlarge", "m6a.xlarge"]
  gpu_instance_types  = ["g4dn.xlarge"]
  node_min            = 2
  node_max            = 10
  node_desired        = 3
  gpu_node_min        = 0
  gpu_node_max        = 5
  cluster_role_arn    = module.iam.eks_cluster_role_arn
  node_role_arn       = module.iam.eks_node_role_arn
  environment         = "prod"
  tags                = { Project = "tkllm-darija" }
}
```

## Inputs

| Name | Type | Description |
|---|---|---|
| `name_prefix` | `string` | Resource name prefix |
| `cluster_version` | `string` | Kubernetes version (e.g. `"1.31"`) |
| `vpc_id` | `string` | VPC ID from vpc module |
| `subnet_ids` | `list(string)` | Private subnet IDs for node groups |
| `node_instance_types` | `list(string)` | General node EC2 instance types |
| `gpu_instance_types` | `list(string)` | GPU node EC2 instance types |
| `node_min/max/desired` | `number` | General node group scaling config |
| `gpu_node_min/max` | `number` | GPU node group scaling config |
| `environment` | `string` | `dev` \| `staging` \| `prod` |

## Outputs

| Name | Description |
|---|---|
| `cluster_name` | EKS cluster name |
| `cluster_endpoint` | API server endpoint (sensitive) |
| `cluster_ca_certificate` | CA cert for kubeconfig (sensitive) |
| `oidc_provider_arn` | OIDC provider ARN for IRSA |
| `node_security_group_id` | Worker node security group ID |