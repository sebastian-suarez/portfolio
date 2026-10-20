# One view of everything tagged Project=portfolio (Resource Groups console, us-east-1).
# It lives here rather than in ../ so the CI roles need no resource-groups permissions.
# AWS can't list IAM roles, origin access controls or CloudFront Functions in a group; see ../README.md.
resource "aws_resourcegroups_group" "portfolio" {
  name = var.project
  # The API only accepts letters, digits, spaces, "_", "." and "-" here; plan does not check it.
  description = "Resources whose Project tag is ${var.project}"

  resource_query {
    query = jsonencode({
      ResourceTypeFilters = ["AWS::AllSupported"]
      TagFilters = [{
        Key    = "Project"
        Values = [var.project]
      }]
    })
  }
}
