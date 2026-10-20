# Origin lock plan: CloudFront only answers requests that came through Cloudflare

Goal: the site is reachable only through Cloudflare, so Cloudflare analytics, WAF, DDoS protection and caching always apply.

## Problem (checked 20 Oct 2026)
- `https://d1l0w2y7figwwb.cloudfront.net/` returns 200 with the full site (`server: AmazonS3`, no `cf-ray`).
- `curl --resolve sebastiansuarez.dev:443:<any CloudFront IP> https://sebastiansuarez.dev/` also returns 200: CloudFront picks the distribution from the Host/SNI, so hiding the `cloudfront.net` name alone is not enough.
- The distribution has no WAF and the viewer-request function checks nothing. The S3 bucket is already private (OAC); this is only about CloudFront.
- Full (strict) uses the visitor's scheme toward the origin ([docs](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full/)): `http://sebastiansuarez.dev/resume/` reaches CloudFront over plain HTTP and gets CloudFront's own 301.

## Options
- **A. Secret header (recommended).** A Cloudflare Request Header Transform Rule adds `x-origin-verify: <secret>` to the HTTPS requests it sends to CloudFront for the two site hostnames. The existing CloudFront Function rejects requests without it. Free (Transform Rules are on the Free plan, 10 rules; the function already runs on every request), no new AWS service, no IAM change.
- B. CloudFront viewer mTLS + Cloudflare Authenticated Origin Pulls with our own client certificate. No shared secret, but needs a private CA, a trust store in S3, HTTPS-only viewers, dropping HTTP/3 (unsupported with viewer mTLS), certificate renewal, and new IAM and Cloudflare SSL permissions. Too much for a static site.
- C. AWS WAF allowing only Cloudflare IP ranges. About $6/month plus IAM changes, and not sufficient alone: any Cloudflare customer (a Worker, or their own zone) connects from the same IPs.
- D. Serve the site from Cloudflare (Workers static assets) and drop CloudFront and S3. Removes the bypass entirely, but it is a hosting migration.

## Design (option A)
- **Secret:** `random_password.origin_verify`, one per generation (`for_each`; 64 letters and digits; new `hashicorp/random` provider), stored in the private, encrypted state and in the Cloudflare rule. `local.origin_verify_accepted` lists the generations CloudFront accepts and `local.origin_verify_sent` names the one Cloudflare sends. Both start at `"1"`.
- **Cloudflare:** `cloudflare_ruleset` for the zone's `http_request_late_transform` phase (no ruleset exists there today). One rule: `http.host in {"sebastiansuarez.dev" "www.sebastiansuarez.dev"} and ssl` sets `x-origin-verify`.
  - `ssl` keeps the secret off plain-HTTP origin connections. The host list keeps it away from the proxied `alerts` record.
  - The whole `rules` list is wrapped in `sensitive()`. A mark on the secret alone would not cover a copy of the rule that appears through dashboard drift, and the plan summary is public.
- **CloudFront Function:** rendered with `templatefile()`. It holds only the SHA-256 of each accepted secret, made non-sensitive with `nonsensitive()` so the code stays readable in the plan.
  - On each request it hashes the header with `crypto.createHash('sha256')` and looks the digest up in that list. No match: `403`, `cache-control: no-store`, a short text body.
  - A function-generated 403 skips the distribution's custom error pages (AWS docs), so it does not serve `/404.html`.
  - The header is removed before the request continues. The `www` redirect and `/dir/` rewrite stay as they are, after the check.
  - HTTP requests never reach the function: CloudFront's redirect-to-https runs first (checked: `http://www.…/resume/?a=1` → 301 to `https://www.…`, "Redirect from cloudfront").
