### 0.2.0

#### **BREAKING CHANGES**
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

### 0.1.15

- `limit` field added to script and transactions
- `flow-cadut` brings several improvements and fixes to parser

### 0.1.14 - 2021-09-08

- Refactor FlowManager to include new block offset code
- Add code transformers functionality
- Add block offset functionality
- Add runnable examples
- Update documentation
- Update `flow-cadut` dependency and fixed support for complex types

### 0.1.13 - 2021-07-28

- Bootstrap utility added to framework
- Update `flow-cadut` dependency and fixed support for complex types
- Fixed issue with emulator throwing an error with `logging` flag set to `true`

