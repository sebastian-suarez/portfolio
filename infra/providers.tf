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

# Auth comes from the CLOUDFLARE_API_TOKEN env var (scoped token: Zone.DNS:Edit + Zone.Zone:Read on this zone only).
provider "cloudflare" {}
