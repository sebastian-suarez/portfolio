# Same state bucket as ../, separate key. Init with the shared bucket name:
#   tofu init -backend-config=../backend.hcl
terraform {
  backend "s3" {
    key          = "portfolio/iam.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}
