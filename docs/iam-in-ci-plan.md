# IAM in CI plan: apply infra/iam from GitHub Actions

Goal: changes to `infra/iam/` go PR → merge → Actions, like the site stack. No laptop `tofu apply` for normal IAM changes.

Owner decisions (20 Oct 2026):
- Capped CI role: Actions may manage only roles that carry a fixed permissions boundary. Not full IAM rights: this account is the Organization's management account, so an uncapped role would make a compromised workflow admin of the whole Organization.
- Apply automatically on merge, no approval click.

## Design

Three root modules, one state bucket, separate keys:

| Module | Holds | Applied by |
| --- | --- | --- |
| `infra/` | S3, CloudFront, ACM, Cloudflare DNS | Actions, `tofu-apply` role (unchanged) |
| `infra/iam/` | deploy, tofu-plan, tofu-apply roles; Resource Group | Actions, new `tofu-iam` role |
| `infra/bootstrap/` (new, state `portfolio/bootstrap.tfstate`) | GitHub OIDC provider (moved), boundary policy `portfolio-github-boundary`, role `portfolio-github-tofu-iam` | Laptop with admin credentials; rare |

**Boundary** (the ceiling for every role CI manages) = what the three roles use today, plus reads to plan `infra/iam/`:
- `s3:*` on the site bucket and its objects.
- State bucket: list; read/write `portfolio/terraform.tfstate` and its `.tflock`; read `portfolio/iam.tfstate`.
- `cloudfront:*`, `acm:*` on `*`.
- `iam:GetRole`, `GetRolePolicy`, `ListRolePolicies`, `ListAttachedRolePolicies`, `ListRoleTags` on `role/portfolio-github-*`.
- `resource-groups:GetGroup`, `GetGroupQuery`, `GetGroupConfiguration`, `GetTags` on `group/portfolio`.

**`portfolio-github-tofu-iam`** (trusts `environment:infra-iam`; has no boundary itself):
- `CreateRole`, `DeleteRole`, `UpdateRole`, `UpdateRoleDescription`, `UpdateAssumeRolePolicy`, `PutRolePolicy`, `DeleteRolePolicy`, `PutRolePermissionsBoundary` on `role/portfolio-github-*`, only when `iam:PermissionsBoundary` equals the boundary ARN. The IAM service reference lists that condition key on all eight.
- `TagRole`, `UntagRole` (no boundary key exists for them), the role reads above and `ListInstanceProfilesForRole` (needed to delete a role) on `role/portfolio-github-*`.
- Explicit deny of everything except `iam:Get*`/`iam:List*` on its own role.
- Nothing on the OIDC provider, the boundary policy, managed policies, users, groups, `AttachRolePolicy` or `DeleteRolePermissionsBoundary`.
- Resource Group: `CreateGroup` (the API only takes Resource `*`) only with request tag `Project=portfolio`; `GetGroup`, `GetGroupQuery`, `GetGroupConfiguration`, `GetTags`, `UpdateGroup`, `UpdateGroupQuery`, `PutGroupConfiguration`, `Tag`, `Untag`, `DeleteGroup` on `group/portfolio` (the calls AWS provider 6.69.1 makes).
- State: list the bucket; read/write `portfolio/iam.tfstate` and its `.tflock`. No access to the site or bootstrap state.

Result: CI can create, change or delete `portfolio-github-*` roles, but each one stays under the boundary. CI can't edit itself, the boundary or the OIDC provider, and can't remove a boundary.

**`infra/iam/` changes:** the three roles get `permissions_boundary`; trust policies build the OIDC provider ARN from the account ID; the plan role gains the IAM, Resource Group and iam-state reads; the provider leaves through a `removed` block (no destroy) and `infra/bootstrap/` takes it with an `import` block. Each role also gets `aws_iam_role_policies_exclusive`: an inline policy that is not in the code shows up as drift in every plan, and the next apply deletes it. Bootstrap inputs live in its own `terraform.tfvars`.

The boundaries are permanent. They stay on the roles even if CI stops applying IAM: an inline policy planted by a compromised run is harmless only while the boundary is there, and IAM re-evaluates live sessions on every request.

**GitHub:** new environment `infra-iam`, deployments from `main` only, admin bypass off; environment variable `AWS_TOFU_IAM_ROLE_ARN`; no secrets. Ruleset unchanged (`Build`, `Terraform plan`).

