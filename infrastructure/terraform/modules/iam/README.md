# Module — IAM

Provisions all IAM roles and IRSA (IAM Roles for Service Accounts) bindings
required by the Tkllm-darija platform.

## Roles Created

| Role | Bound to | Permissions |
|---|---|---|
| `eks-cluster-role` | EKS control plane | `AmazonEKSClusterPolicy`, `AmazonEKSVPCResourceController` |
| `eks-node-role` | EC2 worker nodes | Worker + ECR readonly + CNI + SSM managed instance |
| `api-irsa` | `tkllm-darija/tkllm-api` ServiceAccount | SSM read (`/tkllm-darija/{env}/*`), CloudWatch logs write |
| `asr-worker-irsa` | `tkllm-darija/tkllm-asr-worker` | S3 read `tkllm-audio`, S3 write `tkllm-datasets`/`tkllm-models`, SSM read |
| `pipeline-irsa` | `tkllm-darija/tkllm-data-pipeline` | S3 full access all buckets, SSM read |

## IRSA — How it works

Each pod's ServiceAccount is annotated with an IAM role ARN. The EKS OIDC
provider validates the pod's JWT token and assumes the role via
`sts:AssumeRoleWithWebIdentity`. No static credentials needed in pods.

## Usage

```hcl
module "iam" {
  source = "./modules/iam"

  name_prefix       = "tkllm-darija-prod"
  environment       = "prod"
  eks_oidc_provider = module.eks.oidc_provider_arn
  aws_account_id    = data.aws_caller_identity.current.account_id
  aws_region        = "eu-west-1"
  tags              = { Project = "tkllm-darija" }
}
```

## Outputs

| Name | Description |
|---|---|
| `eks_cluster_role_arn` | EKS cluster IAM role ARN |
| `eks_node_role_arn` | Worker node IAM role ARN |
| `api_irsa_role_arn` | API service account role ARN |
| `asr_worker_irsa_role_arn` | ASR worker service account role ARN |
| `pipeline_irsa_role_arn` | Data pipeline service account role ARN |