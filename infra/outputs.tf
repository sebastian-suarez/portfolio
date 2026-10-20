output "site_url" {
  value = "https://${var.domain}"
}

output "s3_bucket" {
  description = "GitHub Actions variable S3_BUCKET"
  value       = aws_s3_bucket.site.bucket
}

output "cloudfront_distribution_id" {
  description = "GitHub Actions variable CLOUDFRONT_DISTRIBUTION_ID"
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "What the Cloudflare CNAMEs point at"
  value       = aws_cloudfront_distribution.site.domain_name
}
