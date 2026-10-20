# infra: static site on AWS behind Cloudflare

Private S3 bucket → CloudFront (OAC, ACM cert, viewer-request function for `www→apex` + `/dir→/dir/index.html`) → Cloudflare proxied CNAMEs (`@` and `www`, SSL Full (strict)).

Two OpenTofu root modules share one state bucket (`backend.hcl`, S3-native locking):

| Module | What | Applied by |
| --- | --- | --- |
| `infra/` | S3, CloudFront, ACM, Cloudflare DNS. No IAM. | GitHub Actions (`.github/workflows/infra.yml`) |
| `infra/iam/` | GitHub OIDC provider and the three roles below | A laptop with admin credentials |

Keeping IAM out of the CI-applied module means no workflow can widen its own access. The IAM module takes the bucket and distribution identities from its own `terraform.tfvars` rather than from the site stack's state, because CI can write that state.

## Roles (all GitHub OIDC, no stored AWS keys)

| Role | Trusted job context | Can |
| --- | --- | --- |
| `portfolio-github-deploy` | `environment:production` | write the site bucket, invalidate the distribution |
| `portfolio-github-tofu-plan` | `pull_request` | read the site stack and its state |
| `portfolio-github-tofu-apply` | `environment:infra` | manage the site bucket, CloudFront, ACM, and the site stack's state |

The trust uses GitHub's immutable subject, `repo:OWNER@OWNER_ID/REPO@REPO_ID:<context>` (default for repositories created after 15 Jul 2026). Both GitHub environments only accept deployments from `main`.

## Day to day

- Site change: open a PR. CI builds it; after merge, `deploy.yml` builds and publishes to S3 and invalidates CloudFront.
- `infra/` change: open a PR from a branch of this repo. The `Terraform plan` check posts the plan in the job summary (public, like the rest of this repo); after merge, `Terraform apply` re-plans the current `main` and applies it in the `infra` environment. Fork and Dependabot PRs get no cloud credentials: they can bump actions, but a change to OpenTofu code from them fails the check.
- `infra/iam/` change: open a PR (CI checks formatting and validates it), merge, then apply it from a laptop. The apply job warns when this is pending.

`main` is protected by a ruleset: changes go through a PR, and the `Build` and `Terraform plan` checks must pass.

## Laptop commands

```bash
export CLOUDFLARE_API_TOKEN=...                 # Zone.DNS:Edit + Zone.Zone:Read on this zone (site stack only)

cd infra
tofu init -backend-config=backend.hcl            # once per clone
tofu plan                                        # same plan CI would run

cd iam
tofu init -backend-config=../backend.hcl
tofu plan -out=tfplan && tofu apply tfplan       # after merging an infra/iam change
tofu output                                      # role ARNs for the GitHub variables
```

If the distribution is ever replaced, put its new ID in `iam/terraform.tfvars` and re-apply `infra/iam/` so the deploy role points at it.

### Fresh account, or rebuilding CI access

Everything below runs from a laptop with admin credentials; CI cannot bootstrap itself.

1. Apply `infra/` (site stack).
2. Restrict the `production` and `infra` GitHub environments to `main` before any role trusts them.
3. Set `cloudfront_distribution_id` in `iam/terraform.tfvars`, then apply `infra/iam/`.
4. Create the Cloudflare tokens and set the GitHub variables and secrets in the table below.

## GitHub configuration

| Where | Name | Value |
| --- | --- | --- |
| Repo variable | `AWS_DEPLOY_ROLE_ARN`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`, `SITE_URL` | deploy job inputs |
| Repo variable | `AWS_TOFU_PLAN_ROLE_ARN` | `tofu output tofu_plan_role_arn` (in `infra/iam`) |
| Repo secret | `CLOUDFLARE_API_TOKEN_PLAN` | Cloudflare token: Zone Read + DNS Read on this zone |
| `infra` environment variable | `AWS_TOFU_APPLY_ROLE_ARN` | `tofu output tofu_apply_role_arn` (in `infra/iam`) |
| `infra` environment secret | `CLOUDFLARE_API_TOKEN` | Cloudflare token: Zone Read + DNS Write on this zone |

To rotate a Cloudflare token, create a new one with the same scope, update the secret (`gh secret set CLOUDFLARE_API_TOKEN_PLAN` for the repo one, `gh secret set CLOUDFLARE_API_TOKEN --env infra` for the apply one), then delete the old token.
