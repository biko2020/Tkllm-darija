# =============================================================================
# Module — monitoring
# infrastructure/terraform/modules/monitoring/main.tf
#
# CloudWatch Alarms, Log Groups, SNS Topics, Dashboard.
# Complements Prometheus/Grafana with AWS-native infrastructure alerting.
# =============================================================================

# ── SNS Topics ────────────────────────────────────────────────────────────────

resource "aws_sns_topic" "critical" {
  name              = "${var.name_prefix}-alerts-critical"
  kms_master_key_id = "alias/aws/sns"
  tags              = merge(var.tags, { Severity = "critical" })
}

resource "aws_sns_topic" "warning" {
  name              = "${var.name_prefix}-alerts-warning"
  kms_master_key_id = "alias/aws/sns"
  tags              = merge(var.tags, { Severity = "warning" })
}

resource "aws_sns_topic_subscription" "critical_email" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.critical.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_sns_topic_subscription" "warning_email" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.warning.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ── CloudWatch Log Groups ─────────────────────────────────────────────────────

locals {
  log_groups = {
    api            = "/tkllm-darija/${var.environment}/api"
    asr_worker     = "/tkllm-darija/${var.environment}/asr-worker"
    quality_engine = "/tkllm-darija/${var.environment}/quality-engine"
    analytics      = "/tkllm-darija/${var.environment}/analytics"
    financial      = "/tkllm-darija/${var.environment}/financial"
    data_pipeline  = "/tkllm-darija/${var.environment}/data-pipeline"
    eks_app        = "/aws/eks/${var.name_prefix}/application"
  }
}

resource "aws_cloudwatch_log_group" "services" {
  for_each          = local.log_groups
  name              = each.value
  retention_in_days = var.environment == "prod" ? 90 : 30
  tags              = var.tags
}

# ── RDS Alarms ────────────────────────────────────────────────────────────────

resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "${var.name_prefix}-rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS CPU above 80% for 3 consecutive minutes"
  alarm_actions       = [aws_sns_topic.warning.arn]
  ok_actions          = [aws_sns_topic.warning.arn]
  treat_missing_data  = "notBreaching"
  dimensions          = { DBInstanceIdentifier = "${var.name_prefix}-postgres" }
  tags                = var.tags
}

resource "aws_cloudwatch_metric_alarm" "rds_storage_low" {
  alarm_name          = "${var.name_prefix}-rds-storage-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 10737418240 # 10 GB in bytes
  alarm_description   = "RDS free storage below 10 GB"
  alarm_actions       = [aws_sns_topic.critical.arn]
  ok_actions          = [aws_sns_topic.critical.arn]
  treat_missing_data  = "notBreaching"
  dimensions          = { DBInstanceIdentifier = "${var.name_prefix}-postgres" }
  tags                = var.tags
}

resource "aws_cloudwatch_metric_alarm" "rds_connections_high" {
  alarm_name          = "${var.name_prefix}-rds-connections-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 180
  alarm_description   = "RDS connections above 180 (max 200)"
  alarm_actions       = [aws_sns_topic.critical.arn]
  ok_actions          = [aws_sns_topic.critical.arn]
  treat_missing_data  = "notBreaching"
  dimensions          = { DBInstanceIdentifier = "${var.name_prefix}-postgres" }
  tags                = var.tags
}

resource "aws_cloudwatch_metric_alarm" "rds_read_latency_high" {
  alarm_name          = "${var.name_prefix}-rds-read-latency-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "ReadLatency"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 0.02 # 20ms
  alarm_description   = "RDS read latency above 20ms — check for missing indexes"
  alarm_actions       = [aws_sns_topic.warning.arn]
  treat_missing_data  = "notBreaching"
  dimensions          = { DBInstanceIdentifier = "${var.name_prefix}-postgres" }
  tags                = var.tags
}

resource "aws_cloudwatch_metric_alarm" "rds_replica_lag" {
  count               = var.environment == "prod" ? 1 : 0
  alarm_name          = "${var.name_prefix}-rds-replica-lag"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ReplicaLag"
  namespace           = "AWS/RDS"
  period              = 60
  statistic           = "Average"
  threshold           = 30
  alarm_description   = "RDS replica lag above 30s (prod only)"
  alarm_actions       = [aws_sns_topic.critical.arn]
  treat_missing_data  = "notBreaching"
  dimensions          = { DBInstanceIdentifier = "${var.name_prefix}-postgres" }
  tags                = var.tags
}