- **Report mode:** `var.origin_lock_enforce` (bool). When false, a failed check only writes a `console.log` line and the request is served as today. Lines go to CloudWatch Logs, us-east-1, `/aws/cloudfront/function/portfolio-viewer-request` (the logging role exists), with the host and whether `cf-ray` was present, never the header value.
- **Publish guard:** a `precondition` on the Cloudflare ruleset requires the function's LIVE code (data source, stage `LIVE`) to equal the configured code. The AWS provider (6.69.1) reads code from the DEVELOPMENT stage, so a failed publish would otherwise leave LIVE stale while plans show no changes. With the guard, every later plan fails until LIVE matches, and an apply that publishes new code checks LIVE again before it changes what Cloudflare sends. (The first idea, comparing `live_stage_etag` with `etag`, fails: each stage numbers its own ETags, so they differ after updates even when LIVE is current. Seen in the `TestFunction` run.)
- **Ordering:** the ruleset `depends_on` the function, so a change publishes the function before Cloudflare changes what it sends. If publishing fails, the apply stops and Cloudflare keeps sending a secret the live function accepts.
- **Docs:** README (how it works, rotation, recovery, token scopes, and that OpenTofu now owns the zone's request header rules, so ones added in the dashboard get removed on the next apply), and the token comment in `providers.tf`.

## Owner steps
1. Before merging PR 1, add one permission to each CI token (Cloudflare dashboard, Account API Tokens; editing keeps the token value, so no GitHub secret changes):
   - token in the `infra` environment secret `CLOUDFLARE_API_TOKEN`: **Zone → Transform Rules → Edit**
   - token in the repo secret `CLOUDFLARE_API_TOKEN_PLAN`: **Zone → Transform Rules → Read**
   The `cf` login can't manage API tokens (no token scope), so this can't be scripted from here.
2. Merge PR 1 (report mode), then PR 2 (enforce).

## Order
1. Branch `fix/cloudfront-origin-lock` in its own worktree (other sessions use the main checkout).
2. Code, README. `tofu fmt`, `tofu validate`, `tofu providers lock` for linux_amd64 and darwin_arm64.
3. Test the function before any merge:
   - Node harness on the rendered code: valid, missing, empty and wrong header; one and two accepted hashes; report vs enforce; www redirect with query string; `/dir` rewrite; asset passthrough; the secret never logged.
   - The same cases with `TestFunction` in the real CloudFront runtime, on a throwaway function `portfolio-viewer-request-test` that is never attached to the distribution, then deleted. This catches runtime errors (a failing function makes CloudFront return 503 for every request) and reports compute utilization.
4. PR 1 with `origin_lock_enforce = false`. The `Terraform plan` check must show: 1 random_password and 1 cloudflare_ruleset to add (rules hidden), and the function updated in place (its code is "known after apply", since the hash comes from the new secret).
5. One review round on the finished diff.
6. Owner edits the tokens and merges PR 1. Verify:
   - The site still serves through Cloudflare: apex 200, `/resume/` 200, a missing page 404 with the 404 page, www 301 to apex with path and query, an `_astro` asset 200, `http://` on both hostnames 301 to `https://`.
   - The function's LIVE code equals its DEVELOPMENT code.
   - Send requests through Cloudflare and straight to `cloudfront.net`. After the logs arrive (best effort, can lag minutes): no log lines with `cf-ray` present, and lines for the direct requests.
   - A new PR plan shows no changes, which proves the plan token can read the ruleset.
7. PR 2 sets `origin_lock_enforce = true`. Owner merges. Verify: `cloudfront.net` 403; CloudFront IP with the real Host 403; a wrong header 403; everything in step 6 still passes through Cloudflare.

## Rollback and recovery
- Fast: a one-line PR back to report mode. Cloudflare keeps sending the header, so nothing breaks while it propagates.
- Full removal: report mode first, then remove the rule and the check. Removing both at once could block visitors for a few minutes while the old function is still live on some edges.
- Failed publish (the guard fails plans): publish the DEVELOPMENT stage from the laptop, `aws cloudfront publish-function --name portfolio-viewer-request --if-match <DEVELOPMENT ETag>`, then re-run the plan.

## Rotation (no downtime, no bypass window)
Three PRs, each applied before the next:
1. Add generation `"2"` to `origin_verify_accepted`. CloudFront accepts both; Cloudflare still sends `"1"`. Wait until the distribution is `Deployed` again: edges pick up a published function only once the distribution finishes deploying ([docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/publish-function.html)).
2. Set `origin_verify_sent = "2"`, then wait a few minutes.
3. Remove `"1"`.
If step 1's publish failed, the guard fails step 2's plan, so Cloudflare never switches to a secret the live function rejects.

## Accepted risks
- The secret is stored in the OpenTofu state and in the Cloudflare rule: admins, the plan and apply roles and both CI tokens can read it, and saved plan files hold it (CI's `tfplan` is never uploaded). A PR from a branch of this repo could print it in its plan; only the owner can push branches.
- When only the Cloudflare rule changes, the LIVE-code guard reads LIVE at plan time; CI applies seconds later in the same job.
- Plans no longer show the Cloudflare rule's expression; review it in the PR diff.
- The report-mode log group is created by CloudFront with no retention. Few lines are written, and enforce mode writes none; set a retention or delete it by hand afterwards.
- Request header rules for this zone are managed only in OpenTofu from now on.

## Review log (round 1: adversarial review of this plan)
Accepted:
- Rotation could leave Cloudflare sending a secret the live function rejects, indefinitely if a publish failed, because the provider refreshes code from DEVELOPMENT (confirmed in the 6.69.1 provider source). Fixed with generations, ruleset-after-function ordering and the LIVE-code guard.
- Full (strict) keeps the visitor's scheme toward the origin (Cloudflare docs; confirmed live), so the secret could cross plain HTTP. Fixed with `and ssl`.
- Marking only the secret leaves a duplicated rule visible in the public plan (reproduced with `issensitive()`). Fixed by marking the whole `rules` list.

Rejected:
- "Require a Cloudflare HTTP→HTTPS redirect before adding the header": with `and ssl` the header is never added to HTTP requests, and CloudFront already redirects HTTP before the function runs.

## Review log (implementation, round 1: two independent reviews)
Neither found a blocking defect in the report-mode change. Accepted, all wording fixes:
- Rotation step 1 now waits for the distribution to be `Deployed`, not "a few minutes" (AWS docs: edges use a published function once the distribution finishes deploying).
- The guard's comment overstated it: for a rule-only change it reads LIVE at plan time, not during the apply. Documented, with the seconds-long gap in CI as an accepted risk.
- "Kept only in the state" was wrong: the Cloudflare rule stores the secret too, readable with Transform Rules Read. Documented who can read it.
