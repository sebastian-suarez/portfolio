# Zone lookup: the token only needs Zone:Read + DNS:Edit on this one zone.
data "cloudflare_zones" "site" {
  name = var.domain
}

locals {
  zone_id = data.cloudflare_zones.site.result[0].id
}

# ACM DNS validation records. MUST stay DNS-only (proxied = false): a proxied
# CNAME answers with Cloudflare IPs and ACM would never see the token.
resource "cloudflare_dns_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = local.zone_id
  name    = trimsuffix(each.value.name, ".")
  type    = each.value.type
  content = trimsuffix(each.value.record, ".")
  ttl     = 60
  proxied = false
  comment = "ACM validation for CloudFront (managed by OpenTofu)"
}

# Site records: apex + www -> CloudFront, proxied (orange cloud).
# Cloudflare flattens the apex CNAME automatically. Requires SSL/TLS mode Full (strict)
# on the zone, which the hardening guide already set. Not managed here while attach_domain = false.
resource "cloudflare_dns_record" "apex" {
  count = var.attach_domain ? 1 : 0

  zone_id = local.zone_id
  name    = var.domain
  type    = "CNAME"
  content = aws_cloudfront_distribution.site.domain_name
  ttl     = 1 # 1 = automatic (required for proxied records)
  proxied = true
  comment = "Portfolio -> CloudFront (managed by OpenTofu)"
}

resource "cloudflare_dns_record" "www" {
  count = var.attach_domain ? 1 : 0

  zone_id = local.zone_id
  name    = "www.${var.domain}"
  type    = "CNAME"
  content = aws_cloudfront_distribution.site.domain_name
  ttl     = 1
  proxied = true
  comment = "Portfolio www -> CloudFront; CloudFront redirects to apex (managed by OpenTofu)"
}

# The two records were single resources before attach_domain existed.
moved {
  from = cloudflare_dns_record.apex
  to   = cloudflare_dns_record.apex[0]
}

moved {
  from = cloudflare_dns_record.www
  to   = cloudflare_dns_record.www[0]
}
