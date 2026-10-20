# infra — static site on AWS behind Cloudflare

Private S3 bucket → CloudFront (OAC, ACM cert, viewer-request function for `www→apex` + `/dir→/dir/index.html`) → Cloudflare proxied CNAMEs (`@` and `www`, SSL Full (strict)). A GitHub Actions role (OIDC, no keys) can only write the bucket and invalidate the distribution.

Applied from a laptop, not from CI. State: S3 bucket named in `backend.hcl`, S3-native locking.

```bash
export CLOUDFLARE_API_TOKEN=...          # Zone.DNS:Edit + Zone.Zone:Read on this zone only
tofu init -backend-config=backend.hcl    # once per clone
tofu plan -out=tfplan && tofu apply tfplan
tofu output                              # values for the GitHub Actions variables
```

Inputs live in `terraform.tfvars` (`domain`, `github_owner`, `github_repo`). Full runbook: project doc `claude/portfolio-deploy-pipeline.md`.
