# RDS Terraform Module — main.tf
# Provisions an RDS PostgreSQL instance with TimescaleDB extension.

resource "aws_db_subnet_group" "main" {
  name       = "${var.name_prefix}-db-subnet-group"
  subnet_ids = var.subnet_ids
  tags       = var.tags
}

resource "aws_db_instance" "main" {
  identifier              = "${var.name_prefix}-db"
  engine                  = "postgres"
  engine_version          = var.engine_version
  instance_class          = var.instance_class
  allocated_storage       = var.allocated_storage
  max_allocated_storage   = var.max_allocated_storage
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = var.security_group_ids
  username                = var.db_username
  password                = var.db_password
  db_name                 = var.db_name
  multi_az                = var.multi_az
  storage_encrypted       = true
  backup_retention_period = var.backup_retention_period
  skip_final_snapshot     = var.skip_final_snapshot
  deletion_protection     = var.deletion_protection
  publicly_accessible     = var.publicly_accessible
  tags                    = var.tags
}
