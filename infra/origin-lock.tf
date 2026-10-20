# Origin lock: CloudFront only serves requests that came through Cloudflare, so Cloudflare's
# analytics and protection always apply. Cloudflare adds a secret header to the HTTPS requests it
# sends to CloudFront for the site hostnames, and the viewer-request function (cloudfront.tf)
# answers 403 without it. Requests to the *.cloudfront.net name, or to a CloudFront IP with the
# real Host, never carry it. README.md, "Origin lock", covers rotation and recovery.

locals {
  origin_verify_header = "x-origin-verify"

  # Generations of the secret: CloudFront accepts every one listed, Cloudflare sends one.
  # Rotate in three PRs, each applied before the next: add a generation, point `sent` at it,
  # then drop the old one.
  origin_verify_accepted = ["1"]
  origin_verify_sent     = "1"
}

# Stored in the state (private, encrypted bucket) and in the Cloudflare rule below, so whoever can
# read either can read it (README.md, Origin lock). Letters and digits: no escaping in a header.
resource "random_password" "origin_verify" {
  for_each = toset(local.origin_verify_accepted)

  length  = 64
  special = false
}

# The zone's entry point for Request Header Transform Rules. OpenTofu owns the whole phase: a
# request header rule added in the dashboard is removed by the next apply.
resource "cloudflare_ruleset" "request_headers" {
  zone_id     = local.zone_id
  name        = "${var.project} request headers"
  description = "Request Header Transform Rules (managed by OpenTofu)"
  kind        = "zone"
  phase       = "http_request_late_transform"

  # sensitive() on the whole list, not just the secret: the plan summary is public, and a mark on
  # the value alone would not cover a copy of the rule that shows up as drift.
  rules = sensitive([{
    ref         = "origin_verify"
    description = "Prove to CloudFront that the request came through Cloudflare (managed by OpenTofu)"
    enabled     = true
    # `ssl`: Full (strict) uses the visitor's scheme toward the origin, so a plain-HTTP request
    # would carry the secret in clear. Those reach CloudFront without it and get its HTTPS redirect.
    # Site hostnames only: the zone's other proxied records must never receive the secret.
    expression = "(http.host in {\"${var.domain}\" \"www.${var.domain}\"} and ssl)"
    action     = "rewrite"
    action_parameters = {
      headers = {
        (local.origin_verify_header) = {
          operation = "set"
          value     = random_password.origin_verify[local.origin_verify_sent].result
        }
      }
    }
  }])

  # Publish the function first: if publishing fails, the apply stops before Cloudflare changes
  # what it sends, so Cloudflare keeps sending a secret the live function accepts.
  depends_on = [aws_cloudfront_function.viewer_request]

  lifecycle {
    # Checked when planning and, if the function changes in the same apply, again after it is
    # published. CI plans and applies seconds apart in one job, so Cloudflare doesn't switch
    # secrets while CloudFront runs stale code. It can't see distribution deployment: edges pick
    # up a publish only once the distribution is Deployed again (README.md, Origin lock, Rotation).
    precondition {
      condition     = data.aws_cloudfront_function.viewer_request_live.code == aws_cloudfront_function.viewer_request.code
      error_message = "The CloudFront Function's LIVE stage does not run the configured code (a failed publish?). Publish it as infra/README.md (Origin lock, Recovery) shows, then re-run."
    }
  }
}
