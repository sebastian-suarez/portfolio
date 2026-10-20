# portfolio-github-tofu-iam: applies ../iam/ on merges to main (job "Terraform apply (IAM)" in
# .github/workflows/infra.yml, environment infra-iam). It may only manage portfolio-github-* roles
# that carry the boundary, and the portfolio Resource Group. It has no boundary itself, so the role
# writes below can't reach it either.

data "aws_iam_policy_document" "tofu_iam_trust" {
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

    # A job that declares `environment:` always presents the environment form, so the branch
    # restriction (main only) lives on the environment in GitHub.
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["${local.github_sub_prefix}:environment:${var.iam_environment}"]
    }
  }
}

resource "aws_iam_role" "tofu_iam" {
  name                 = "${var.project}-github-tofu-iam"
  description          = "Assumed by GitHub Actions on main (infra-iam environment) to apply infra/iam; manages only roles under the permissions boundary"
  assume_role_policy   = data.aws_iam_policy_document.tofu_iam_trust.json
  max_session_duration = 3600
}

data "aws_iam_policy_document" "tofu_iam" {
  statement {
    sid       = "ListStateBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [local.state_bucket_arn]
  }

  # The IAM stack's state and its S3-native lock file. Not the site or bootstrap state.
  statement {
    sid       = "ReadWriteIamState"
    effect    = "Allow"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${local.state_bucket_arn}/${local.iam_state_key}", "${local.state_bucket_arn}/${local.iam_state_key}.tflock"]
  }

  # ListInstanceProfilesForRole: the provider checks it before deleting a role.
  statement {
    sid       = "ReadManagedRoles"
    effect    = "Allow"
    actions   = ["iam:GetRole", "iam:GetRolePolicy", "iam:ListRolePolicies", "iam:ListAttachedRolePolicies", "iam:ListRoleTags", "iam:ListInstanceProfilesForRole"]
    resources = [local.managed_roles_arn]
  }

  # Every role write needs the role's boundary to be this one; for CreateRole and
  # PutRolePermissionsBoundary, the boundary in the request. A role without it is out of reach.
  statement {
    sid    = "WriteRolesUnderBoundary"
    effect = "Allow"
    actions = [
      "iam:CreateRole",
      "iam:DeleteRole",
      "iam:UpdateRole",
      "iam:UpdateRoleDescription",
      "iam:UpdateAssumeRolePolicy",
      "iam:PutRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:PutRolePermissionsBoundary",
    ]
    resources = [local.managed_roles_arn]

    condition {
      test     = "StringEquals"
      variable = "iam:PermissionsBoundary"
      values   = [aws_iam_policy.boundary.arn]
    }
  }

  # IAM has no boundary condition for these two.
  statement {
    sid       = "TagManagedRoles"
    effect    = "Allow"
    actions   = ["iam:TagRole", "iam:UntagRole"]
    resources = [local.managed_roles_arn]
  }

  # This role is named portfolio-github-* as well.
  statement {
    sid         = "NotThisRole"
    effect      = "Deny"
    not_actions = ["iam:Get*", "iam:List*"]
    resources   = [aws_iam_role.tofu_iam.arn]
  }

  # CreateGroup takes no resource ARN; the tag condition limits it to this project's groups.
  statement {
    sid       = "CreateResourceGroup"
    effect    = "Allow"
    actions   = ["resource-groups:CreateGroup"]
    resources = ["*"]

    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/Project"
      values   = [var.project]
    }
  }

  # The calls the AWS provider makes for aws_resourcegroups_group.
  statement {
    sid    = "ManageResourceGroup"
    effect = "Allow"
    actions = [
      "resource-groups:GetGroup",
      "resource-groups:GetGroupQuery",
      "resource-groups:GetGroupConfiguration",
      "resource-groups:GetTags",
      "resource-groups:UpdateGroup",
      "resource-groups:UpdateGroupQuery",
      "resource-groups:PutGroupConfiguration",
      "resource-groups:Tag",
      "resource-groups:Untag",
      "resource-groups:DeleteGroup",
    ]
    resources = [local.group_arn]
  }
}

resource "aws_iam_role_policy" "tofu_iam" {
  name   = "apply-iam-stack"
  role   = aws_iam_role.tofu_iam.id
  policy = data.aws_iam_policy_document.tofu_iam.json
}