# ── ElastiCache / Redis Alarms ────────────────────────────────────────────────

resource "aws_cloudwatch_metric_alarm" "redis_memory_high" {
  alarm_name          = "${var.name_prefix}-redis-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = 60
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "Redis memory above 85% — eviction risk (allkeys-lru)"
  alarm_actions       = [aws_sns_topic.warning.arn]
  ok_actions          = [aws_sns_topic.warning.arn]
  treat_missing_data  = "notBreaching"
  dimensions          = { ReplicationGroupId = "${var.name_prefix}-redis" }
  tags                = var.tags
}

resource "aws_cloudwatch_metric_alarm" "redis_memory_critical" {
  alarm_name          = "${var.name_prefix}-redis-memory-critical"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = 60
  statistic           = "Average"
  threshold           = 95
  alarm_description   = "Redis memory above 95% — active BullMQ job eviction likely"
  alarm_actions       = [aws_sns_topic.critical.arn]
  ok_actions          = [aws_sns_topic.critical.arn]
  treat_missing_data  = "notBreaching"
  dimensions          = { ReplicationGroupId = "${var.name_prefix}-redis" }
  tags                = var.tags
}

resource "aws_cloudwatch_metric_alarm" "redis_cpu_high" {
  alarm_name          = "${var.name_prefix}-redis-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "EngineCPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = 60
  statistic           = "Average"
  threshold           = 90
  alarm_description   = "Redis engine CPU above 90% — command latency increasing"
  alarm_actions       = [aws_sns_topic.critical.arn]
  treat_missing_data  = "notBreaching"
  dimensions          = { ReplicationGroupId = "${var.name_prefix}-redis" }
  tags                = var.tags
}

resource "aws_cloudwatch_metric_alarm" "redis_replication_lag" {
  count               = var.environment == "prod" ? 1 : 0
  alarm_name          = "${var.name_prefix}-redis-replication-lag"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ReplicationLag"
  namespace           = "AWS/ElastiCache"
  period              = 60
  statistic           = "Average"
  threshold           = 10
  alarm_description   = "Redis replica lag above 10s — failover may use stale data"
  alarm_actions       = [aws_sns_topic.warning.arn]
  treat_missing_data  = "notBreaching"
  dimensions          = { ReplicationGroupId = "${var.name_prefix}-redis" }
  tags                = var.tags
}

# ── MSK / Kafka Alarms ────────────────────────────────────────────────────────

resource "aws_cloudwatch_metric_alarm" "msk_storage_low" {
  alarm_name          = "${var.name_prefix}-msk-storage-low"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "KafkaDataLogsDiskUsed"
  namespace           = "AWS/Kafka"
  period              = 300
  statistic           = "Average"
  threshold           = 20
  alarm_description   = "MSK broker disk > 80% used — increase storage or reduce retention"
  alarm_actions       = [aws_sns_topic.critical.arn]
  ok_actions          = [aws_sns_topic.critical.arn]
  treat_missing_data  = "notBreaching"
  dimensions          = { "Cluster Name" = "${var.name_prefix}-kafka" }
  tags                = var.tags
}

resource "aws_cloudwatch_metric_alarm" "msk_active_controller" {
  alarm_name          = "${var.name_prefix}-msk-no-active-controller"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ActiveControllerCount"
  namespace           = "AWS/Kafka"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "MSK has no active controller — broker failure"
  alarm_actions       = [aws_sns_topic.critical.arn]
  ok_actions          = [aws_sns_topic.critical.arn]
  treat_missing_data  = "breaching"
  dimensions          = { "Cluster Name" = "${var.name_prefix}-kafka" }
  tags                = var.tags
}

resource "aws_cloudwatch_metric_alarm" "msk_under_replicated" {
  alarm_name          = "${var.name_prefix}-msk-under-replicated"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "UnderReplicatedPartitions"
  namespace           = "AWS/Kafka"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "MSK has under-replicated partitions"
  alarm_actions       = [aws_sns_topic.warning.arn]
  ok_actions          = [aws_sns_topic.warning.arn]
  treat_missing_data  = "notBreaching"
  dimensions          = { "Cluster Name" = "${var.name_prefix}-kafka" }
  tags                = var.tags
}

resource "aws_cloudwatch_metric_alarm" "msk_offline_partitions" {
  alarm_name          = "${var.name_prefix}-msk-offline-partitions"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "OfflinePartitionsCount"
  namespace           = "AWS/Kafka"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "MSK has offline partitions — producers/consumers blocked"
  alarm_actions       = [aws_sns_topic.critical.arn]
  ok_actions          = [aws_sns_topic.critical.arn]
  treat_missing_data  = "breaching"
  dimensions          = { "Cluster Name" = "${var.name_prefix}-kafka" }
  tags                = var.tags
}

