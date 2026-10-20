# --- Deploy: publishes the built site (.github/workflows/deploy.yml) ---

resource "aws_iam_role" "deploy" {
  name                 = "${var.project}-github-deploy"
  description          = "Assumed by GitHub Actions (${var.github_owner}/${var.github_repo}) to publish the static site"
  assume_role_policy   = data.aws_iam_policy_document.trust["deploy"].json
  max_session_duration = 3600
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

# --- tofu plan: read-only, runs on pull requests (.github/workflows/infra.yml) ---

resource "aws_iam_role" "tofu_plan" {
  name                 = "${var.project}-github-tofu-plan"
  description          = "Assumed by GitHub Actions on pull requests to run a read-only tofu plan of the site stack"
  assume_role_policy   = data.aws_iam_policy_document.trust["tofu_plan"].json
  max_session_duration = 3600
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
}

resource "aws_iam_role_policy" "tofu_plan" {
  name   = "plan-site-stack"
  role   = aws_iam_role.tofu_plan.id
  policy = data.aws_iam_policy_document.tofu_plan.json
}

# --- tofu apply: runs on merges to main in the `infra` environment (.github/workflows/infra.yml) ---
# Deliberately no IAM actions: changes under infra/iam/ are applied from a laptop.

resource "aws_iam_role" "tofu_apply" {
  name                 = "${var.project}-github-tofu-apply"
  description          = "Assumed by GitHub Actions on main (infra environment) to apply the site stack; no IAM rights"
  assume_role_policy   = data.aws_iam_policy_document.trust["tofu_apply"].json
  max_session_duration = 3600
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
}

resource "aws_iam_role_policy" "tofu_apply" {
  name   = "apply-site-stack"
  role   = aws_iam_role.tofu_apply.id
  policy = data.aws_iam_policy_document.tofu_apply.json
}
