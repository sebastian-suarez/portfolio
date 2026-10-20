output "tofu_iam_role_arn" {
  description = "GitHub Actions variable AWS_TOFU_IAM_ROLE_ARN in the infra-iam environment"
  value       = aws_iam_role.tofu_iam.arn
}

output "permissions_boundary_arn" {
  description = "Boundary that every role in ../iam/ carries"
  value       = aws_iam_policy.boundary.arn
}

output "oidc_provider_arn" {
  description = "GitHub OIDC provider trusted by every CI role"
  value       = aws_iam_openid_connect_provider.github.arn
}