# ── EKS Node Alarms ───────────────────────────────────────────────────────────

resource "aws_cloudwatch_metric_alarm" "eks_node_cpu_high" {
  alarm_name          = "${var.name_prefix}-eks-node-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 5
  metric_name         = "node_cpu_utilization"
  namespace           = "ContainerInsights"
  period              = 60
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "EKS node CPU above 85% for 5 minutes — cluster autoscaler should trigger"
  alarm_actions       = [aws_sns_topic.warning.arn]
  ok_actions          = [aws_sns_topic.warning.arn]
  treat_missing_data  = "notBreaching"
  dimensions          = { ClusterName = var.name_prefix }
  tags                = var.tags
}

resource "aws_cloudwatch_metric_alarm" "eks_node_memory_high" {
  alarm_name          = "${var.name_prefix}-eks-node-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 5
  metric_name         = "node_memory_utilization"
  namespace           = "ContainerInsights"
  period              = 60
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "EKS node memory above 85% for 5 minutes"
  alarm_actions       = [aws_sns_topic.warning.arn]
  ok_actions          = [aws_sns_topic.warning.arn]
  treat_missing_data  = "notBreaching"
  dimensions          = { ClusterName = var.name_prefix }
  tags                = var.tags
}

resource "aws_cloudwatch_metric_alarm" "eks_pod_restarts_high" {
  alarm_name          = "${var.name_prefix}-eks-pod-restarts-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "pod_number_of_container_restarts"
  namespace           = "ContainerInsights"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "More than 10 container restarts in 5 minutes — CrashLoopBackOff likely"
  alarm_actions       = [aws_sns_topic.critical.arn]
  treat_missing_data  = "notBreaching"
  dimensions          = { ClusterName = var.name_prefix }
  tags                = var.tags
}

# ── CloudWatch Dashboard ──────────────────────────────────────────────────────

