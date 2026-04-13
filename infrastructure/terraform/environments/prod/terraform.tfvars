# =============================================================================
# Terraform Variable Values — prod
# infrastructure/terraform/environments/prod/terraform.tfvars
#
# ⚠️  NEVER commit real secrets to git.
#    Use terraform.tfvars for non-sensitive values.
#    Inject secrets via:
#      export TF_VAR_db_password="$(aws ssm get-parameter --name /tkllm-darija/prod/DATABASE_PASSWORD --with-decryption --query Parameter.Value --output text)"
#      export TF_VAR_redis_auth_token="$(aws ssm get-parameter --name /tkllm-darija/prod/REDIS_PASSWORD --with-decryption --query Parameter.Value --output text)"
#
# Or use a .tfvars.secret file (add to .gitignore):
#   terraform apply -var-file=terraform.tfvars -var-file=terraform.tfvars.secret
# =============================================================================

aws_region         = "eu-west-1"
availability_zones = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]

vpc_cidr = "10.0.0.0/16"

eks_cluster_version     = "1.31"
eks_node_instance_types = ["m6i.large"]
eks_gpu_instance_types  = ["g5.xlarge"]
eks_node_min            = 3
eks_node_max            = 10
eks_node_desired        = 3
eks_gpu_node_min        = 0
eks_gpu_node_max        = 2

db_instance_class        = "db.m6g.large"
db_allocated_storage     = 100
db_max_allocated_storage = 500
# db_password = set via TF_VAR_db_password env var

redis_node_type = "cache.m6g.large"
# redis_auth_token = set via TF_VAR_redis_auth_token env var

msk_instance_type = "kafka.m6g.large"
msk_kafka_version = "3.6.0"

alert_email = "ops-prod@tkllm-darija.ma"

tags = {
  Project     = "tkllm-darija"
  Environment = "prod"
}
