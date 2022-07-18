---
"@onflow/flow-js-testing": minor
---

**BREAKING** Bumped @onflow/fcl to 1.1.1-alpha.1

Developers should note that `[U]Int*` and `Word*` types are now decoded into strings by @onflow/fcl and no longer implicitly decoded into numbers.  This means that these types will need to be explicitly converted to JavaScript Number types if required.

This potentially affects the return values or event data for the following flow-js-testing features.

 - `sendTransaction` (any `[U]Int*` and `Word*` event data will be decoded into a string instead of number)
 - `executeScript` (any `[U]Int*` and `Word*` return values will be decoded into a string instead of number)
 - `deployContract`/`deployContractByName` (any `[U]Int*` and `Word*` event data will be decoded into a string instead of number)
 - `updateContract` (any `[U]Int*` and `Word*` event data will be decoded into a string instead of number)
 - `getBlockOffset` (return value will be string instead of number, and must be explicitly converted if JavaScript Number is required)

[See more here](https://github.com/onflow/fcl-js/blob/%40onflow/fcl%401.0.3-alpha.1/packages/sdk/CHANGELOG.md#100-alpha0)