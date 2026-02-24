#!/usr/bin/env bash
# admin/version.sh
#
# Admin-only script for reading the current version or bumping the package
# version and syncing it to the release branch. Requires branch protection
# bypass (admin) privileges for bump operations.
#
# Usage:
#   ./admin/version.sh               # Read current version
#   ./admin/version.sh <patch|minor|major|X.Y.Z> [--push]
#
# Arguments:
#   (no args)                        Read current version and exit
#   patch|minor|major                Semver increment type
#   X.Y.Z                            Explicit version (e.g. 1.2.3)
#   --push                           Push both main and release after cherry-pick

set -euo pipefail

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MAIN_BRANCH="main"
RELEASE_BRANCH="release"

# ---------------------------------------------------------------------------
# Read current version (always available)
# ---------------------------------------------------------------------------
read_version() {
  npm pkg get version --workspaces=false | tr -d '"'
}

# ---------------------------------------------------------------------------
# No-args behavior: read and output version
# ---------------------------------------------------------------------------
if [[ $# -eq 0 ]]; then
  version=$(read_version)
  echo "$version"
  exit 0
fi

# ---------------------------------------------------------------------------
# Usage for bump operations
# ---------------------------------------------------------------------------
usage() {
  echo "Usage: $(basename "$0") [<patch|minor|major|X.Y.Z>] [--push]"
  exit 1
}

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------
bump_type=""
push_branches=false

for arg in "$@"; do
  case "$arg" in
    --push)
      push_branches=true
      ;;
    *)
      bump_type="$arg"
      ;;
  esac
done

if [[ -z "$bump_type" ]]; then
  usage
fi

# ---------------------------------------------------------------------------
# Safety checks
# ---------------------------------------------------------------------------
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$current_branch" != "$MAIN_BRANCH" ]]; then
  echo "Error: must be on '$MAIN_BRANCH' branch (currently on '$current_branch')."
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: working tree is not clean. Commit or stash changes before bumping."
  exit 1
fi

if ! git show-ref --quiet "refs/heads/$RELEASE_BRANCH"; then
  echo "Error: local branch '$RELEASE_BRANCH' does not exist."
  echo "Run: git fetch origin $RELEASE_BRANCH:$RELEASE_BRANCH"
  exit 1
fi

# ---------------------------------------------------------------------------
# Read current version
# ---------------------------------------------------------------------------
current_version=$(read_version)
echo "Current version: $current_version"

# ---------------------------------------------------------------------------
# Compute next version
# ---------------------------------------------------------------------------
compute_next_version() {
  local version="$1"
  local bump="$2"

  local major minor patch
  major=$(echo "$version" | cut -d. -f1)
  minor=$(echo "$version" | cut -d. -f2)
  patch=$(echo "$version" | cut -d. -f3)

  case "$bump" in
    major)
      major=$((major + 1))
      minor=0
      patch=0
      ;;
    minor)
      minor=$((minor + 1))
      patch=0
      ;;
    patch)
      patch=$((patch + 1))
      ;;
    *)
      # Treat as explicit version — validate format
      if [[ ! "$bump" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "Error: '$bump' is not a valid semver type (patch|minor|major) or version (X.Y.Z)."
        exit 1
      fi
      echo "$bump"
      return
      ;;
  esac

  echo "${major}.${minor}.${patch}"
}

next_version=$(compute_next_version "$current_version" "$bump_type")
echo "Next version:    $next_version"

# ---------------------------------------------------------------------------
# Update package.json and sync package-lock.json
# ---------------------------------------------------------------------------
echo ""
echo "Updating package.json..."
npm pkg set version="$next_version"

echo "Syncing package-lock.json..."
npm install --package-lock-only --ignore-scripts

# ---------------------------------------------------------------------------
# Commit on main
# ---------------------------------------------------------------------------
commit_message="chore: bump version to ${next_version}"

echo "Staging package.json and package-lock.json..."
git add package.json package-lock.json

echo "Committing: ${commit_message}"
git commit -m "$commit_message"

commit_sha=$(git rev-parse HEAD)
echo "Committed: $commit_sha"

# ---------------------------------------------------------------------------
# Cherry-pick onto release
# ---------------------------------------------------------------------------
echo ""
echo "Switching to '$RELEASE_BRANCH'..."
git switch "$RELEASE_BRANCH"

echo "Cherry-picking $commit_sha onto '$RELEASE_BRANCH'..."
if ! git cherry-pick "$commit_sha"; then
  echo "Error: cherry-pick conflict on '$RELEASE_BRANCH'. To recover:"
  echo "  git cherry-pick --abort && git switch $MAIN_BRANCH"
  exit 1
fi

echo "Switching back to '$MAIN_BRANCH'..."
git switch "$MAIN_BRANCH"

# ---------------------------------------------------------------------------
# Push (optional)
# ---------------------------------------------------------------------------
if [[ "$push_branches" == true ]]; then
  echo ""
  echo "Pushing '$MAIN_BRANCH'..."
  git push origin "$MAIN_BRANCH"

  echo "Pushing '$RELEASE_BRANCH'..."
  git push origin "$RELEASE_BRANCH"

  echo ""
  echo "Done. Version $next_version pushed to both '$MAIN_BRANCH' and '$RELEASE_BRANCH'."
else
  echo ""
  echo "Done. Version $next_version committed locally."
  echo "Run with --push to push both '$MAIN_BRANCH' and '$RELEASE_BRANCH', or push manually:"
  echo "  git push origin $MAIN_BRANCH $RELEASE_BRANCH"
fi

# ---------------------------------------------------------------------------
# Output new version to stdout
# ---------------------------------------------------------------------------
echo "$next_version"
