# portfolio-github-boundary: the ceiling for every role ../iam/ manages. It allows what the deploy,
# tofu-plan and tofu-apply roles use, plus the reads needed to plan ../iam/. A role's own policy can
# grant less, never more. Raising it (for example, a new AWS service for CI) needs a laptop apply here.
#
# The boundaries stay on the roles even if CI stops applying ../iam/: an inline policy planted by a
# compromised run is harmless only while the boundary is there.

data "aws_iam_policy_document" "boundary" {
  statement {
    sid       = "SiteBucket"
    effect    = "Allow"
    actions   = ["s3:*"]
    resources = [local.site_bucket_arn, "${local.site_bucket_arn}/*"]
  }

  statement {
    sid       = "ListStateBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [local.state_bucket_arn]
  }

  # The site stack's state and its S3-native lock file.
  statement {
    sid       = "ReadWriteSiteState"
    effect    = "Allow"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${local.state_bucket_arn}/${local.site_state_key}", "${local.state_bucket_arn}/${local.site_state_key}.tflock"]
  }

  # The IAM stack's state, read-only (pull request plans). Never the bootstrap state.
  statement {
    sid       = "ReadIamState"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${local.state_bucket_arn}/${local.iam_state_key}"]
  }

  statement {
    sid       = "CloudFrontAndAcm"
    effect    = "Allow"
    actions   = ["cloudfront:*", "acm:*"]
    resources = ["*"]
  }

  # Read-only, so pull requests can plan ../iam/.
  statement {
    sid       = "ReadManagedRoles"
    effect    = "Allow"
    actions   = ["iam:GetRole", "iam:GetRolePolicy", "iam:ListRolePolicies", "iam:ListAttachedRolePolicies", "iam:ListRoleTags"]
    resources = [local.managed_roles_arn]
  }

  statement {
    sid       = "ReadResourceGroup"
    effect    = "Allow"
    actions   = ["resource-groups:GetGroup", "resource-groups:GetGroupQuery", "resource-groups:GetGroupConfiguration", "resource-groups:GetTags"]
    resources = [local.group_arn]
  }
}

resource "aws_iam_policy" "boundary" {
  name        = "${var.project}-github-boundary"
  description = "Permissions boundary: the most any role applied by GitHub Actions (infra/iam) may do"
  policy      = data.aws_iam_policy_document.boundary.json
}
