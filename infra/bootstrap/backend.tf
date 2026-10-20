# Same state bucket as ../ and ../iam/, separate key. Init with the shared bucket name:
#   tofu init -backend-config=../backend.hcl
# No CI role can read or write this key.
terraform {
  backend "s3" {
    key          = "portfolio/bootstrap.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}
