output "bootstrap_brokers_tls" {
  description = "TLS bootstrap brokers string"
  value       = aws_msk_cluster.main.bootstrap_brokers_tls
}

output "zookeeper_connect_string" {
  description = "Zookeeper connect string"
  value       = aws_msk_cluster.main.zookeeper_connect_string
}

output "msk_cluster_arn" {
  description = "MSK cluster ARN"
  value       = aws_msk_cluster.main.arn
}
