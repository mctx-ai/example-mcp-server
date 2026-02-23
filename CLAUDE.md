# Example MCP Server - Project Guidelines

## GitHub Actions Security

**ALL GitHub Actions MUST be SHA-pinned. NO EXCEPTIONS.**

### The Rule

Reference actions by full commit SHA, never by tag or branch name.

**Why this matters:**
- **Tags are mutable** - Can be force-pushed to point to malicious code
- **Supply chain security** - Prevents compromised action maintainers from injecting code into your workflows
- **Reproducibility** - Guarantees exact same action code runs every time
- **Audit trail** - Clear record of exactly which version ran

### Examples

❌ **WRONG - Tag references:**
```yaml
uses: actions/checkout@v4
uses: actions/setup-node@v4
uses: docker/build-push-action@v5
```

✅ **CORRECT - SHA-pinned with version comment:**
```yaml
uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0
uses: docker/build-push-action@4f58ea79222b3b9dc2c8bbdd6debcef730109a75 # v5.0.0
```

### Comment Convention

Always include a trailing comment with the version tag for human readability:
- Makes reviews easier (reviewers see version at a glance)
- Simplifies upgrades (know which tag to look for when updating)
- Documents intent (SHA alone is opaque)

**Format:** `uses: owner/repo@<full-sha> # <version-tag>`

### Finding SHAs

```bash
# Get SHA for a specific tag
gh api repos/actions/checkout/git/ref/tags/v4.2.2 --jq '.object.sha'

# Or browse releases on GitHub
# https://github.com/actions/checkout/releases
```

### Enforcement

All workflow files in `.github/workflows/` must comply. PRs with tag-based action references will be rejected.

## Version Bump Process

**Admin-only operation.** Version bumps require branch protection bypass (admin privileges). Only Karl can push these.

### Steps

1. Update `version` in `package.json` on `main` (run `npm install` to sync `package-lock.json`)
2. Commit on `main`: `chore: bump version to X.Y.Z`
3. Cherry-pick that commit onto `release`
4. Push both `main` and `release` branches

### Notes

- No code changes — version bump only
- Requires admin bypass for branch protection on both `main` and `release`
- Always wait for any in-flight deployments to finish before pushing
