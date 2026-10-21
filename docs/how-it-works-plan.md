# Plan: the portfolio as a project, and a /how-it-works/ page

Task (owner, 20 Oct 2026): add this portfolio as a project, with its services; a short explanation and a diagram of how it works; and a new page that explains the AWS and Cloudflare setup from the two hardening guides (as explanation and diagrams, not their steps), plus every service from dev to CI/CD to deploy.

Owner decisions:
- Both placements: a fourth card in Own projects, and the hero diagram, which replaces the RS50 torque path.
- The page lives at `/how-it-works/`, titled "How this site works".

## Source of truth

The guides say what should be done; the page states only what is live. Live state was checked read-only on 20 Oct 2026 through the AWS, Cloudflare and GitHub APIs, `curl` and `dig`.

Live, so it goes on the page:
- **AWS:** root MFA, no root access keys, centralized root access management. No IAM users: people sign in through IAM Identity Center (4-hour sessions) and CI through GitHub OIDC roles. An organization CloudTrail trail (all Regions, log file validation, KMS, CloudWatch Logs) with four alarms that email. AWS Config (continuous recording, 18 managed rules of its own besides Security Hub's), GuardDuty (high-severity findings email), Security Hub (Foundational Security Best Practices and CIS), Inspector, IAM Access Analyzer (external and unused access). S3 Block Public Access for the whole account, EBS encryption by default. A $20 monthly budget, Cost Anomaly Detection and a billing alarm.
- **Cloudflare (Free plan):** 2FA, Cloudflare Registrar, DNSSEC. Apex and www are proxied to CloudFront; the ACM validation and mail records are DNS-only. Full (strict), TLS 1.3, Automatic HTTPS Rewrites, HTTP/3, Browser Integrity Check, Email Address Obfuscation, AI crawler blocking. iCloud+ mail with SPF, DKIM and DMARC `p=reject`. Two CI tokens scoped to the zone. `Project=portfolio` tags.
- **GitHub:** a ruleset on `main` (pull requests only, `Build` and `Terraform plan` required, no force push or deletion, no bypass). The `production`, `infra` and `infra-iam` environments accept `main` only. The default workflow token is read-only. Secret scanning with push protection. Dependabot version updates.

Anything a guide asks for that is not live stays off the page and out of this repo, which is public; the owner gets that list privately.

Never on the page: account, distribution or zone IDs, ARNs, email addresses, token names, DNS records that aren't part of the portfolio, and any mention of AI tooling.

## Changes

1. **Hero:** a new `siteFlow` diagram, 600 × 440, in the torque path's U layout. Pull request → GitHub Actions → S3 bucket, down to CloudFront → Cloudflare → your browser, in two panels: publish on every merge, serve on every visit. The caption gives one sentence and links to `/how-it-works/`. `torquePath.ts` is deleted; nothing else uses it.
2. **Own projects:** a fourth card, "This portfolio", with a blurb, service chips, the public repo link and a link to the page. Its `iacSplit` diagram shows the split: a person applies the bootstrap stack (OIDC provider, permissions boundary, IAM-apply role) from a laptop; GitHub Actions applies the IAM stack, whose roles carry the boundary, and then the site stack, which holds no IAM. The intro becomes "Four of my own projects…". `ProjectCard` gets an optional internal link.
3. **New page** `src/pages/how-it-works.astro`, in the 404 page's shell (`Header base="/"`, root-absolute links, light field, footer):
   - Intro: h1, lede, the as-of date (20 Oct 2026) and the `siteFlow` diagram.
   - From an edit to production: a `pipeline` diagram (local dev → pull request → required checks → merge → deploy, plus the infra apply; IAM from the laptop) and four short paragraphs.
   - Serving a request: a `requestPath` diagram, browser → Cloudflare → CloudFront → S3, with what each hop does.
   - Infrastructure as code: reuses `iacSplit`, plus the state bucket and locking, the trust per job context, the scoped tokens and the tags.
   - The AWS account: an `awsAccount` diagram (identity, audit and detection, alerts by email, cost controls).
   - The Cloudflare account: a `cloudflareZone` diagram (registrar and DNS, TLS and security at the edge, mail records).
   - Every service: one list per stage (dev, CI/CD, hosting, accounts), one line each.
4. **CSS:** page classes in `global.css` that reuse the glass, section and diagram styles; the layout stacks below 900 px.
5. **This plan** goes in the PR, with its review log.

## Verify

- `astro check`, `astro build` and `check:release` pass, and `dist/how-it-works/index.html` exists.
- In a cached Chromium, at 1440, 900, 390 and 360 px, for the home page and the new page:
  - no horizontal overflow;
  - in every diagram, each text sits inside its box and each label clears the boxes, measured with `getBBox`;
  - `/how-it-works` and `/how-it-works/` both load styles;
  - keyboard focus, reduced motion, no JS and print all work.
- Every claim on the page maps to a check above or to a file in the repo.

## Review, then ship

- Plan: one adversarial review before building.
- Finished work: two independent reviews, one that sees only the result and one that also sees the task. Each finding is checked against the docs or a failing test, and rejections are logged here. Two rounds at most.
- A PR from `feat/how-it-works`; `Build` and `Terraform plan` must pass, then the owner merges. The merge triggers Deploy; then check the live pages.

## Risks

- The hero loses the RS50 diagram; the RS50 card keeps its milestones diagram.
- The page goes stale when the setup changes. The as-of date says when it was true; a change to `infra/` or to either account should update the page.

## Main moved during the work

PRs #7 and #8 (IAM applied from Actions under a permissions boundary) merged while this PR was open. Main was merged into the branch and the new setup verified live on 20 Oct 2026:
- the boundary sits on the deploy, plan and apply roles;
- the IAM-apply role trusts only the `infra-iam` environment, which takes `main` only, with no admin bypass.

The infrastructure split, the pipeline, the services list and the card now describe three stacks.

## Review log

Plan review (adversarial, with the task, 20 Oct 2026), one finding, accepted:
- The plan listed where the live setup falls short of the guides, and this plan ships in a public repo. That list now goes to the owner privately; the plan keeps only the rule.

Build findings (own checks):
- AWS Config holds 18 rules of its own, not 17: the first count read one page of 25 out of 395 rules. Recounted with full pagination.
- "Every resource in OpenTofu" overstated it: the state bucket is made by hand. The card and the page now say so.
- "TLS 1.3" sat on the Cloudflare-to-CloudFront hop, but it is the visitor-facing setting. That label now reads "origin".

Implementation review (adversarial, with the task, 20 Oct 2026), two findings, both accepted:
- The risk list named a possible future control, which implied it is missing today. The risk line is now generic.
- "CloudTrail logs every call" overstated it: the trail's only event selector is management events. The diagram and the page now say sign-ins and management actions.

Implementation review (independent, fresh context, without the task, 20 Oct 2026), eight findings:
Accepted:
- "CI can never widen its own access" overstated the boundary: the apply role's `s3:*` covers the bucket policy (`infra/iam/roles.tf`). The card, the page and the diagram now say CI can't edit the IAM roles it runs as.
- "Only this distribution can read it" ignored same-account IAM principals. The page now says visitors only get files through CloudFront.
- The plan named a DNS record outside the portfolio. It now says so generically.
- The request diagram put the 404 page under S3; CloudFront maps S3's 403 and 404 to it (`infra/cloudfront.tf`). The label moved to CloudFront.
- "HTML revalidates on every request" blurred browser and CDN caching (the managed policy has a 1-second minimum TTL). It now names browsers and the invalidation.
- The plan check was described as planning every pull request, and every stack. It runs on every pull request, but only plans the site stack when infrastructure changed (`.github/workflows/infra.yml`).
- DMARC `p=reject` asks receivers to refuse mail; it doesn't guarantee it. Reworded.

Rejected:
- Raise the phone floor for diagrams from 0.6 to about 0.93, or build stacked phone layouts. The 0.6 floor (about 9 px text) is the site-wide choice from the earlier redesign review, and 0.93 would mean scrolling about 2.4 screens per diagram. Every diagram carries a text description, and the prose under it holds the same facts. Vertical phone layouts would be a site-wide follow-up, not part of this change.

Implementation review, round 2 (after merging main; one adversarial review with the task and one independent review without it, 20 Oct 2026), two findings, both accepted:
- Both: the note on what merged during the work described the state of another change in this public plan. It now names the PRs only.
- "Caps every CI role" overstated the boundary: the role that applies IAM has none; its own policy limits it instead (`infra/bootstrap/tofu-iam.tf`). The diagram, the card and the page lead now say the boundary caps the roles CI manages.

## Update, 21 Oct 2026

The site's AWS side now runs in a member account (`portfolio`, in a Workloads organizational unit) of the AWS Organization, under guardrails attached at the organization root. The page follows:

- "The AWS accounts" replaces "The AWS account": a new `awsOrg` diagram (organization root, its SCPs and RCP, the management account they don't apply to, and the site account they do), and the existing diagram with the root user's hardware key and GuardDuty in each account.
- Guardrails are described as the policies define them: regional API calls and new S3 buckets in us-east-1, no stopping or deleting CloudTrail trails in member accounts, the Config recorder, GuardDuty or Security Hub, no leaving the organization or closing the account, and S3 in member accounts reachable only by the organization's identities and AWS services. Neither applies to the management account, and SCPs don't limit service-linked roles.
- Root users: a hardware security key on the management account's root user; no root password or access keys in the site's account.
- Security services per account in us-east-1; safe defaults now include blocked public sharing of Systems Manager documents and no default VPCs; budget alerts at 50%, 80% and 100% and on forecast, covering both accounts.
- Serving: CloudFront refuses HTTPS requests without the secret header Cloudflare adds. Cloudflare's edge lists Bot Fight Mode. The CI apply token edits DNS and the request header rule.
- The services list adds AWS Organizations; the card blurb mentions the account; `setupCheckedOn` is 21 October 2026.

Every claim on the page, new or kept, was re-checked against the live setup on 21 Oct 2026.

Plan review (adversarial, with the task), ten findings: nine accepted (exact guardrail scope instead of "stops anyone"; regional calls rather than "work" in us-east-1; the RCP's scope; alarm and subscription wiring for both accounts checked; per-account and per-Region scope stated; current root-credential evidence for the site account; the origin lock described by its mechanism; AWS resources and state, not "everything", in the member account; stale token and "made by hand" wording fixed). One partly accepted: the date change re-certifies the whole page, so retained claims were re-checked too.

Implementation review, round 1 (21 Oct 2026; one adversarial review with the task and one independent review without it):
- Accepted: the card still said "CI roles capped by a boundary"; the role that applies IAM has none, so it now says the roles CI manages. The guardrail sentence credited the SCPs with protecting the organization trail, which lives in the management account and which member accounts can't change anyway; it now names CloudTrail trails in member accounts and says where the organization trail lives and that an alarm watches it. The infrastructure lead no longer reads as if the DNS records lived in the AWS account. Cloudflare's edge bullet now names the request header rule.

Implementation review, round 2 (21 Oct 2026): the review with the task approved. The independent review's accepted findings: the guardrail sentence now says the site runs in a member account because the policies don't apply to the management account, with the service-linked-role caveat separate; the second AWS diagram's description says whose root user has the hardware key and how root tasks run in the site's account; this section's summary names CloudTrail trails in member accounts. Rejected: rewording the CI apply token's description, which states its actual permissions.

After the account move finished (21 Oct 2026): the request header rule moved into the site stack, so the page lists it there; the old copy in the management account is deleted.
