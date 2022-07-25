---
"@onflow/flow-js-testing": minor
---

Allow custom transaction signers to be provided as object with `addr`, `privateKey`, `keyId`, `hashAlgorithm` keys as an alternative to supplying merely the signer's account address and having Flow JS Testing determine the rest. This allows for more complex transaction authorizers. See [documentation for examples](/docs/send-transactions.md).
