# infra: static site on AWS behind Cloudflare

Private S3 bucket → CloudFront (OAC, ACM cert, viewer-request function for `www→apex` + `/dir→/dir/index.html`) → Cloudflare proxied CNAMEs (`@` and `www`, SSL Full (strict)).

Three OpenTofu root modules share one state bucket (`backend.hcl`, S3-native locking), each under its own key:

| Module | What | Applied by |
| --- | --- | --- |
| `infra/` | S3, CloudFront, ACM, Cloudflare DNS. No IAM. | GitHub Actions, `tofu-apply` role |
| `infra/iam/` | The deploy, tofu-plan and tofu-apply roles, and the `portfolio` Resource Group | GitHub Actions, `tofu-iam` role, before `infra/` |
| `infra/bootstrap/` | GitHub OIDC provider, the permissions boundary `portfolio-github-boundary`, the `tofu-iam` role | A laptop with admin credentials, rarely |

CI can change IAM, but only below a ceiling it can't move. The `tofu-iam` role may create, change or delete `portfolio-github-*` roles only when they carry `portfolio-github-boundary`, and the boundary caps every such role at the site bucket, the site state, CloudFront, ACM and read-only IAM. It can't touch itself, the boundary or the OIDC provider. Raising the ceiling (for example, a new AWS service for CI) is a laptop apply of `infra/bootstrap/`. `infra/iam/` takes the bucket and distribution identities from its own `terraform.tfvars` rather than from the site stack's state, because the site apply role can write that state.

## Roles (all GitHub OIDC, no stored AWS keys)

| Role | Trusted job context | Can | Defined in |
| --- | --- | --- | --- |
| `portfolio-github-deploy` | `environment:production` | write the site bucket, invalidate the distribution | `infra/iam/` |
| `portfolio-github-tofu-plan` | `pull_request` | read both stacks and their state | `infra/iam/` |
| `portfolio-github-tofu-apply` | `environment:infra` | manage the site bucket, CloudFront, ACM, and the site stack's state | `infra/iam/` |
| `portfolio-github-tofu-iam` | `environment:infra-iam` | manage `portfolio-github-*` roles under the boundary, the Resource Group, and the IAM stack's state | `infra/bootstrap/` |

The three roles in `infra/iam/` carry the boundary, and each may hold only its own inline policy: any other shows up as drift in plans, and the next apply deletes it. The boundaries are permanent. Never remove one, not even to roll back: an inline policy planted by a bad run is harmless only while the boundary is there.

The trust uses GitHub's immutable subject, `repo:OWNER@OWNER_ID/REPO@REPO_ID:<context>` (default for repositories created after 15 Jul 2026). All three GitHub environments only accept deployments from `main`; `infra-iam` also disallows admin bypass.

## Day to day

- Site change: open a PR. CI builds it; after merge, `deploy.yml` builds and publishes to S3 and invalidates CloudFront.
- `infra/` or `infra/iam/` change: open a PR from a branch of this repo. The `Terraform plan` check plans both stacks and posts the plans in the job summary (public, like the rest of this repo). After merge, `Terraform apply (IAM)` re-plans the current `main` and applies `infra/iam/` in the `infra-iam` environment, then `Terraform apply` applies `infra/` in the `infra` environment. Runs on `main` go one at a time. Fork and Dependabot PRs get no cloud credentials: they can bump actions, but a change to OpenTofu code from them fails the check.
- IAM is applied first. To remove something together with its permission, drop the resource in one PR and the permission in a later one.
- If `Terraform apply` stops with "infra/ changed after the IAM apply", a newer merge's run applies both stacks; nothing to do. To retry an old run, use "Re-run all jobs", not only the failed job.
- `infra/bootstrap/` change (a new AWS service for CI, the tofu-iam role, the OIDC provider): open a PR (CI validates it), merge, then apply it from a laptop. The IAM apply job warns when this is pending.

`main` is protected by a ruleset: changes go through a PR, and the `Build` and `Terraform plan` checks must pass.

## Project grouping

Everything that belongs to the site is tagged `Project=portfolio`.