**`infra.yml`:**
- `Terraform plan` (PRs): validate all three modules; plan `infra/` and `infra/iam/` with the read-only role (`-lock=false`), both shown in the job summary.
- New `Terraform apply (IAM)` on push to `main` and dispatch: `infra-iam` environment; checks out the current tip of `main` once and passes that commit to the site job; plan then apply `infra/iam/`; warns when `infra/bootstrap/` changed.
- `Terraform apply` (site) `needs` the IAM job, so permissions land first. It stops with an error if `infra/` on `main` changed after the commit the IAM job applied (a merge during the run, or a re-run of only the site job); the newer run applies both stacks, or "Re-run all jobs" does.
- One workflow-level concurrency group per ref for push and dispatch runs, never cancelled mid-run: a run's IAM and site applies finish before the next run starts. Pull requests keep a per-PR group that cancels older plans.

## Order
1. Branch `ci/iam-apply-in-actions` in its own worktree (the main checkout has other work in progress).
2. Code with the temporary `removed`/`import` blocks; `fmt` and `validate`. Before any apply, run the planned policies through the IAM policy simulator: every action the three roles use today still passes under the boundary; the tofu-iam role is refused on itself, on roles without the boundary, on the boundary policy, on users and on the bootstrap state.
3. GitHub: create `infra-iam` (main only, no bypass) and its variable. It must exist before any role trusts it: a job that names a missing environment creates it with no protection.
4. Laptop: saved plans for `infra/bootstrap/` (1 import, 3 to add) and `infra/iam/` (3 exclusive policy lists to add, 3 roles and 1 policy changed in place, provider forgotten). The owner runs `tofu -chdir=infra/bootstrap apply tfplan && tofu -chdir=infra/iam apply tfplan`, the last laptop apply.
5. Delete the temporary blocks; both laptop plans show no changes. Simulate the live roles (`SimulatePrincipalPolicy`) to confirm the boundary.
6. Reword the plan role's description ("site and IAM stacks") without applying it, so the merge proves the CI path on a real change.
7. Open the PR. `Build` and `Terraform plan` pass; the `infra/` plan shows no changes and the `infra/iam/` plan shows 1 to change (the description).
8. One review round on the finished diff (two independent reviews).
9. The owner merges. Verify: the IAM apply job changes the description, the site apply shows no changes, Deploy succeeds (the deploy role under its boundary).
10. README, code comments.

## Rollback
Never remove a boundary as part of a rollback.
- A failed CI apply: fix forward in a PR, or apply `infra/iam/` from the laptop (admin).
- Stop CI applying IAM: from the laptop, remove the `portfolio-github-tofu-iam` role from `infra/bootstrap/` and apply; delete the IAM apply job and the `infra-iam` environment. `infra/iam/` goes back to laptop applies, boundaries included.
- Suspected compromise of `main` or CI: from the laptop, (1) delete the tofu-iam role's trust or the role itself; (2) revoke active sessions on every `portfolio-github-*` role (IAM console, "Revoke active sessions"); (3) apply a trusted `infra/iam/` (restores policies and trusts, deletes unexpected inline policies); (4) delete any `portfolio-github-*` role that is not in the code; (5) rotate the Cloudflare tokens. Boundaries stay throughout.

## Accepted risks
- CI can rewrite the trust policy of any `portfolio-github-*` role: IAM has no condition key for trust content, and SCPs don't apply to the management account. Worst case after a compromise of `main`: a role assumable from outside with the boundary's rights (site bucket, site state, CloudFront, ACM). That is the site apply role's reach today, plus persistence.
- Raising the ceiling (for example, a new AWS service for CI) needs a laptop apply of `infra/bootstrap/`.
- IAM applies before the site, so removing a resource and its permission in the same PR fails. Do it in two PRs.
- The boundary keeps `cloudfront:*` and `acm:*` on `*`, as the site apply role has today.
- A compromised run could create extra `portfolio-github-*` roles (each under the boundary). Plans don't list roles outside the code; step (4) of the compromise procedure deletes them.

## Execution log (20 Oct 2026)
- Policy simulator, before any apply: the boundary removes none of the 619 actions the three roles were allowed (deploy 5, plan 167, apply 447, wildcards expanded from the AWS service reference). 53 checks on the tofu-iam policy and 19 on an `Action: *` role under the boundary all matched.
- `infra-iam` created: `main` only, admin bypass off, variable set, no secrets.
- Owner applied the saved plans: bootstrap 1 imported, 3 added; iam 3 added, 4 changed, 1 forgotten. Without the temporary blocks both plans show no changes. 24 checks on the live roles matched. The Resource Group now also lists the boundary policy.
- The PR carries one IAM change for CI to apply: the plan role's description.

## Review log (round 1: one independent review of the plan)
Accepted:
- A rollback that drops boundaries would activate inline admin policies a compromised run had planted, also for sessions already issued: boundaries are now permanent, the compromise procedure keeps them, and exclusive inline-policy management makes unexpected policies visible and removable.
- Separate job concurrency groups let runs interleave, and the site job resolved `main` on its own: runs on `main` are now serialized as a whole, the IAM job's commit is passed on, and the site job refuses newer `infra/` code.