resource "aws_cloudwatch_dashboard" "tkllm" {
  dashboard_name = "${var.name_prefix}-infrastructure"

  dashboard_body = jsonencode({
    start          = "-PT3H"
    periodOverride = "auto"
    widgets = [

      # ── RDS ──────────────────────────────────────────────────────────────
      {
        type       = "metric"
        x = 0; y = 0; width = 8; height = 6
        properties = {
          title   = "RDS — CPU Utilization"
          period  = 60
          view    = "timeSeries"
          metrics = [["AWS/RDS", "CPUUtilization",
            "DBInstanceIdentifier", "${var.name_prefix}-postgres",
            { label = "CPU %", color = "#e07b39" }]]
          annotations = { horizontal = [{ value = 80, label = "Warning", color = "#f89256" }] }
        }
      },
      {
        type       = "metric"
        x = 8; y = 0; width = 8; height = 6
        properties = {
          title   = "RDS — Connections"
          period  = 60
          view    = "timeSeries"
          metrics = [["AWS/RDS", "DatabaseConnections",
            "DBInstanceIdentifier", "${var.name_prefix}-postgres",
            { label = "Connections" }]]
          annotations = { horizontal = [
            { value = 180, label = "Warning (180)",  color = "#f89256" },
            { value = 200, label = "Max (200)",      color = "#d62728" }
          ]}
        }
      },
      {
        type       = "metric"
        x = 16; y = 0; width = 8; height = 6
        properties = {
          title   = "RDS — Free Storage"
          period  = 300
          view    = "timeSeries"
          metrics = [["AWS/RDS", "FreeStorageSpace",
            "DBInstanceIdentifier", "${var.name_prefix}-postgres",
            { label = "Free Storage (bytes)" }]]
          annotations = { horizontal = [{ value = 10737418240, label = "10 GB threshold", color = "#d62728" }] }
        }
      },

      # ── Redis ─────────────────────────────────────────────────────────────
      {
        type       = "metric"
        x = 0; y = 6; width = 8; height = 6
        properties = {
          title   = "Redis — Memory Usage %"
          period  = 60
          view    = "timeSeries"
          metrics = [["AWS/ElastiCache", "DatabaseMemoryUsagePercentage",
            "ReplicationGroupId", "${var.name_prefix}-redis",
            { label = "Memory %" }]]
          annotations = { horizontal = [
            { value = 85, label = "Warning (85%)",  color = "#f89256" },
            { value = 95, label = "Critical (95%)", color = "#d62728" }
          ]}
        }
      },
      {
        type       = "metric"
        x = 8; y = 6; width = 8; height = 6
        properties = {
          title   = "Redis — Cache Hits vs Misses"
          period  = 60
          view    = "timeSeries"
          metrics = [
            ["AWS/ElastiCache", "CacheHits",   "ReplicationGroupId", "${var.name_prefix}-redis",
              { label = "Hits",   stat = "Sum", color = "#2ca02c" }],
            ["AWS/ElastiCache", "CacheMisses", "ReplicationGroupId", "${var.name_prefix}-redis",
              { label = "Misses", stat = "Sum", color = "#d62728" }]
          ]
        }
      },
      {
        type       = "metric"
        x = 16; y = 6; width = 8; height = 6
        properties = {
          title   = "Redis — Engine CPU"
          period  = 60
          view    = "timeSeries"
          metrics = [["AWS/ElastiCache", "EngineCPUUtilization",
            "ReplicationGroupId", "${var.name_prefix}-redis",
            { label = "CPU %" }]]
        }
      },

      # ── MSK ───────────────────────────────────────────────────────────────
      {
        type       = "metric"
        x = 0; y = 12; width = 8; height = 6
        properties = {
          title   = "MSK — Disk Used %"
          period  = 300
          view    = "timeSeries"
          metrics = [["AWS/Kafka", "KafkaDataLogsDiskUsed",
            "Cluster Name", "${var.name_prefix}-kafka",
            { label = "Disk Used %" }]]
          annotations = { horizontal = [{ value = 80, label = "80% threshold", color = "#d62728" }] }
        }
      },
      {
        type       = "metric"
        x = 8; y = 12; width = 8; height = 6
        properties = {
          title   = "MSK — Partition Health"
          period  = 60
          view    = "timeSeries"
          metrics = [
            ["AWS/Kafka", "UnderReplicatedPartitions", "Cluster Name", "${var.name_prefix}-kafka",
              { label = "Under-Replicated", stat = "Sum", color = "#f89256" }],
            ["AWS/Kafka", "OfflinePartitionsCount", "Cluster Name", "${var.name_prefix}-kafka",
              { label = "Offline", stat = "Sum", color = "#d62728" }]
          ]
        }
      },
      {
        type       = "metric"
        x = 16; y = 12; width = 8; height = 6
        properties = {
          title   = "MSK — Active Controller"
          period  = 60
          view    = "timeSeries"
          metrics = [["AWS/Kafka", "ActiveControllerCount",
            "Cluster Name", "${var.name_prefix}-kafka",
            { label = "Controllers", stat = "Sum" }]]
          annotations = { horizontal = [{ value = 1, label = "Expected", color = "#2ca02c" }] }
        }
      },

      # ── EKS + Alarm Summary ───────────────────────────────────────────────
      {
        type       = "metric"
        x = 0; y = 18; width = 12; height = 6
        properties = {
          title   = "EKS — Node CPU & Memory"
          period  = 60
          view    = "timeSeries"
          metrics = [
            ["ContainerInsights", "node_cpu_utilization",    "ClusterName", var.name_prefix,
              { label = "CPU %", color = "#1f77b4" }],
            ["ContainerInsights", "node_memory_utilization", "ClusterName", var.name_prefix,
              { label = "Memory %", color = "#ff7f0e", yAxis = "right" }]
          ]
        }
      },
      {
        type       = "alarm"
        x = 12; y = 18; width = 12; height = 6
        properties = {
          title  = "Active CloudWatch Alarms"
          alarms = [
            aws_cloudwatch_metric_alarm.rds_cpu_high.arn,
            aws_cloudwatch_metric_alarm.rds_storage_low.arn,
            aws_cloudwatch_metric_alarm.rds_connections_high.arn,
            aws_cloudwatch_metric_alarm.redis_memory_high.arn,
            aws_cloudwatch_metric_alarm.redis_cpu_high.arn,
            aws_cloudwatch_metric_alarm.msk_storage_low.arn,
            aws_cloudwatch_metric_alarm.msk_active_controller.arn,
            aws_cloudwatch_metric_alarm.msk_offline_partitions.arn,
            aws_cloudwatch_metric_alarm.eks_node_cpu_high.arn,
            aws_cloudwatch_metric_alarm.eks_node_memory_high.arn,
          ]
        }
      }
    ]
  })
}
