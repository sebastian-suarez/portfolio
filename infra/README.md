# infra: static site on AWS behind Cloudflare

Private S3 bucket → CloudFront (OAC, ACM cert, viewer-request function for the origin lock + `www→apex` + `/dir→/dir/index.html`) → Cloudflare proxied CNAMEs (`@` and `www`, SSL Full (strict)). CloudFront only answers requests that came through Cloudflare (see "Origin lock").

Two OpenTofu root modules share one state bucket (`backend.hcl`, S3-native locking):

| Module | What | Applied by |
| --- | --- | --- |
| `infra/` | S3, CloudFront, ACM, Cloudflare DNS and request header rule. No IAM. | GitHub Actions (`.github/workflows/infra.yml`) |
| `infra/iam/` | GitHub OIDC provider, the three roles below, and the `portfolio` Resource Group | A laptop with admin credentials |

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

## Origin lock

CloudFront only serves requests that came through Cloudflare, so Cloudflare's analytics, WAF and DDoS protection always apply. A Request Header Transform Rule (`origin-lock.tf`) adds `x-origin-verify: <secret>` to the HTTPS requests Cloudflare sends to CloudFront for `@` and `www`. The viewer-request function answers 403 when the header is missing or wrong. That blocks the `*.cloudfront.net` name and requests sent straight to a CloudFront IP with the real Host.

- The secret (`random_password.origin_verify`) is stored in the state and in the Cloudflare rule, so admins, the two CI roles (state) and the two CI tokens (Transform Rules Read) can read it; saved plan files hold it too (CI never uploads its `tfplan`). The function holds SHA-256 digests of it, so its code still shows in plans. The Cloudflare rules show as `(sensitive value)`, so review them in the PR diff.
- Only HTTPS requests get the header (`ssl` in the rule), because Full (strict) uses the visitor's scheme toward the origin. Plain HTTP reaches CloudFront without it and gets CloudFront's redirect to HTTPS, which runs before the function.
- OpenTofu owns the zone's `http_request_late_transform` phase: a Request Header Transform Rule added in the dashboard is removed by the next apply. Add new ones in `origin-lock.tf`.
- Report mode: `origin_lock_enforce = false` serves every request and logs the failed checks (host, and whether `cf-ray` was present) to CloudWatch Logs in us-east-1, log group `/aws/cloudfront/function/portfolio-viewer-request`. Use it for a first rollout and before removing the lock.

```bash
curl -sI https://<cloudfront_domain_name>/ | head -1                                         # 403
curl -sI --resolve sebastiansuarez.dev:443:<cloudfront-ip> https://sebastiansuarez.dev/ | head -1   # 403
curl -sI https://sebastiansuarez.dev/ | head -1                                              # 200
```

**Rotation**, with no downtime and no gap in the lock: three PRs, each applied before the next.

1. Add a generation to `origin_verify_accepted`, e.g. `["1", "2"]`. CloudFront accepts both; Cloudflare still sends the old one. After the apply, wait until the distribution is `Deployed` again: edges only pick up a published function once its distribution finishes deploying (`aws cloudfront get-distribution --id <distribution-id> --query Distribution.Status`).
2. Set `origin_verify_sent = "2"`. After the apply, wait a few minutes before step 3.
3. Remove the old generation.

The rule `depends_on` the function, so an apply publishes the function before it changes what Cloudflare sends, and the precondition below stops the change if that publish didn't take.

**Recovery:** the AWS provider reads the function code from its DEVELOPMENT stage, so a publish that failed would go unnoticed. A precondition on the Cloudflare rule compares the code CloudFront runs (the LIVE stage) with the configured code, and fails every plan until they match. It reads LIVE when planning, and again during the apply only when the function changes too; CI plans and applies seconds apart. Publish it from a laptop with admin credentials, then re-run the plan:

```bash
ETAG=$(aws cloudfront describe-function --name portfolio-viewer-request --stage DEVELOPMENT --query ETag --output text)
aws cloudfront publish-function --name portfolio-viewer-request --if-match "$ETAG"
```

**Removing the lock:** switch to report mode first, then remove the rule and the check. Doing both at once can block visitors for a few minutes, while some edges still run the old function.

## Project grouping

Everything that belongs to the site is tagged `Project=portfolio`.

