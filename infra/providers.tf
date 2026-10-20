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

# Auth comes from the CLOUDFLARE_API_TOKEN env var: a token for this zone only, with Zone Read, DNS Read
# and Transform Rules Read to plan, and DNS Edit and Transform Rules Edit as well to apply.
provider "cloudflare" {}
