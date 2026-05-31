#!/usr/bin/env bash
# Uploads a PNG screenshot to the current PR's GitHub assets and prints the CDN URL.
#
# Usage:
#   bash ui-agent/scripts/upload-screenshot.sh path/to/screenshot.png
#
# Requirements:
#   - gh CLI authenticated (gh auth status)
#   - Must be run from inside the repo with an open PR on the current branch

set -euo pipefail

FILE="${1:?Usage: upload-screenshot.sh <path-to-image.png>}"

if [[ ! -f "$FILE" ]]; then
  echo "Error: file not found: $FILE" >&2
  exit 1
fi

FILENAME=$(basename "$FILE")
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
PR_NUMBER=$(gh pr view --json number -q .number 2>/dev/null || echo "")

if [[ -z "$PR_NUMBER" ]]; then
  echo "Error: no open PR found for the current branch." >&2
  echo "       Push your branch and open a PR first, or run: gh pr create" >&2
  exit 1
fi

CDN_URL=$(gh api \
  --method POST \
  -H "Content-Type: image/png" \
  --input "$FILE" \
  "repos/$REPO/issues/$PR_NUMBER/assets?name=$FILENAME" \
  --jq '.url')

echo "$CDN_URL"