- **AWS:** the Resource Group `portfolio` (us-east-1, defined in `infra/iam/`) lists both buckets, the distribution, the ACM certificate and the GitHub OIDC provider. AWS can't put IAM roles, origin access controls or CloudFront Functions in a group, so the three roles, the OAC and the viewer-request function only show up in the OpenTofu state. Once `Project` is activated as a cost-allocation tag (Billing → Cost allocation tags), Cost Explorer can split spend by project.
- **State bucket:** it is created by hand (see "Fresh account" below), so its tags are too: `Project`, `Repo` and `ManagedBy=manual`.
- **Function log group:** CloudFront creates `/aws/cloudfront/function/portfolio-viewer-request` (us-east-1) on the first report-mode log line, outside OpenTofu, so its tags (`Project`, `Repo`, `ManagedBy=manual`) and its retention are set by hand.
- **Cloudflare:** Resource Tagging (public beta; Manage Account → Resource Tagging) tags the zone, the four records in `dns.tf` and the request header ruleset in `origin-lock.tf` (type `zone_ruleset`) with `Project=portfolio`. The Cloudflare provider can't manage these tags yet ([cloudflare/terraform-provider-cloudflare#7149](https://github.com/cloudflare/terraform-provider-cloudflare/issues/7149)), so they are set with the `cf` CLI, signed in with `cf auth login`: its OAuth login can write tags, the DNS tokens can't, and an exported `CLOUDFLARE_API_TOKEN` would replace that login. They are stored apart from the resources, so OpenTofu never sees them, and a record or ruleset it recreates comes back untagged. To re-tag one, read its tags by ID, merge `Project` into them (a write replaces all of a resource's tags), and write with the ETag the read returned, so a concurrent change makes the write fail instead of being overwritten. If it fails on the ETag, read and merge again.

```bash
env -u CLOUDFLARE_API_TOKEN cf tags resources list --tag Project=portfolio   # what is tagged now
env -u CLOUDFLARE_API_TOKEN cf tags resources list --id <record-id>          # its tags and etag; [] = no tags yet
env -u CLOUDFLARE_API_TOKEN cf tags account-resources update --zone <zone-id> --if-match <etag> \
  --body '{"resource_type":"dns_record","resource_id":"<record-id>","tags":{"Project":"portfolio","<other-key>":"<other-value>"}}'
# Keep every tag the read returned. With no tags yet, drop --if-match and the other keys.
```

## Laptop commands

```bash
export CLOUDFLARE_API_TOKEN=...                 # this zone only: Zone, DNS and Transform Rules Read to plan; DNS and Transform Rules Edit as well to apply

cd infra
tofu init -backend-config=backend.hcl            # once per clone
tofu plan                                        # same plan CI would run

cd iam
tofu init -backend-config=../backend.hcl
tofu plan -out=tfplan && tofu apply tfplan       # after merging an infra/iam change
tofu output                                      # role ARNs for the GitHub variables
```

If the distribution is ever replaced, put its new ID in `iam/terraform.tfvars`, re-apply `infra/iam/` so the deploy role points at it, and update the repo variable (`gh variable set CLOUDFRONT_DISTRIBUTION_ID --body <new-id>`) so deploys invalidate the right distribution.

### Fresh account, or rebuilding CI access

Everything below runs from a laptop with admin credentials; CI cannot bootstrap itself.

0. Create the state bucket (versioning on, SSE-S3, public access blocked), e.g. `tfstate-<account-id>-us-east-1`, tag it `Project=portfolio`, `Repo=<owner>/<repo>` and `ManagedBy=manual`, and put its name in `backend.hcl` (`bucket = "..."`).
1. Apply `infra/` (site stack).
2. Restrict the `production` and `infra` GitHub environments to `main` before any role trusts them.
3. Set `cloudfront_distribution_id` in `iam/terraform.tfvars`, then apply `infra/iam/`.
4. Create the Cloudflare tokens and set the GitHub variables and secrets in the table below.
5. Tag the Cloudflare zone, records and request header ruleset (see "Project grouping"). Once Billing lists the `Project` tag key (up to a day after the first tagged usage), activate it as a cost-allocation tag.

## GitHub configuration

| Where | Name | Value |
| --- | --- | --- |
| Repo variable | `AWS_DEPLOY_ROLE_ARN`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`, `SITE_URL` | deploy job inputs |
| Repo variable | `AWS_TOFU_PLAN_ROLE_ARN` | `tofu output tofu_plan_role_arn` (in `infra/iam`) |
| Repo secret | `CLOUDFLARE_API_TOKEN_PLAN` | Cloudflare token: Zone Read + DNS Read + Transform Rules Read on this zone |
| `infra` environment variable | `AWS_TOFU_APPLY_ROLE_ARN` | `tofu output tofu_apply_role_arn` (in `infra/iam`) |
| `infra` environment secret | `CLOUDFLARE_API_TOKEN` | Cloudflare token: Zone Read + DNS Write + Transform Rules Edit on this zone |

To rotate a Cloudflare token, create a new one with the same scope, update the secret (`gh secret set CLOUDFLARE_API_TOKEN_PLAN` for the repo one, `gh secret set CLOUDFLARE_API_TOKEN --env infra` for the apply one), then delete the old token.
