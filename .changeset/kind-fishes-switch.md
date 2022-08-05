---
"@onflow/flow-js-testing": minor
---

Flow JS Testing now exports multiple new API methods:

- [`pubFlowKey`](/docs/api.md#pubflowkeykeyobject) - may be used to generate an RLP-encoded `Buffer` representing a public key corresponding to a particular private key.
- [`createAccount`](/docs/accounts.md#createaccountname-keys) method which may be used to manually create an account with a given human-readable name & specified keys.

And exports the following two enums which may be used with [`createAccount`](/docs/accounts.md#createaccountname-keys) and [`sendTransaction`](/docs/send-transactions.md):

- [`SignatureAlgorithm`](/docs/api.md#signaturealgorithm)
- [`HashAlgorithm`](/docs/api.md#hashalgorithm)
