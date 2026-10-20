# The roles GitHub Actions assumes, plus the portfolio Resource Group (resource-group.tf). Applied by
# GitHub Actions on merges to main, with the tofu-iam role from ../bootstrap/: it may only manage
# portfolio-github-* roles that carry portfolio-github-boundary, so every role here stays under that
# ceiling. The boundary, the tofu-iam role and the OIDC provider live in ../bootstrap/, applied from a
# laptop, so a workflow can't raise its own ceiling.

# Resource identities come from terraform.tfvars here, never from the site stack's state: the site
# apply role can write that state, so reading its outputs would let it choose what these roles grant.
data "aws_caller_identity" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id

  # Same naming rule as ../s3.tf.
  site_bucket_arn  = "arn:aws:s3:::site-${replace(var.domain, ".", "-")}"
  distribution_arn = "arn:aws:cloudfront::${local.account_id}:distribution/${var.cloudfront_distribution_id}"
  state_bucket_arn = "arn:aws:s3:::${var.state_bucket}"
  site_state_key   = "portfolio/terraform.tfstate"
  iam_state_key    = "portfolio/iam.tfstate"
  group_arn        = "arn:aws:resource-groups:${var.aws_region}:${local.account_id}:group/${var.project}"

  # Created by ../bootstrap/ with the same var.project.
  oidc_provider_arn = "arn:aws:iam::${local.account_id}:oidc-provider/token.actions.githubusercontent.com"
  boundary_arn      = "arn:aws:iam::${local.account_id}:policy/${var.project}-github-boundary"
  managed_roles_arn = "arn:aws:iam::${local.account_id}:role/${var.project}-github-*"

  # GitHub's immutable OIDC subject: repositories created after 15 Jul 2026 send
  # repo:OWNER@OWNER_ID/REPO@REPO_ID:<context>, which survives renames and cannot be claimed
  # by someone who later takes over the old name.
  github_sub_prefix = "repo:${var.github_owner}@${var.github_owner_id}/${var.github_repo}@${var.github_repo_id}"

  # Which GitHub job context each role trusts. A job that declares `environment:` always presents
  # the environment form, so the branch restriction lives on the environment in GitHub.
  role_subjects = {
    deploy     = "environment:${var.deploy_environment}"
    tofu_apply = "environment:${var.infra_environment}"
    tofu_plan  = "pull_request"
  }
}

data "aws_iam_policy_document" "trust" {
  for_each = local.role_subjects

  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["${local.github_sub_prefix}:${each.value}"]
    }
  }
}
