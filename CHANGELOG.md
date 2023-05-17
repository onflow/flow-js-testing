# flow-js-testing

## 0.5.0

### Minor Changes

- [#215](https://github.com/onflow/flow-js-testing/pull/215) [`7c302b8`](https://github.com/onflow/flow-js-testing/commit/7c302b87ba5e4b3f061e3b56cb5c415cc7ec9910) Thanks [@MaxStalker](https://github.com/MaxStalker)! - - Storage inspection API implemented as set of utility methods
  - Additional Jest helpers implemented
  - Related documentation added

* [#220](https://github.com/onflow/flow-js-testing/pull/220) [`c16e6a6`](https://github.com/onflow/flow-js-testing/commit/c16e6a6e687ff741caa54c4b5d2c400b3ba7aabb) Thanks [@jribbink](https://github.com/jribbink)! - Added debugger port & dropped support for Flow CLI versions <1.0.0

## 0.4.0

### Minor Changes

- [#155](https://github.com/onflow/flow-js-testing/pull/155) [`9dcab53`](https://github.com/onflow/flow-js-testing/commit/9dcab535393654e3c6ba41a3ac41095519446c27) Thanks [@jribbink](https://github.com/jribbink)! - Allow custom transaction signers to be provided as object with `addr`, `privateKey`, `keyId`, `hashAlgorithm`, `signatureAlgorithm` keys as an alternative to supplying merely the signer's account address and having Flow JS Testing determine the rest. This allows for more complex transaction authorizers. See [documentation for examples](/docs/send-transactions.md).

* [#158](https://github.com/onflow/flow-js-testing/pull/158) [`57edf7d`](https://github.com/onflow/flow-js-testing/commit/57edf7d215dd535ee8c4fa0e3dbc2d998efa8c79) Thanks [@jribbink](https://github.com/jribbink)! - Flow JS Testing now exports multiple new API methods:

  - [`pubFlowKey`](/docs/api.md#pubflowkeykeyobject) - may be used to generate an RLP-encoded `Buffer` representing a public key corresponding to a particular private key.
  - [`createAccount`](/docs/accounts.md#createaccountname-keys) method which may be used to manually create an account with a given human-readable name & specified keys.

  And exports the following two enums which may be used with [`createAccount`](/docs/accounts.md#createaccountname-keys) and [`sendTransaction`](/docs/send-transactions.md):

  - [`SignatureAlgorithm`](/docs/api.md#signaturealgorithm)
  - [`HashAlgorithm`](/docs/api.md#hashalgorithm)

- [#126](https://github.com/onflow/flow-js-testing/pull/126) [`3fc34f3`](https://github.com/onflow/flow-js-testing/commit/3fc34f3f52f2623ca825ba84e05c774996bce67e) Thanks [@refi93](https://github.com/refi93)! - Add getTimeOffset/setTimeOffset utilities, allowing to advance the time while testing smart-contracts

* [#170](https://github.com/onflow/flow-js-testing/pull/170) [`da5e666`](https://github.com/onflow/flow-js-testing/commit/da5e6667fd9cf134ea536d6c82ce5e649e86d28f) Thanks [@jribbink](https://github.com/jribbink)! - Emulator logs are now captured when calling `executeScript`, `sendTransaction`, `deployContract`, and `deployContractByName`. They part of the tuple returned by these functions (i.e. `[result, error, logs]`) and are provided as an array of strings.

- [#142](https://github.com/onflow/flow-js-testing/pull/142) [`9aecfdd`](https://github.com/onflow/flow-js-testing/commit/9aecfdd67a98f4eb16b7350b8892c08d83dbd0f7) Thanks [@jribbink](https://github.com/jribbink)! - **BREAKING** Bumped @onflow/fcl to 1.1.1-alpha.1

  Developers should note that `[U]Int*` and `Word*` types are now decoded into strings by @onflow/fcl and no longer implicitly decoded into numbers. This means that these types will need to be explicitly converted to JavaScript Number types if required.

  This potentially affects the return values or event data for the following flow-js-testing features.

  - `sendTransaction` (any `[U]Int*` and `Word*` event data will be decoded into a string instead of number)
  - `executeScript` (any `[U]Int*` and `Word*` return values will be decoded into a string instead of number)
  - `deployContract`/`deployContractByName` (any `[U]Int*` and `Word*` event data will be decoded into a string instead of number)
  - `updateContract` (any `[U]Int*` and `Word*` event data will be decoded into a string instead of number)
  - `getBlockOffset` (return value will be string instead of number, and must be explicitly converted if JavaScript Number is required)

  [See more here](https://github.com/onflow/fcl-js/blob/%40onflow/fcl%401.0.3-alpha.1/packages/sdk/CHANGELOG.md#100-alpha0)

* [#166](https://github.com/onflow/flow-js-testing/pull/166) [`69b25e0`](https://github.com/onflow/flow-js-testing/commit/69b25e089a28ccea40e1ba41ff2045aa71b92cb4) Thanks [@jribbink](https://github.com/jribbink)! - Add `signUserMessage` utility to sign a message with an arbitrary signer and `verifyUserMessage` to verify signatures. [See more here](/docs/api.md#signusermessagemessage-signer)

- [#117](https://github.com/onflow/flow-js-testing/pull/117) [`033562b`](https://github.com/onflow/flow-js-testing/commit/033562b78e7d0b065578fd4bd1d63dae528c091a) Thanks [@jribbink](https://github.com/jribbink)! - Dynamically select ports for emulator instead of supplying admin port statically through emulator.start arguments, deprecate use of this argument

* [#129](https://github.com/onflow/flow-js-testing/pull/129) [`78944c1`](https://github.com/onflow/flow-js-testing/commit/78944c155dd50bff9a350bfac5da0c2dd5493d69) Thanks [@jribbink](https://github.com/jribbink)! - Add optional error message match to shallRevert Jest assertion

### Patch Changes

- [#207](https://github.com/onflow/flow-js-testing/pull/207) [`a65ff32`](https://github.com/onflow/flow-js-testing/commit/a65ff328863aaac087a4f01c66a19a660f52519f) Thanks [@MaxStalker](https://github.com/MaxStalker)! - - Tests updated and double-checked.
  - Fixed regexp for log extracting.
  - Added ability to skip transaction signatures validation.
  - Updated GitHub actions to show code coverage report

* [#177](https://github.com/onflow/flow-js-testing/pull/177) [`8d75426`](https://github.com/onflow/flow-js-testing/commit/8d75426bd605c8488809f271537fd6dcdf43e81f) Thanks [@adbario](https://github.com/adbario)! - Fix the warning about deprecated default compute limit for transactions

- [#190](https://github.com/onflow/flow-js-testing/pull/190) [`1ce23f0`](https://github.com/onflow/flow-js-testing/commit/1ce23f0c1e78afb2bec372aadb59212aa7666ab9) Thanks [@adbario](https://github.com/adbario)! - Add explicit scoping to arguments for scripts in nested await functions to hint microbunde into doing the right thing

* [#164](https://github.com/onflow/flow-js-testing/pull/164) [`962b535`](https://github.com/onflow/flow-js-testing/commit/962b53572848ba17f7b472e07171f0e775448406) Thanks [@jribbink](https://github.com/jribbink)! - Bump @onflow/flow-cadut to 0.2.0-alpha.7 (fixes bug where optional array, dictionary, path arguments did not work)

- [#138](https://github.com/onflow/flow-js-testing/pull/138) [`e807e83`](https://github.com/onflow/flow-js-testing/commit/e807e831de37f92dc429f872ac62f1ab4d575d0e) Thanks [@jribbink](https://github.com/jribbink)! - Version bump @onflow/flow-cadut (fixes "transaction" keyword not allowed in templates & adds PublicPath/PrivatePath/StoragePath/CapabilityPath argument compatibility)

* [#149](https://github.com/onflow/flow-js-testing/pull/149) [`fcabb81`](https://github.com/onflow/flow-js-testing/commit/fcabb81ebf78bc271ca39c01e4c901cae94cf8b0) Thanks [@jribbink](https://github.com/jribbink)! - Fix flow-cadut imports that prevented CLI from working

- [#192](https://github.com/onflow/flow-js-testing/pull/192) [`31c5da0`](https://github.com/onflow/flow-js-testing/commit/31c5da087108b22ce3dba9cd31ca6282f0ec81ff) Thanks [@justinbarry](https://github.com/justinbarry)! - Fix imports for flow-cadut generator

* [#116](https://github.com/onflow/flow-js-testing/pull/116) [`5791e66`](https://github.com/onflow/flow-js-testing/commit/5791e669e9304dc82f8dbefd0aa923d10e4aac25) Thanks [@jribbink](https://github.com/jribbink)! - Introduce changesets

- [#186](https://github.com/onflow/flow-js-testing/pull/186) [`de917f0`](https://github.com/onflow/flow-js-testing/commit/de917f004c5171e8e26aaf9919e1511d949bafce) Thanks [@justinbarry](https://github.com/justinbarry)! - No longer compress the packaged version of the library

* [#165](https://github.com/onflow/flow-js-testing/pull/165) [`4ac3741`](https://github.com/onflow/flow-js-testing/commit/4ac37411199245528fb149b0f7bff7125311ac44) Thanks [@jribbink](https://github.com/jribbink)! - Block & timestamp offsets (e.g. `setBlockOffset`/`setTimestampOffset` now work in contracts. As well, `deployContract` & `deployContractByName` have the option of [accepting code transformers](/docs/api.md#deploycontractprops) like scripts/transactions.

  Additionally, passing the `builtInMethods` code transformer is now deprecated for scripts & transactions which require usage of block/timestamp offsets as transformer is applied by default internally by Flow JS Testing.

  [See more here](/TRANSITIONS.md#0002-depreaction-of-builtinmethods-code-transformer)

- [#186](https://github.com/onflow/flow-js-testing/pull/186) [`ff208e2`](https://github.com/onflow/flow-js-testing/commit/ff208e2fd397e685900ed29baaa2846b0bbe5bab) Thanks [@justinbarry](https://github.com/justinbarry)! - Add explicit scoping to arguments in nested await functions to hint microbunde into doing the right thing

* [#144](https://github.com/onflow/flow-js-testing/pull/144) [`d1eb29b`](https://github.com/onflow/flow-js-testing/commit/d1eb29bd5d115d4e13725de96bb9b53d3f9655ad) Thanks [@jribbink](https://github.com/jribbink)! - Convert examples to run in Jest environment instead of ESM loader

- [#188](https://github.com/onflow/flow-js-testing/pull/188) [`f905016`](https://github.com/onflow/flow-js-testing/commit/f905016c57c4d438c5be56eded188a0169d6eb59) Thanks [@adbario](https://github.com/adbario)! - Fix numbers as values deprecation warnings for tests

* [#156](https://github.com/onflow/flow-js-testing/pull/156) [`2206eda`](https://github.com/onflow/flow-js-testing/commit/2206eda493e7c51cfe53c1cbf9365e81064dbcef) Thanks [@jribbink](https://github.com/jribbink)! - Bumped @onflow/fcl to ^1.2.1-alpha.0

## 0.3.2-alpha.0

### Patch Changes

- [#207](https://github.com/onflow/flow-js-testing/pull/207) [`a65ff32`](https://github.com/onflow/flow-js-testing/commit/a65ff328863aaac087a4f01c66a19a660f52519f) Thanks [@MaxStalker](https://github.com/MaxStalker)! - - Tests updated and double-checked.
  - Fixed regexp for log extracting.
  - Added ability to skip transaction signatures validation.
  - Updated GitHub actions to show code coverage report

## 0.3.0-alpha.17

### Patch Changes

- [#177](https://github.com/onflow/flow-js-testing/pull/177) [`8d75426`](https://github.com/onflow/flow-js-testing/commit/8d75426bd605c8488809f271537fd6dcdf43e81f) Thanks [@adbario](https://github.com/adbario)! - Fix the warning about deprecated default compute limit for transactions

* [#190](https://github.com/onflow/flow-js-testing/pull/190) [`1ce23f0`](https://github.com/onflow/flow-js-testing/commit/1ce23f0c1e78afb2bec372aadb59212aa7666ab9) Thanks [@adbario](https://github.com/adbario)! - Add explicit scoping to arguments for scripts in nested await functions to hint microbunde into doing the right thing

- [#192](https://github.com/onflow/flow-js-testing/pull/192) [`31c5da0`](https://github.com/onflow/flow-js-testing/commit/31c5da087108b22ce3dba9cd31ca6282f0ec81ff) Thanks [@justinbarry](https://github.com/justinbarry)! - Fix imports for flow-cadut generator

* [#188](https://github.com/onflow/flow-js-testing/pull/188) [`f905016`](https://github.com/onflow/flow-js-testing/commit/f905016c57c4d438c5be56eded188a0169d6eb59) Thanks [@adbario](https://github.com/adbario)! - Fix numbers as values deprecation warnings for tests

## 0.3.0-alpha.16

### Patch Changes

- [#186](https://github.com/onflow/flow-js-testing/pull/186) [`de917f0`](https://github.com/onflow/flow-js-testing/commit/de917f004c5171e8e26aaf9919e1511d949bafce) Thanks [@justinbarry](https://github.com/justinbarry)! - No longer compress the packaged version of the library

* [#186](https://github.com/onflow/flow-js-testing/pull/186) [`ff208e2`](https://github.com/onflow/flow-js-testing/commit/ff208e2fd397e685900ed29baaa2846b0bbe5bab) Thanks [@justinbarry](https://github.com/justinbarry)! - Add explicit scoping to arguments in nested await functions to hint microbunde into doing the right thing

## 0.3.0-alpha.15

### Minor Changes

- [#170](https://github.com/onflow/flow-js-testing/pull/170) [`da5e666`](https://github.com/onflow/flow-js-testing/commit/da5e6667fd9cf134ea536d6c82ce5e649e86d28f) Thanks [@jribbink](https://github.com/jribbink)! - Emulator logs are now captured when calling `executeScript`, `sendTransaction`, `deployContract`, and `deployContractByName`. They part of the tuple returned by these functions (i.e. `[result, error, logs]`) and are provided as an array of strings.

* [#166](https://github.com/onflow/flow-js-testing/pull/166) [`69b25e0`](https://github.com/onflow/flow-js-testing/commit/69b25e089a28ccea40e1ba41ff2045aa71b92cb4) Thanks [@jribbink](https://github.com/jribbink)! - Add `signUserMessage` utility to sign a message with an arbitrary signer and `verifyUserMessage` to verify signatures. [See more here](/docs/api.md#signusermessagemessage-signer)

### Patch Changes

- [#165](https://github.com/onflow/flow-js-testing/pull/165) [`4ac3741`](https://github.com/onflow/flow-js-testing/commit/4ac37411199245528fb149b0f7bff7125311ac44) Thanks [@jribbink](https://github.com/jribbink)! - Block & timestamp offsets (e.g. `setBlockOffset`/`setTimestampOffset` now work in contracts. As well, `deployContract` & `deployContractByName` have the option of [accepting code transformers](/docs/api.md#deploycontractprops) like scripts/transactions.

  Additionally, passing the `builtInMethods` code transformer is now deprecated for scripts & transactions which require usage of block/timestamp offsets as transformer is applied by default internally by Flow JS Testing.

  [See more here](/TRANSITIONS.md#0002-depreaction-of-builtinmethods-code-transformer)

## 0.3.0-alpha.14

### Minor Changes

- [#155](https://github.com/onflow/flow-js-testing/pull/155) [`9dcab53`](https://github.com/onflow/flow-js-testing/commit/9dcab535393654e3c6ba41a3ac41095519446c27) Thanks [@jribbink](https://github.com/jribbink)! - Allow custom transaction signers to be provided as object with `addr`, `privateKey`, `keyId`, `hashAlgorithm`, `signatureAlgorithm` keys as an alternative to supplying merely the signer's account address and having Flow JS Testing determine the rest. This allows for more complex transaction authorizers. See [documentation for examples](/docs/send-transactions.md).

- [#158](https://github.com/onflow/flow-js-testing/pull/158) [`57edf7d`](https://github.com/onflow/flow-js-testing/commit/57edf7d215dd535ee8c4fa0e3dbc2d998efa8c79) Thanks [@jribbink](https://github.com/jribbink)! - Flow JS Testing now exports multiple new API methods:

  - [`pubFlowKey`](/docs/api.md#pubflowkeykeyobject) - may be used to generate an RLP-encoded `Buffer` representing a public key corresponding to a particular private key.
  - [`createAccount`](/docs/accounts.md#createaccountname-keys) method which may be used to manually create an account with a given human-readable name & specified keys.

  And exports the following two enums which may be used with [`createAccount`](/docs/accounts.md#createaccountname-keys) and [`sendTransaction`](/docs/send-transactions.md):

  - [`SignatureAlgorithm`](/docs/api.md#signaturealgorithm)
  - [`HashAlgorithm`](/docs/api.md#hashalgorithm)

### Patch Changes

- [#164](https://github.com/onflow/flow-js-testing/pull/164) [`962b535`](https://github.com/onflow/flow-js-testing/commit/962b53572848ba17f7b472e07171f0e775448406) Thanks [@jribbink](https://github.com/jribbink)! - Bump @onflow/flow-cadut to 0.2.0-alpha.7 (fixes bug where optional array, dictionary, path arguments did not work)

- [#156](https://github.com/onflow/flow-js-testing/pull/156) [`2206eda`](https://github.com/onflow/flow-js-testing/commit/2206eda493e7c51cfe53c1cbf9365e81064dbcef) Thanks [@jribbink](https://github.com/jribbink)! - Bumped @onflow/fcl to ^1.2.1-alpha.0

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
