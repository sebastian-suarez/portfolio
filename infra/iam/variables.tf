variable "project" {
  description = "Short slug used in role names and tags."
  type        = string
  default     = "portfolio"
}

variable "aws_region" {
  description = "Region of the state bucket and of the site stack."
  type        = string
  default     = "us-east-1"
}

variable "domain" {
  description = "Apex domain of the site (same value as ../terraform.tfvars); the site bucket name derives from it."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9.-]+\\.[a-z]{2,}$", var.domain)) && !startswith(var.domain, "www.")
    error_message = "Use the bare apex domain in lowercase, without www. or a trailing dot."
  }
}

variable "cloudfront_distribution_id" {
  description = "ID of the site's CloudFront distribution (tofu output cloudfront_distribution_id in ../). Update it if the distribution is ever replaced."
  type        = string

  validation {
    condition     = can(regex("^E[A-Z0-9]{8,20}$", var.cloudfront_distribution_id))
    error_message = "Use a CloudFront distribution ID such as E37O7NIBWC8IQB."
  }
}

variable "state_bucket" {
  description = "S3 bucket holding OpenTofu state (same value as ../backend.hcl)."
  type        = string
}

variable "github_owner" {
  description = "GitHub user or org that owns the repo."
  type        = string
}

variable "github_owner_id" {
  description = "Numeric ID of the owner (gh api users/<owner> --jq .id). Part of GitHub's immutable OIDC subject."
  type        = string

  validation {
    condition     = can(regex("^[0-9]+$", var.github_owner_id))
    error_message = "Use the numeric owner ID."
  }
}

variable "github_repo" {
  description = "Repository name (without owner)."
  type        = string
}

variable "github_repo_id" {
  description = "Numeric ID of the repository (gh api repos/<owner>/<repo> --jq .id). Part of GitHub's immutable OIDC subject."
  type        = string

  validation {
    condition     = can(regex("^[0-9]+$", var.github_repo_id))
    error_message = "Use the numeric repository ID."
  }
}

variable "deploy_environment" {
  description = "GitHub environment whose jobs may publish the site."
  type        = string
  default     = "production"
}

variable "infra_environment" {
  description = "GitHub environment whose jobs may run tofu apply on ../ (the site stack)."
  type        = string
  default     = "infra"
}
