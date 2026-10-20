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

variable "github_owner" {
  description = "GitHub user or org that owns the repo (used in the Repo tag)."
  type        = string
}

variable "github_repo" {
  description = "Repository name, without owner (used in the Repo tag)."
  type        = string
}
