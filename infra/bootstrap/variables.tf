variable "project" {
  description = "Short slug used in names and tags. Must match ../iam/: the role pattern and the boundary name derive from it."
  type        = string
  default     = "portfolio"
}

variable "aws_region" {
  description = "Region of the state bucket and of the Resource Group."
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

variable "iam_environment" {
  description = "GitHub environment whose jobs may apply ../iam/. Restrict it to main before the first apply."
  type        = string
  default     = "infra-iam"
}
