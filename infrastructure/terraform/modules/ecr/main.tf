# ECR Terraform Module — main.tf
# Provisions ECR repositories for application and worker images.

resource "aws_ecr_repository" "main" {
  for_each = toset(var.repository_names)
  name                 = "${var.name_prefix}-${each.key}"
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
  tags = var.tags
}
