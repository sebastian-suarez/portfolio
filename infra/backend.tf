# State lives in S3, locked with S3-native lockfiles (no DynamoDB table).
# The bucket name is account-specific, so it is passed at init time:
#   tofu init -backend-config=backend.hcl
# backend.hcl holds the bucket name and is committed (see README, "Fresh account").
terraform {
  backend "s3" {
    key          = "portfolio/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}
