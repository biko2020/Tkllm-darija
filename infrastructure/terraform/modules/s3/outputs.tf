output "bucket_names" {
  description = "Map of logical bucket names to actual S3 bucket names"
  value = { for k, b in aws_s3_bucket.main : k => b.bucket }
}

output "bucket_arns" {
  description = "Map of logical bucket names to S3 bucket ARNs"
  value = { for k, b in aws_s3_bucket.main : k => b.arn }
}
