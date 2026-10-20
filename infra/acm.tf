# CloudFront only accepts certificates from us-east-1 (var.aws_region is us-east-1, so no aliased provider needed).
resource "aws_acm_certificate" "site" {
  domain_name               = var.domain
  subject_alternative_names = ["www.${var.domain}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Blocks until ACM sees the CNAMEs above (typically 2-10 minutes on first apply).
resource "aws_acm_certificate_validation" "site" {
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for r in cloudflare_dns_record.acm_validation : r.name]
}
