output "primary_endpoint_address" {
  description = "Primary endpoint address of the Redis cluster"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "reader_endpoint_address" {
  description = "Reader endpoint address of the Redis cluster"
  value       = aws_elasticache_replication_group.main.reader_endpoint_address
}

output "replication_group_id" {
  description = "Replication group ID"
  value       = aws_elasticache_replication_group.main.id
}
