variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}

variable "subnet_ids" {
  description = "List of subnet IDs for EKS"
  type        = list(string)
}

variable "eks_role_arn" {
  description = "IAM role ARN for EKS cluster"
  type        = string
}

variable "node_role_arn" {
  description = "IAM role ARN for EKS node group"
  type        = string
}

variable "node_instance_profile" {
  description = "Instance profile for EKS nodes"
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version for the cluster"
  type        = string
  default     = "1.29"
}

variable "node_instance_types" {
  description = "EC2 instance types for nodes"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_desired_size" {
  description = "Desired node group size"
  type        = number
  default     = 2
}

variable "node_min_size" {
  description = "Minimum node group size"
  type        = number
  default     = 1
}

variable "node_max_size" {
  description = "Maximum node group size"
  type        = number
  default     = 4
}

variable "node_disk_size" {
  description = "Node disk size in GiB"
  type        = number
  default     = 50
}

variable "ssh_key_name" {
  description = "SSH key name for node access"
  type        = string
  default     = ""
}

variable "oidc_url" {
  description = "OIDC provider URL for IRSA"
  type        = string
}

variable "oidc_thumbprint" {
  description = "OIDC provider thumbprint for IRSA"
  type        = string
}
