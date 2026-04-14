output "zone_id" {
  description = "Cloudflare zone ID"
  value       = cloudflare_zone.main.id
}

output "zone_name" {
  description = "Cloudflare zone name"
  value       = cloudflare_zone.main.zone
}

output "dns_record_ids" {
  description = "Map of DNS record keys to record IDs"
  value = { for k, r in cloudflare_record.main : k => r.id }
}
