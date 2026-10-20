# The root of CI's access to AWS, applied only from a laptop with admin credentials:
# - the GitHub OIDC provider that every CI role trusts;
# - portfolio-github-boundary (boundary.tf): the most any role applied by CI may do;
# - portfolio-github-tofu-iam (tofu-iam.tf): the role CI uses to apply ../iam/.
# No CI role can change anything here, so a workflow can never raise its own ceiling.

data "aws_caller_identity" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id

  # Same naming rules as ../s3.tf and ../iam/.
  site_bucket_arn  = "arn:aws:s3:::site-${replace(var.domain, ".", "-")}"
  state_bucket_arn = "arn:aws:s3:::${var.state_bucket}"
  site_state_key   = "portfolio/terraform.tfstate"
  iam_state_key    = "portfolio/iam.tfstate"
  group_arn        = "arn:aws:resource-groups:${var.aws_region}:${local.account_id}:group/${var.project}"

  # The roles ../iam/ manages. The tofu-iam role matches this pattern too; tofu-iam.tf keeps it out of reach.
  managed_roles_arn = "arn:aws:iam::${local.account_id}:role/${var.project}-github-*"

  # GitHub's immutable OIDC subject (see ../iam/main.tf).
  github_sub_prefix = "repo:${var.github_owner}@${var.github_owner_id}/${var.github_repo}@${var.github_repo_id}"
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
