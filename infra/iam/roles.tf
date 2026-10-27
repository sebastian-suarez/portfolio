# Every role here carries portfolio-github-boundary (../bootstrap/boundary.tf): the tofu-iam role can
# only write roles that have it, and it caps what a role can do whatever its policy says. Each role
# may hold only its one inline policy: aws_iam_role_policies_exclusive shows any other as drift in
# plans, and the next apply deletes it. That includes AWSRevokeOlderSessions from the console's
# "Revoke active sessions"; see ../README.md for the order to use after a compromise.

# --- Deploy: publishes the built site (.github/workflows/deploy.yml) ---

resource "aws_iam_role" "deploy" {
  name                 = "${var.project}-github-deploy"
  description          = "Assumed by GitHub Actions (${var.github_owner}/${var.github_repo}) to publish the static site"
  assume_role_policy   = data.aws_iam_policy_document.trust["deploy"].json
  max_session_duration = 3600
  permissions_boundary = local.boundary_arn
}

data "aws_iam_policy_document" "deploy" {
  statement {
    sid       = "ListBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [local.site_bucket_arn]
  }

  statement {
    sid       = "WriteObjects"
    effect    = "Allow"
    actions   = ["s3:PutObject", "s3:DeleteObject"]
    resources = ["${local.site_bucket_arn}/*"]
  }

  statement {
    sid       = "Invalidate"
    effect    = "Allow"
    actions   = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"]
    resources = [local.distribution_arn]
  }
}

resource "aws_iam_role_policy" "deploy" {
  name   = "publish-static-site"
  role   = aws_iam_role.deploy.id
  policy = data.aws_iam_policy_document.deploy.json
}

resource "aws_iam_role_policies_exclusive" "deploy" {
  role_name    = aws_iam_role.deploy.name
  policy_names = [aws_iam_role_policy.deploy.name]
}

# --- tofu plan: read-only, runs on pull requests (.github/workflows/infra.yml) ---

resource "aws_iam_role" "tofu_plan" {
  name                 = "${var.project}-github-tofu-plan"
  description          = "Assumed by GitHub Actions on pull requests to run read-only tofu plans of the site and IAM stacks"
  assume_role_policy   = data.aws_iam_policy_document.trust["tofu_plan"].json
  max_session_duration = 3600
  permissions_boundary = local.boundary_arn
}

data "aws_iam_policy_document" "tofu_plan" {
  statement {
    sid       = "ListStateBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [local.state_bucket_arn]
  }

  # Plans run with -lock=false, so no write to the lock file is needed.
  statement {
    sid       = "ReadSiteState"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${local.state_bucket_arn}/${local.site_state_key}"]
  }

  # Bucket-level resource only: covers GetBucket*/GetLifecycleConfiguration/... for refresh,
  # but no object reads.
  statement {
    sid       = "ReadSiteBucketConfig"
    effect    = "Allow"
    actions   = ["s3:Get*", "s3:List*"]
    resources = [local.site_bucket_arn]
  }

  statement {
    sid       = "ReadCloudFrontAndAcm"
    effect    = "Allow"
    actions   = ["cloudfront:Get*", "cloudfront:List*", "cloudfront:Describe*", "acm:Describe*", "acm:Get*", "acm:List*"]
    resources = ["*"]
  }

  statement {
    sid       = "ReadLogDelivery"
    effect    = "Allow"
    actions   = ["logs:GetDeliverySource", "logs:GetDeliveryDestination", "logs:GetDelivery", "logs:ListTagsForResource"]
    resources = local.log_delivery_arns
  }

  # Planning this module: its state, the roles it manages and the Resource Group.
  statement {
    sid       = "ReadIamState"
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${local.state_bucket_arn}/${local.iam_state_key}"]
  }

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

resource "aws_iam_role_policy" "tofu_plan" {
  name   = "plan-site-stack"
  role   = aws_iam_role.tofu_plan.id
  policy = data.aws_iam_policy_document.tofu_plan.json
}

resource "aws_iam_role_policies_exclusive" "tofu_plan" {
  role_name    = aws_iam_role.tofu_plan.name
  policy_names = [aws_iam_role_policy.tofu_plan.name]
}

# --- tofu apply: runs on merges to main in the `infra` environment (.github/workflows/infra.yml) ---
# No IAM actions: this module is applied by the tofu-iam role (../bootstrap/), in its own environment.

resource "aws_iam_role" "tofu_apply" {
  name                 = "${var.project}-github-tofu-apply"
  description          = "Assumed by GitHub Actions on main (infra environment) to apply the site stack; no IAM rights"
  assume_role_policy   = data.aws_iam_policy_document.trust["tofu_apply"].json
  max_session_duration = 3600
  permissions_boundary = local.boundary_arn
}

data "aws_iam_policy_document" "tofu_apply" {
  statement {
    sid       = "ListStateBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [local.state_bucket_arn]
  }

  # State object plus its S3-native lock file (<key>.tflock). Not the IAM stack's state.
  statement {
    sid       = "ReadWriteSiteState"
    effect    = "Allow"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${local.state_bucket_arn}/${local.site_state_key}", "${local.state_bucket_arn}/${local.site_state_key}.tflock"]
  }

  statement {
    sid       = "ManageSiteBucket"
    effect    = "Allow"
    actions   = ["s3:*"]
    resources = [local.site_bucket_arn, "${local.site_bucket_arn}/*"]
  }

  # Create* calls for distributions, functions, OACs and certificates only accept Resource "*".
  statement {
    sid       = "ManageCloudFrontAndAcm"
    effect    = "Allow"
    actions   = ["cloudfront:*", "acm:*"]
    resources = ["*"]
  }

  statement {
    sid    = "ManageLogDelivery"
    effect = "Allow"
    actions = [
      "logs:PutDeliverySource", "logs:GetDeliverySource", "logs:DeleteDeliverySource",
      "logs:PutDeliveryDestination", "logs:GetDeliveryDestination", "logs:DeleteDeliveryDestination",
      "logs:CreateDelivery", "logs:GetDelivery", "logs:DeleteDelivery", "logs:UpdateDeliveryConfiguration",
      "logs:TagResource", "logs:UntagResource", "logs:ListTagsForResource",
    ]
    resources = local.log_delivery_arns
  }

  # CloudWatch Logs reads the destination bucket's policy to check it already allows delivery. No
  # s3:PutBucketPolicy: that policy is managed outside OpenTofu and also covers other buckets' logs.
  statement {
    sid       = "ReadAccessLogBucketPolicy"
    effect    = "Allow"
    actions   = ["s3:GetBucketPolicy"]
    resources = [local.access_log_bucket_arn]
  }
}

resource "aws_iam_role_policy" "tofu_apply" {
  name   = "apply-site-stack"
  role   = aws_iam_role.tofu_apply.id
  policy = data.aws_iam_policy_document.tofu_apply.json
}

resource "aws_iam_role_policies_exclusive" "tofu_apply" {
  role_name    = aws_iam_role.tofu_apply.name
  policy_names = [aws_iam_role_policy.tofu_apply.name]
}
