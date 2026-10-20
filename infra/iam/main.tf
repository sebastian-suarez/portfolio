# Every IAM resource for the portfolio lives here, applied from a laptop with admin credentials.
# CI applies ../ (the site stack) with a role that has no IAM permissions, so a workflow can never
# widen its own access.

# Resource identities come from admin-controlled inputs (terraform.tfvars here), never from the
# site stack's state: CI can write that state, so reading its outputs would let a CI run choose what
# the next laptop apply grants.
data "aws_caller_identity" "current" {}

locals {
  # Same naming rule as ../s3.tf.
  site_bucket_arn  = "arn:aws:s3:::site-${replace(var.domain, ".", "-")}"
  distribution_arn = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${var.cloudfront_distribution_id}"
  state_bucket_arn = "arn:aws:s3:::${var.state_bucket}"
  site_state_key   = "portfolio/terraform.tfstate"

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

# One provider per AWS account and URL.
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  # AWS validates GitHub's provider through its CA chain and ignores these, but the API still
  # stores them; kept as imported to avoid a pointless diff.
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}

data "aws_iam_policy_document" "trust" {
  for_each = local.role_subjects

  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
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
