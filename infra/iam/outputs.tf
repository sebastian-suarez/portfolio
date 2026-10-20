output "deploy_role_arn" {
  description = "GitHub Actions repository variable AWS_DEPLOY_ROLE_ARN"
  value       = aws_iam_role.deploy.arn
}

output "tofu_plan_role_arn" {
  description = "GitHub Actions repository variable AWS_TOFU_PLAN_ROLE_ARN"
  value       = aws_iam_role.tofu_plan.arn
}

output "tofu_apply_role_arn" {
  description = "GitHub Actions variable AWS_TOFU_APPLY_ROLE_ARN in the infra environment"
  value       = aws_iam_role.tofu_apply.arn
}