- **AWS:** the Resource Group `portfolio` (us-east-1, defined in `infra/iam/`) lists both buckets, the distribution, the ACM certificate, the GitHub OIDC provider and the permissions boundary policy. AWS can't put IAM roles, origin access controls or CloudFront Functions in a group, so the four roles, the OAC and the viewer-request function only show up in the OpenTofu state. Once `Project` is activated as a cost-allocation tag (Billing → Cost allocation tags), Cost Explorer can split spend by project.
- **State bucket:** it is created by hand (see "Fresh account" below), so its tags are too: `Project`, `Repo` and `ManagedBy=manual`.
- **Cloudflare:** Resource Tagging (public beta; Manage Account → Resource Tagging) tags the zone and the four records in `dns.tf` with `Project=portfolio`. The Cloudflare provider can't manage these tags yet ([cloudflare/terraform-provider-cloudflare#7149](https://github.com/cloudflare/terraform-provider-cloudflare/issues/7149)), so they are set with the `cf` CLI, signed in with `cf auth login`: its OAuth login can write tags, the DNS tokens can't, and an exported `CLOUDFLARE_API_TOKEN` would replace that login. They are stored apart from the records, so OpenTofu never sees them, and a record it recreates comes back untagged. To re-tag one, read its tags by ID, merge `Project` into them (a write replaces all of a resource's tags), and write with the ETag the read returned, so a concurrent change makes the write fail instead of being overwritten. If it fails on the ETag, read and merge again.

```bash
env -u CLOUDFLARE_API_TOKEN cf tags resources list --tag Project=portfolio   # what is tagged now
env -u CLOUDFLARE_API_TOKEN cf tags resources list --id <record-id>          # its tags and etag; [] = no tags yet
env -u CLOUDFLARE_API_TOKEN cf tags account-resources update --zone <zone-id> --if-match <etag> \
  --body '{"resource_type":"dns_record","resource_id":"<record-id>","tags":{"Project":"portfolio","<other-key>":"<other-value>"}}'
# Keep every tag the read returned. With no tags yet, drop --if-match and the other keys.
```

## Laptop commands

```bash
export CLOUDFLARE_API_TOKEN=...                 # this zone only: Zone Read + DNS Read to plan, DNS Edit as well to apply

cd infra
tofu init -backend-config=backend.hcl            # once per clone
tofu plan                                        # same plan CI would run

cd iam
tofu init -backend-config=../backend.hcl
tofu plan                                        # CI applies this module; plan only
tofu output                                      # role ARNs for the GitHub variables

cd ../bootstrap
tofu init -backend-config=../backend.hcl
tofu plan -out=tfplan && tofu apply tfplan       # after merging an infra/bootstrap change
```

If the distribution is ever replaced, put its new ID in `iam/terraform.tfvars` in a PR (the merge points the deploy role at it), and update the repo variable (`gh variable set CLOUDFRONT_DISTRIBUTION_ID --body <new-id>`) so deploys invalidate the right distribution.

### If CI is compromised

From a laptop with admin credentials. Keep every boundary in place throughout.

1. Delete the `portfolio-github-tofu-iam` role (console, or remove it from `infra/bootstrap/` and apply).
2. Revoke active sessions on every `portfolio-github-*` role (IAM console → role → "Revoke active sessions").
3. Apply a trusted `infra/iam/`: it restores the policies and trusts and deletes unexpected inline policies.
4. Delete any `portfolio-github-*` role that isn't in the code.
5. Rotate the Cloudflare tokens.

To stop CI applying IAM without an incident: remove the tofu-iam role from `infra/bootstrap/` and apply, then delete the `Terraform apply (IAM)` job and the `infra-iam` environment. `infra/iam/` goes back to laptop applies, boundaries included.

### Fresh account, or rebuilding CI access

Everything below runs from a laptop with admin credentials; CI cannot bootstrap itself.

0. Create the state bucket (versioning on, SSE-S3, public access blocked), e.g. `tfstate-<account-id>-us-east-1`, tag it `Project=portfolio`, `Repo=<owner>/<repo>` and `ManagedBy=manual`, and put its name in `backend.hcl` (`bucket = "..."`).
1. Create the `production`, `infra` and `infra-iam` GitHub environments, each restricted to `main` (`infra-iam` without admin bypass), before any role trusts them: a job that names a missing environment creates it with no protection.
2. Apply `infra/bootstrap/` (OIDC provider, boundary, tofu-iam role).
3. Apply `infra/` (site stack).
4. Set `cloudfront_distribution_id` in `iam/terraform.tfvars`, then apply `infra/iam/` once from the laptop; CI applies it from then on.
5. Create the Cloudflare tokens and set the GitHub variables and secrets in the table below.
6. Tag the Cloudflare zone and records (see "Project grouping"). Once Billing lists the `Project` tag key (up to a day after the first tagged usage), activate it as a cost-allocation tag.

## GitHub configuration

| Where | Name | Value |
| --- | --- | --- |
| Repo variable | `AWS_DEPLOY_ROLE_ARN`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`, `SITE_URL` | deploy job inputs |
| Repo variable | `AWS_TOFU_PLAN_ROLE_ARN` | `tofu output tofu_plan_role_arn` (in `infra/iam`) |
| Repo secret | `CLOUDFLARE_API_TOKEN_PLAN` | Cloudflare token: Zone Read + DNS Read on this zone |
| `infra` environment variable | `AWS_TOFU_APPLY_ROLE_ARN` | `tofu output tofu_apply_role_arn` (in `infra/iam`) |
| `infra` environment secret | `CLOUDFLARE_API_TOKEN` | Cloudflare token: Zone Read + DNS Write on this zone |
| `infra-iam` environment variable | `AWS_TOFU_IAM_ROLE_ARN` | `tofu output tofu_iam_role_arn` (in `infra/bootstrap`) |

To rotate a Cloudflare token, create a new one with the same scope, update the secret (`gh secret set CLOUDFLARE_API_TOKEN_PLAN` for the repo one, `gh secret set CLOUDFLARE_API_TOKEN --env infra` for the apply one), then delete the old token.
