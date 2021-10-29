### 0.1.13 - 2021-07-28

- Bootstrap utility added to framework
- Update `flow-cadut` dependency and fixed support for complex types
- Fixed issue with emulator throwing an error with `logging` flag set to `true`

### FlipFest entry 29/10/21

 *BREAKING CHANGES*

- sendTransaction and exectureScript functions now return a tuple of [result, error]
- As do the following functions:
    
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

- **Any code that relies upon checking the result of any of these functions and expects only the result returned will need to be refactored.**

- For examples of new usage see the [script](/docs/exeute-scripts.md), [transaction](/docs/send-transactions.md) and [api](/docs/api.md) documentation.
