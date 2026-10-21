variable "project" {
  description = "Short slug used in resource names and tags."
  type        = string
  default     = "portfolio"
}

variable "aws_region" {
  description = "Single region for this account. CloudFront + ACM for CloudFront must be us-east-1 anyway."
  type        = string
  default     = "us-east-1"
}

variable "domain" {
  description = "Apex domain of the site, already a zone in your Cloudflare account (e.g. example.com). www.<domain> redirects here."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9.-]+\\.[a-z]{2,}$", var.domain)) && !startswith(var.domain, "www.")
    error_message = "Use the bare apex domain in lowercase, without www. or a trailing dot."
  }
}

variable "site_bucket" {
  description = "Name of the private S3 bucket that holds the built site. Globally unique; same value in iam/ and bootstrap/, whose roles and boundary are scoped to it."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$", var.site_bucket)) && !strcontains(var.site_bucket, "..")
    error_message = "Use a valid S3 bucket name: 3-63 lowercase letters, digits, dots and hyphens, starting and ending with a letter or digit."
  }
}

variable "origin_lock_enforce" {
  description = "true: CloudFront answers 403 to requests that did not come through Cloudflare. false (report mode): it serves them and logs a line to CloudWatch Logs in us-east-1. See README.md, Origin lock."
  type        = bool
  default     = true
}

variable "github_owner" {
  description = "GitHub user or org that owns the repo (used in the Repo tag)."
  type        = string
}

variable "github_repo" {
  description = "Repository name, without owner (used in the Repo tag)."
  type        = string
}
