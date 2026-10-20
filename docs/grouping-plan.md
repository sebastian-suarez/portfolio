# Grouping plan: the portfolio as one project in AWS and Cloudflare

Goal: each console has one place that lists the portfolio's resources, and AWS shows spend per project.

Owner decisions (20 Oct 2026):
- AWS: tags, a tag-based Resource Group, and `Project` as a cost-allocation tag. Not "AWS projects": they give each project its own new account, are in limited rollout and are pinned to us-east-2 ([docs](https://docs.aws.amazon.com/accounts/latest/reference/create-project.html)). Not an "AWS app" in myApplications (what the owner meant): it no longer creates or updates applications, and AWS recommends tag-based Resource Groups instead ([docs](https://docs.aws.amazon.com/awsconsolehelpdocs/latest/gsg/aws-myApplications-availability-change.html)).
- Cloudflare: Resource Tagging on the zone and the 4 site DNS records. It is in public beta, works on all plans, and supports the `zone` and `dns_record` types ([docs](https://developers.cloudflare.com/resource-tagging/), [types](https://developers.cloudflare.com/resource-tagging/reference/resource-types/)).

## Changes
1. **`infra/iam/resource-group.tf`**: `aws_resourcegroups_group.portfolio` in us-east-1, with query `AWS::AllSupported` + `Project=portfolio`.
   - It goes in the admin-applied module so the CI roles don't need `resource-groups` rights. The header comment in `infra/iam/main.tf` and the README module table will say so.
   - Default tags also tag the group, so it will probably list itself.
   - AWS can't list the 3 IAM roles, the origin access control or the CloudFront Function ([supported types](https://docs.aws.amazon.com/ARG/latest/userguide/supported-resources.html)). The README's list of what the group shows and misses will come from the live output after the apply.
2. **State bucket tags** (the bucket is bootstrap, not in OpenTofu): read the current tags (`NoSuchTagSet` today), merge in `Project=portfolio`, `Repo=sebastian-suarez/portfolio` and `ManagedBy=manual`, then `PutBucketTagging`.
3. **Cost allocation tag:** activate `Project` once Billing lists it, which can take up to 24h after tagged usage. Then request a backfill. This works here because it is the management account ([docs](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/activating-tags.html)). If it's still missing after 48h, check `ListCostAllocationTags` with Status Inactive, and check that Cost Explorer is enabled.
4. **Cloudflare tags:**
   - Credential: the `cf` CLI's own OAuth login, which has the `tag.write` scope. Not the laptop token, so deleting that token doesn't affect this step.
   - For each resource, read its tags first (`cf tags resources list --id <id>`), merge `Project=portfolio`, and write with `cf tags account-resources update --zone <zone-id> --body '{"resource_type":…,"resource_id":…,"tags":{…}}'`. Pass `--if-match` whenever an ETag comes back.
   - Trial run on one ACM validation record first. Check the list and that the site still serves, then do the other 3 records and the zone.
   - A record that OpenTofu recreates loses its tag, so the README gives the re-tag command. Provider support is still pending ([#7149](https://github.com/cloudflare/terraform-provider-cloudflare/issues/7149)).
5. **README and comments:**
   - Add a "Grouping" section.
   - Update the `infra/iam/` row of the module table and the fresh-account steps (tag the state bucket, tag Cloudflare, activate the cost tag).
   - Make the Cloudflare token wording consistent in the README laptop line and the `infra/providers.tf` comment: a plan needs Zone Read + DNS Read; an apply also needs DNS Edit.
6. **Commit this plan** in the PR, like `docs/build-plan.md`. The merge triggers a harmless redeploy, because `deploy.yml` only ignores `infra/**`.

## Order
1. Work in branch `chore/project-grouping`, in its own worktree, because another session is using the main checkout.
2. Tag Cloudflare (trial record first) and the state bucket **before** opening the PR. Then the PR's CI `Terraform plan` of `infra/` proves the tags cause no drift.
3. Code, README and plan. Run `tofu fmt`, `tofu validate`, and a laptop `tofu plan -out` of `infra/iam` (expected: 1 to add). Open the PR. `Build` and `Terraform plan` must pass, and the `infra/` plan must show no changes.
4. One independent review round on the finished diff.
5. Merge. The owner runs the saved-plan apply of `infra/iam` with `!`.
6. Verify:
   - `ListGroupResources portfolio` contains the site bucket, distribution, certificate, OIDC provider and state bucket, checked by ARN, not by count.
   - `cf tags resources list --tag Project=portfolio` shows the zone and the 4 records.
   - Apex returns 200 and www returns 301.
7. Tomorrow: cost tag, then backfill.
8. Leftovers (approved separately):
   - The owner runs the GitHub deletion script and deletes the laptop token; the audit log confirms it.
   - After the other session ends: delete its scratch folder, and open a separate PR for `docs/deploy-plan.md`.

## Rollback
- **Resource Group:** remove it and re-apply. Nothing depends on it.
- **Bucket tags:** drop only the keys added here. If none are left, use `DeleteBucketTagging`; an empty `PutBucketTagging` is rejected.
- **Cloudflare tags:** PUT the remaining set without `Project`, or `cf tags account-resources delete` if `Project` was the only tag.
- **Cost tag:** deactivate it in Billing.

## Accepted risks
- The Cloudflare and state-bucket tags live outside OpenTofu.
- `Project=portfolio` on the zone also covers the mail and `alerts` records (owner's choice).
- The group never shows the IAM roles, the origin access control or the CloudFront Function.

## Review log (round 1: two independent reviews)
Accepted:
- Tag writes replace the whole set, so read-merge-write with If-Match and remove only our keys; bucket rollback uses `DeleteBucketTagging`.
- The group likely lists itself, so verify members by ARN.
- Doc links and a trial record.
- Name the Cloudflare credential.
- Keep the `main.tf` header and the token wording consistent.
- Commit the plan.
- Prove no drift with the PR's `infra/` plan, and add a cost-tag fallback.

Rejected:
- "`--zone` plus `resource_id` is redundant": the zone picks the endpoint and the ID picks the record; the dry run shows the right request.
- "Only `aws:createdBy` being listed is surprising": the tags have existed since 17:20 UTC today, and keys appear only after Billing processes the usage.
