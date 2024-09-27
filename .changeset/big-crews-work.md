---
"@onflow/flow-js-testing": minor
---

Allow loading service key from environment variables and files.

**BREAKING CHANGES**

- `getConfigValue` and `set` have been removed as these were just a confusing abstraction above the `@onflow/config` packages
- They have been replaced by exporting they `config` instance directly from the package
