# =============================================================================
# Module — monitoring — Outputs
# =============================================================================

output "critical_sns_arn" {
  description = "ARN of the critical-severity SNS topic. Wire to PagerDuty / Slack for paging."
  value       = aws_sns_topic.critical.arn
}

output "warning_sns_arn" {
  description = "ARN of the warning-severity SNS topic."
  value       = aws_sns_topic.warning.arn
}

output "log_group_names" {
  description = "Map of service key → CloudWatch log group name."
  value       = { for k, v in aws_cloudwatch_log_group.services : k => v.name }
}

output "dashboard_name" {
  description = "CloudWatch dashboard name. Open in AWS Console → CloudWatch → Dashboards."
  value       = aws_cloudwatch_dashboard.tkllm.dashboard_name
}

output "dashboard_url" {
  description = "Direct URL to the CloudWatch dashboard (requires AWS Console access)."
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#dashboards:name=${aws_cloudwatch_dashboard.tkllm.dashboard_name}"
}

data "aws_region" "current" {}
