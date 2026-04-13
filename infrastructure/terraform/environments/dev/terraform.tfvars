# =============================================================================
# Terraform Variable Values — dev
# infrastructure/terraform/environments/dev/terraform.tfvars
#
# ⚠️  NEVER commit real secrets to git.
#    Use terraform.tfvars for non-sensitive values.
#    Inject secrets via:
#      export TF_VAR_db_password="$(aws ssm get-parameter --name /tkllm-darija/dev/DATABASE_PASSWORD --with-decryption --query Parameter.Value --output text)"
#      export TF_VAR_redis_auth_token="$(aws ssm get-parameter --name /tkllm-darija/dev/REDIS_PASSWORD --with-decryption --query Parameter.Value --output text)"
#      export TF_VAR_cloudflare_api_token="$CLOUDFLARE_API_TOKEN"
#
# Or use a .tfvars.secret file (add to .gitignore):
#   terraform apply -var-file=terraform.tfvars -var-file=terraform.tfvars.secret
# =============================================================================

# ── General ───────────────────────────────────────────────────────────────────
aws_region         = "eu-west-1"
availability_zones = ["eu-west-1a", "eu-west-1b"]

# ── Networking ────────────────────────────────────────────────────────────────
vpc_cidr = "10.10.0.0/16"

# ── EKS ───────────────────────────────────────────────────────────────────────
eks_cluster_version     = "1.31"
eks_node_instance_types = ["t3.large"]
eks_gpu_instance_types  = ["g4dn.xlarge"]
eks_node_min            = 1
eks_node_max            = 3
eks_node_desired        = 2
eks_gpu_node_min        = 0   # KEDA scales to 0 when idle — saves GPU cost
eks_gpu_node_max        = 1

# ── RDS ───────────────────────────────────────────────────────────────────────
db_instance_class        = "db.t4g.small"
db_allocated_storage     = 20
db_max_allocated_storage = 100
# db_password = set via TF_VAR_db_password env var

# ── ElastiCache ───────────────────────────────────────────────────────────────
redis_node_type = "cache.t4g.micro"
# redis_auth_token = set via TF_VAR_redis_auth_token env var

# ── MSK ───────────────────────────────────────────────────────────────────────
msk_instance_type = "kafka.t3.small"
msk_kafka_version = "3.6.0"

# ── Cloudflare ────────────────────────────────────────────────────────────────
# cloudflare_api_token  = set via TF_VAR_cloudflare_api_token env var
cloudflare_account_id = "REPLACE_WITH_CLOUDFLARE_ACCOUNT_ID"
cloudflare_zone_id    = "REPLACE_WITH_CLOUDFLARE_ZONE_ID"

# ── Monitoring ────────────────────────────────────────────────────────────────
alert_email = ""   # leave empty to skip email subscription in dev
