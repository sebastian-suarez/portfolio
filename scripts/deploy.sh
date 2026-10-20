#!/usr/bin/env bash
# Publishes an Astro build to S3 with the right Cache-Control per file class, then invalidates CloudFront.
# Used by .github/workflows/deploy.yml; also runnable locally with AWS credentials in the shell.
#
#   S3_BUCKET=... CLOUDFRONT_DISTRIBUTION_ID=... ./scripts/deploy.sh [dist-dir]
set -euo pipefail

: "${S3_BUCKET:?set S3_BUCKET}"
: "${CLOUDFRONT_DISTRIBUTION_ID:?set CLOUDFRONT_DISTRIBUTION_ID}"
DIST="${1:-dist}"

if [[ ! -f "$DIST/index.html" ]]; then
  echo "error: $DIST/index.html not found — run the build first" >&2
  exit 1
fi

# 1) Hashed assets (Astro writes them under _astro/ with a content hash in the name): cache forever.
if [[ -d "$DIST/_astro" ]]; then
  aws s3 sync "$DIST/_astro/" "s3://$S3_BUCKET/_astro/" --delete \
    --cache-control "public, max-age=31536000, immutable"
fi

# 2) Everything else (HTML, public/ assets, sitemap, robots): always revalidate, so a deploy is live
#    as soon as CloudFront is invalidated. Cloudflare honours max-age=0 and does not cache these.
aws s3 sync "$DIST/" "s3://$S3_BUCKET/" --delete --exclude "_astro/*" \
  --cache-control "public, max-age=0, must-revalidate"

# 3) Drop CloudFront's cached copies. First 1,000 paths/month are free; "/*" counts as one.
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths "/*" \
  --query 'Invalidation.Id' --output text)
aws cloudfront wait invalidation-completed \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --id "$INVALIDATION_ID"

echo "deployed $(find "$DIST" -type f | wc -l | tr -d ' ') files to s3://$S3_BUCKET; invalidation $INVALIDATION_ID complete"
