# One view of everything tagged Project=portfolio (Resource Groups console, us-east-1).
# It lives here rather than in ../ so the CI roles need no resource-groups permissions.
# AWS can't list IAM roles, origin access controls or CloudFront Functions in a group; see ../README.md.
resource "aws_resourcegroups_group" "portfolio" {
  name        = var.project
  description = "Everything tagged Project=${var.project}"

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
