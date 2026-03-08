#!/usr/bin/env bash
# gitgone - simple helper to add, commit and push current branch (POSIX)
# Usage: tools/gitgone.sh "Commit message"

set -euo pipefail

if [ ! -d .git ]; then
  echo "Not a git repository. Run this from your project root." >&2
  exit 1
fi

MSG=${1:-"update"}
shift || true

echo "Staging all changes..."
git add -A

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

echo "Committing with message: '$MSG'"
git commit -m "$MSG"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Pushing branch $BRANCH to origin..."
git push origin "$BRANCH"

echo "Done."
