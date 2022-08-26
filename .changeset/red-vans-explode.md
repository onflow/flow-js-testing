---
"@onflow/flow-js-testing": patch
---

Block & timestamp offsets (e.g. `setBlockOffset`/`setTimestampOffset` now work in contracts. As well, `deployContract` & `deployContractByName` have the option of [accepting code transformers](/docs/api.md#deploycontractprops) like scripts/transactions.

Additionally, passing the `builtInMethods` code transformer is now deprecated for scripts & transactions which require usage of block/timestamp offsets as transformer is applied by default internally by Flow JS Testing.

[See more here](/TRANSITIONS.md#0002-depreaction-of-builtinmethods-code-transformer)
