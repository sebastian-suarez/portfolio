provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = var.project
      ManagedBy = "opentofu"
      Repo      = "${var.github_owner}/${var.github_repo}"
    }
  }
}
