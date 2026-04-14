# EKS Terraform Module — main.tf
# Provisions an EKS cluster, managed node groups, and OIDC provider.

resource "aws_eks_cluster" "main" {
  name     = "${var.name_prefix}-eks"
  role_arn = var.eks_role_arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids = var.subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  tags = var.tags
}

resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.name_prefix}-eks-nodes"
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.subnet_ids
  instance_types  = var.node_instance_types
  scaling_config {
    desired_size = var.node_desired_size
    max_size     = var.node_max_size
    min_size     = var.node_min_size
  }
  remote_access {
    ec2_ssh_key = var.ssh_key_name
  }
  ami_type = "AL2_x86_64"
  disk_size = var.node_disk_size
  tags = var.tags
}

resource "aws_iam_openid_connect_provider" "oidc" {
  url = var.oidc_url
  client_id_list = ["sts.amazonaws.com"]
  thumbprint_list = [var.oidc_thumbprint]
  tags = var.tags
}
