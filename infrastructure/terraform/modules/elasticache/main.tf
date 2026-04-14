# ElastiCache Terraform Module — main.tf
# Provisions an ElastiCache Redis cluster with replication group.

resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.name_prefix}-redis-subnet-group"
  subnet_ids = var.subnet_ids
  tags       = var.tags
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id          = "${var.name_prefix}-redis"
  replication_group_description = "Redis cluster for ${var.name_prefix}"
  node_type                    = var.node_type
  number_cache_clusters        = var.num_nodes
  engine                       = "redis"
  engine_version               = var.engine_version
  automatic_failover_enabled   = var.automatic_failover
  multi_az_enabled             = var.multi_az
  subnet_group_name            = aws_elasticache_subnet_group.main.name
  security_group_ids           = var.security_group_ids
  at_rest_encryption_enabled   = true
  transit_encryption_enabled   = true
  port                         = var.port
  tags                         = var.tags
}
