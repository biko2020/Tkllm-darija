# Cloudflare Terraform Module — main.tf
# Provisions Cloudflare zone, DNS records, and security settings.

resource "cloudflare_zone" "main" {
  zone = var.domain
  account_id = var.account_id
}

resource "cloudflare_record" "main" {
  for_each = var.dns_records
  zone_id  = cloudflare_zone.main.id
  name     = each.value.name
  type     = each.value.type
  value    = each.value.value
  ttl      = each.value.ttl
  proxied  = each.value.proxied
}

resource "cloudflare_page_rule" "main" {
  for_each = var.page_rules
  zone_id  = cloudflare_zone.main.id
  target   = each.value.target
  actions  = each.value.actions
  priority = each.value.priority
}
