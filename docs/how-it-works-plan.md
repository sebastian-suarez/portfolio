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
- **GitHub:** a ruleset on `main` (pull requests only, `Build` and `Terraform plan` required, no force push or deletion, no bypass). The `production` and `infra` environments accept `main` only. The default workflow token is read-only. Secret scanning with push protection. Dependabot version updates.

Anything a guide asks for that is not live stays off the page and out of this repo, which is public; the owner gets that list privately.

Never on the page: account, distribution or zone IDs, ARNs, email addresses, token names, DNS records that aren't part of the portfolio, and any mention of AI tooling.

## Changes

1. **Hero:** a new `siteFlow` diagram, 600 × 440, in the torque path's U layout. Pull request → GitHub Actions → S3 bucket, down to CloudFront → Cloudflare → your browser, in two panels: publish on every merge, serve on every visit. The caption gives one sentence and links to `/how-it-works/`. `torquePath.ts` is deleted; nothing else uses it.
2. **Own projects:** a fourth card, "This portfolio", with a blurb, service chips, the public repo link and a link to the page. Its `iacSplit` diagram shows the split: a laptop applies the IAM stack, which defines the roles; GitHub Actions assumes them to plan and apply the site stack, which holds no IAM. The intro becomes "Four of my own projects…". `ProjectCard` gets an optional internal link.
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
