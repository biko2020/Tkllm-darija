# MSK Terraform Module — main.tf
# Provisions an Amazon MSK (Kafka) cluster.

resource "aws_msk_cluster" "main" {
  cluster_name           = "${var.name_prefix}-msk"
  kafka_version          = var.kafka_version
  number_of_broker_nodes = var.broker_count
  broker_node_group_info {
    instance_type   = var.broker_instance_type
    client_subnets  = var.subnet_ids
    security_groups = var.security_group_ids
    storage_info {
      ebs_storage_info {
        volume_size = var.broker_volume_size
      }
    }
  }
  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
    encryption_at_rest_kms_key_arn = var.kms_key_arn
  }
  enhanced_monitoring = var.enhanced_monitoring
  tags                = var.tags
}
