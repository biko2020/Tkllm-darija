# S3 Terraform Module — main.tf
# Provisions S3 buckets for audio, datasets, models, exports, and backups.

resource "aws_s3_bucket" "main" {
  for_each = toset(var.bucket_names)
  bucket = "${var.name_prefix}-${each.key}"
  force_destroy = var.force_destroy
  tags = var.tags
}

resource "aws_s3_bucket_versioning" "main" {
  for_each = aws_s3_bucket.main
  bucket = each.value.id
  versioning_configuration {
    status = var.versioning_enabled ? "Enabled" : "Suspended"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  for_each = aws_s3_bucket.main
  bucket = each.value.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "main" {
  for_each = aws_s3_bucket.main
  bucket = each.value.id
  rule {
    id     = "expire-old-versions"
    status = "Enabled"
    noncurrent_version_expiration {
      noncurrent_days = var.noncurrent_expiration_days
    }
  }
}
