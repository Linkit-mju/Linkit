# Production Docker build cache

- Date: 2026-08-14
- Verdict: PASS

## Change

- Added GitHub Actions cache import/export to the ARM64 Buildx production build.
- Used a dedicated `linkit-production-arm64` scope so unrelated images do not
  evict or contaminate the production cache.
- Enabled `mode=max` to retain intermediate frontend, Gradle, and runtime layers.

## Verification

- Production workflow YAML parse: PASS.
- Cache import and export arguments use the Buildx `gha` backend: PASS.
- Shell syntax for the multiline `docker buildx build` command: PASS.
- `git diff --check`: PASS.

The first run after this change populates the cache and may still take roughly
the previous build time. Subsequent builds benefit when their Docker layers are
unchanged.
