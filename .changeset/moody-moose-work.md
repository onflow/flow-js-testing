---
"@onflow/flow-js-testing": minor
---

Emulator logs are now captured when calling `executeScript`, `sendTransaction`, `deployContract`, and `deployContractByName`. They part of the tuple returned by these functions (i.e. `[result, error, logs]`) and are provided as an array of strings.
