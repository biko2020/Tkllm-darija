# VPC Flow Logs to CloudWatch
resource "aws_cloudwatch_log_group" "vpc_flow" {
	name              = "/aws/vpc/${var.name_prefix}-flow-logs"
	retention_in_days = var.environment == "prod" ? 90 : 30
	tags              = var.tags
}

resource "aws_flow_log" "main" {
	log_destination_type = "cloud-watch-logs"
	log_group_name       = aws_cloudwatch_log_group.vpc_flow.name
	vpc_id              = aws_vpc.main.id
	traffic_type        = "ALL"
	tags                = var.tags
}
resource "aws_route_table" "isolated" {
	count = local.az_count
	vpc_id = aws_vpc.main.id
	tags   = merge({ Name = "${var.name_prefix}-isolated-rt-${count.index}" }, var.tags)
}

resource "aws_route_table_association" "isolated" {
	count          = local.az_count
	subnet_id      = aws_subnet.isolated[count.index].id
	route_table_id = aws_route_table.isolated[count.index].id
}
resource "aws_route_table" "private" {
	count = local.az_count
	vpc_id = aws_vpc.main.id
	tags   = merge({ Name = "${var.name_prefix}-private-rt-${count.index}" }, var.tags)
}

resource "aws_route" "private_nat" {
	count                  = local.az_count
	route_table_id         = aws_route_table.private[count.index].id
	destination_cidr_block = "0.0.0.0/0"
	nat_gateway_id         = aws_nat_gateway.main[var.environment == "prod" ? count.index : 0].id
}

resource "aws_route_table_association" "private" {
	count          = local.az_count
	subnet_id      = aws_subnet.private[count.index].id
	route_table_id = aws_route_table.private[count.index].id
}
# NAT Gateway(s): single in dev/staging, per-AZ in prod
resource "aws_eip" "nat" {
	count = var.environment == "prod" ? local.az_count : 1
	vpc   = true
	tags  = merge({ Name = "${var.name_prefix}-nat-eip-${count.index}" }, var.tags)
}

resource "aws_nat_gateway" "main" {
	count         = var.environment == "prod" ? local.az_count : 1
	allocation_id = aws_eip.nat[count.index].id
	subnet_id     = aws_subnet.public[count.index].id
	tags          = merge({ Name = "${var.name_prefix}-natgw-${count.index}" }, var.tags)
	depends_on    = [aws_internet_gateway.main]
}
resource "aws_route_table_association" "public" {
	count          = local.az_count
	subnet_id      = aws_subnet.public[count.index].id
	route_table_id = aws_route_table.public.id
}
resource "aws_internet_gateway" "main" {
	vpc_id = aws_vpc.main.id
	tags   = merge({ Name = "${var.name_prefix}-igw" }, var.tags)
}

resource "aws_route_table" "public" {
	vpc_id = aws_vpc.main.id
	tags   = merge({ Name = "${var.name_prefix}-public-rt" }, var.tags)
}

resource "aws_route" "public_internet" {
	route_table_id         = aws_route_table.public.id
	destination_cidr_block = "0.0.0.0/0"
	gateway_id             = aws_internet_gateway.main.id
}
resource "aws_subnet" "isolated" {
	count             = local.az_count
	vpc_id            = aws_vpc.main.id
	cidr_block        = cidrsubnet(var.cidr, 4, count.index + 2 * local.az_count)
	availability_zone = var.availability_zones[count.index]
	tags = merge({
		Name = "${var.name_prefix}-isolated-${var.availability_zones[count.index]}"
	}, var.tags)
}
resource "aws_subnet" "private" {
	count             = local.az_count
	vpc_id            = aws_vpc.main.id
	cidr_block        = cidrsubnet(var.cidr, 4, count.index + local.az_count)
	availability_zone = var.availability_zones[count.index]
	tags = merge({
		Name = "${var.name_prefix}-private-${var.availability_zones[count.index]}"
		"kubernetes.io/role/internal-elb" = 1
		"kubernetes.io/cluster/${var.name_prefix}" = "shared"
	}, var.tags)
}

# =============================================================================
# VPC Module — main.tf
# Provisions a multi-AZ VPC with public, private, and isolated subnets, NAT gateways, and flow logs.
# =============================================================================

resource "aws_vpc" "main" {
	cidr_block           = var.cidr
	enable_dns_support   = true
	enable_dns_hostnames = true
	tags = merge({
		Name = "${var.name_prefix}-vpc"
	}, var.tags)
}

locals {
	az_count = length(var.availability_zones)
}

resource "aws_subnet" "public" {
	count                   = local.az_count
	vpc_id                  = aws_vpc.main.id
	cidr_block              = cidrsubnet(var.cidr, 4, count.index)
	availability_zone       = var.availability_zones[count.index]
	map_public_ip_on_launch = true
	tags = merge({
		Name = "${var.name_prefix}-public-${var.availability_zones[count.index]}"
		"kubernetes.io/role/elb" = 1
		"kubernetes.io/cluster/${var.name_prefix}" = "shared"
	}, var.tags)
}
