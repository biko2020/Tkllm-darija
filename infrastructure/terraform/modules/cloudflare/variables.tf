variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "domain" {
  description = "Root domain for the Cloudflare zone"
  type        = string
}

variable "dns_records" {
  description = "Map of DNS record objects (name, type, value, ttl, proxied)"
  type = map(object({
    name    = string
    type    = string
    value   = string
    ttl     = number
    proxied = bool
  }))
  default = {}
}

variable "page_rules" {
  description = "Map of page rule objects (target, actions, priority)"
  type = map(object({
    target   = string
    actions  = map(any)
    priority = number
  }))
  default = {}
}
