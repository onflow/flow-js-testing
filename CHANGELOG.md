# flow-js-testing

## 0.3.0-alpha.12

### Patch Changes

- [#149](https://github.com/onflow/flow-js-testing/pull/149) [`fcabb81`](https://github.com/onflow/flow-js-testing/commit/fcabb81ebf78bc271ca39c01e4c901cae94cf8b0) Thanks [@jribbink](https://github.com/jribbink)! - Fix flow-cadut imports that prevented CLI from working

## 0.3.0-alpha.11

### Minor Changes

- [#142](https://github.com/onflow/flow-js-testing/pull/142) [`9aecfdd`](https://github.com/onflow/flow-js-testing/commit/9aecfdd67a98f4eb16b7350b8892c08d83dbd0f7) Thanks [@jribbink](https://github.com/jribbink)! - **BREAKING** Bumped @onflow/fcl to 1.1.1-alpha.1

  Developers should note that `[U]Int*` and `Word*` types are now decoded into strings by @onflow/fcl and no longer implicitly decoded into numbers. This means that these types will need to be explicitly converted to JavaScript Number types if required.

  This potentially affects the return values or event data for the following flow-js-testing features.

  - `sendTransaction` (any `[U]Int*` and `Word*` event data will be decoded into a string instead of number)
  - `executeScript` (any `[U]Int*` and `Word*` return values will be decoded into a string instead of number)
  - `deployContract`/`deployContractByName` (any `[U]Int*` and `Word*` event data will be decoded into a string instead of number)
  - `updateContract` (any `[U]Int*` and `Word*` event data will be decoded into a string instead of number)
  - `getBlockOffset` (return value will be string instead of number, and must be explicitly converted if JavaScript Number is required)

  [See more here](https://github.com/onflow/fcl-js/blob/%40onflow/fcl%401.0.3-alpha.1/packages/sdk/CHANGELOG.md#100-alpha0)

### Patch Changes

- [#144](https://github.com/onflow/flow-js-testing/pull/144) [`d1eb29b`](https://github.com/onflow/flow-js-testing/commit/d1eb29bd5d115d4e13725de96bb9b53d3f9655ad) Thanks [@jribbink](https://github.com/jribbink)! - Convert examples to run in Jest environment instead of ESM loader

## 0.3.0-alpha.10

### Patch Changes

- [#138](https://github.com/onflow/flow-js-testing/pull/138) [`e807e83`](https://github.com/onflow/flow-js-testing/commit/e807e831de37f92dc429f872ac62f1ab4d575d0e) Thanks [@jribbink](https://github.com/jribbink)! - Version bump @onflow/flow-cadut (fixes "transaction" keyword not allowed in templates & adds PublicPath/PrivatePath/StoragePath/CapabilityPath argument compatibility)

## 0.3.0-alpha.9

### Minor Changes

- [#126](https://github.com/onflow/flow-js-testing/pull/126) [`3fc34f3`](https://github.com/onflow/flow-js-testing/commit/3fc34f3f52f2623ca825ba84e05c774996bce67e) Thanks [@refi93](https://github.com/refi93)! - Add getTimeOffset/setTimeOffset utilities, allowing to advance the time while testing smart-contracts

* [#129](https://github.com/onflow/flow-js-testing/pull/129) [`78944c1`](https://github.com/onflow/flow-js-testing/commit/78944c155dd50bff9a350bfac5da0c2dd5493d69) Thanks [@jribbink](https://github.com/jribbink)! - Add optional error message match to shallRevert Jest assertion

## 0.3.0-alpha.8

### Minor Changes

- 033562b: Dynamically select ports for emulator instead of supplying admin port statically through emulator.start arguments, deprecate use of this argument

## 0.2.3-alpha.7

### Patch Changes

- 5791e66: Introduce changesets

## 0.2.0

### **BREAKING CHANGES**

- `sendTransaction` and `executeScript` functions now return a tuple of [result, error]. As do the following functions:

  - updateContract
  - setBlockOffset
  - scratch
  - registerContract
  - mintTokens
  - initManager
  - deployContract
  - createAccount
  - setBlockOffset
  - mintFlow

  - getManagerAddress
  - getContractAddress
  - getBlockOffset
  - getBalance
  - getAccountAddress
  - checkManager
  - getBlockOffset
  - getFlowBalance

Any code that relies upon checking the result of any of these functions and expects only the result returned will need to be refactored.
Jest asserts were updated accordingly, but if you were writing your own you will need to update them.
For examples of new usage see the [script](/docs/exeute-scripts.md), [transaction](/docs/send-transactions.md) and [api](/docs/api.md) documentation.

## 0.1.15

- `limit` field added to script and transactions
- `flow-cadut` brings several improvements and fixes to parser

## 0.1.14 - 2021-09-08

- Refactor FlowManager to include new block offset code
- Add code transformers functionality
- Add block offset functionality
- Add runnable examples
- Update documentation
- Update `flow-cadut` dependency and fixed support for complex types

## 0.1.13 - 2021-07-28

- Bootstrap utility added to framework
- Update `flow-cadut` dependency and fixed support for complex types
- Fixed issue with emulator throwing an error with `logging` flag set to `true`
