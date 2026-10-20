# AWS-managed policies, looked up by name so no IDs are hardcoded.
data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_response_headers_policy" "security_headers" {
  name = "Managed-SecurityHeadersPolicy"
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${var.project}-s3-oac"
  description                       = "CloudFront -> private S3 bucket for ${var.domain}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "viewer_request" {
  name    = "${var.project}-viewer-request"
  runtime = "cloudfront-js-2.0"
  comment = "Origin lock + www -> apex redirect + /dir -> /dir/index.html rewrite for Astro output"
  publish = true

  # The code gets only SHA-256 digests of the secrets (origin-lock.tf), so the plan can show it.
  code = templatefile("${path.module}/functions/viewer-request.js", {
    verify_header = local.origin_verify_header
    verify_sha256 = [for g in sort(local.origin_verify_accepted) : nonsensitive(sha256(random_password.origin_verify[g].result))]
    enforce       = var.origin_lock_enforce
  })
}

# The code CloudFront actually runs. The resource above reads its code from the DEVELOPMENT stage,
# so a failed publish would leave LIVE on old code while plans show no changes; origin-lock.tf
# checks this against the configured code. (ETags can't be compared: each stage numbers its own.)
# Read after the function is applied, since it refers to it.
data "aws_cloudfront_function" "viewer_request_live" {
  name  = aws_cloudfront_function.viewer_request.name
  stage = "LIVE"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project} (${var.domain})"
  default_root_object = "index.html"
  http_version        = "http2and3"
  price_class         = "PriceClass_All" # free tier covers 1 TB/month; keeps South-American edges for Colombian visitors
  aliases             = [var.domain, "www.${var.domain}"]

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-${local.bucket_name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  default_cache_behavior {
    target_origin_id           = "s3-${local.bucket_name}"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.viewer_request.arn
    }
  }

  # S3 via OAC answers 403 for missing keys (no ListBucket), so map both to Astro's 404 page.
  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 60
  }

  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 60
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
