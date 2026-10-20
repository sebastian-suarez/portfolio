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
  description = "GitHub user or org that owns the repo (the OIDC trust is scoped to it)."
  type        = string
}

variable "github_repo" {
  description = "Repository name (without owner)."
  type        = string
}

variable "github_deploy_branch" {
  description = "Only pushes to this branch may assume the deploy role."
  type        = string
  default     = "main"
}

variable "github_environment" {
  description = "GitHub Actions environment the deploy job runs in (also trusted by the role)."
  type        = string
  default     = "production"
}
