---
title: Contracts Management
sidebar_title: Contracts
description: How to manage contracts
---

> ⚠️ **Required:** Your project must follow the [required structure](./structure.md) and it must be [initialized](./init.md) to use the following functions.

## `deployContractByName(props)`

Deploys contract code located inside a Cadence file. Returns the transaction result.

#### Arguments

Props object accepts the following fields:

| Name           | Type                                                          | Optional | Description                                                                                                                                     |
| -------------- | ------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | string                                                        |          | name of the file in `contracts` folder (with `.cdc` extension) and name of the contract (please note those should be the same)                  |
| `to`           | [Address](https://docs.onflow.org/fcl/reference/api/#address) | ✅       | (optional) account address, where contract will be deployed. If this is not specified, framework will create new account with randomized alias. |
| `addressMap`   | [AddressMap](./contracts.md#addressmap)                       | ✅       | (optional) object to use for address mapping of existing deployed contracts                                                                     |
| `args`         | [Any]                                                         | ✅       | (optional) arguments, which will be passed to contract initializer. (optional) if template does not expect any arguments.                       |
| `update`       | boolean                                                       | ✅       | (optional) whether to update deployed contract. Default: `false`                                                                                |
| `transformers` | [[CadenceTransformer](./api.md#cadencetransformer)]           | ✅       | an array of operators to modify the code, before submitting it to network                                                                       |

#### Returns

| Type                                                                        | Description                          |
| --------------------------------------------------------------------------- | ------------------------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/reference/api/#responseobject) | Result of the deploying transaction. |

#### Usage

```javascript
import path from "path";
import { init, emulator, deployContractByName } from "@onflow/flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");

  await init(basePath);
  await emulator.start();

  // We will deploy our contract to the address that corresponds to "Alice" alias
  const to = await getAccountAddress("Alice");

  // We assume there is a file on "../cadence/contracts/Wallet.cdc" path
  const name = "Wallet";

  // Arguments will be processed and type matched in the same order as they are specified
  // inside of a contract template
  const args = [1337, "Hello", { name: "Alice" }];

  const [deploymentResult, err] = await deployContractByName({ to, name });
  console.log({ deploymentResult }, { err });
  }

  await emulator.stop();
};

main();
```

In a bit more rare case you would want to deploy contract code not from existing template file, but rather
from string representation of it. `deployContract` method will help you achieve this.

## `deployContract(props)`

Deploys contract code specified as string. Returns the transaction result.

#### Arguments

Props object accepts the following fields:

| Name           | Type                                                          | Optional | Description                                                                                                                          |
| -------------- | ------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `contractCode` | string                                                        |          | string representation of contract                                                                                                    |
| `name`         | string                                                        |          | name of the contract to be deployed. Should be the same as the name of the contract provided in `contractCode`                       |
| `to`           | [Address](https://docs.onflow.org/fcl/reference/api/#address) | ✅       | account address, where contract will be deployed. If this is not specified, framework will create new account with randomized alias. |
| `addressMap`   | [AddressMap](./contracts.md#addressmap)                       | ✅       | object to use for import resolver. Default: `{}`                                                                                     |
| `args`         | [Any]                                                         | ✅       | arguments, which will be passed to contract initializer. Default: `[]`                                                               |
| `update`       | boolean                                                       | ✅       | whether to update deployed contract. Default: `false`                                                                                |
| `transformers` | [[CadenceTransformer](./api.md#cadencetransformer)]           | ✅       | an array of operators to modify the code, before submitting it to network                                                            |

#### Returns

| Type                                                                        | Description                          |
| --------------------------------------------------------------------------- | ------------------------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/reference/api/#responseobject) | Result of the deploying transaction. |

#### Usage

```javascript
import path from "path"
import {
  init,
  emulator,
  getAccountAddress,
  deployContract,
  executeScript,
} from "@onflow/flow-js-testing"
;(async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  await init(basePath)
  await emulator.start()

  // We can specify, which account will hold the contract
  const to = await getAccountAddress("Alice")

  const name = "Wallet"
  const code = `
        pub contract Wallet{
            pub let balance: UInt
            init(balance: UInt){
              self.balance = balance
            }
        }
    `
  const args = [1337]

  await deployContract({to, name, code, args})

  const [balance, err] = await executeScript({
    code: `
      import Wallet from 0x01
      pub fun main(): UInt{
        return Wallet.balance
      }
    `,
  })
  console.log({balance}, {err})

  await emulator.stop()
})()
```

While framework have automatic import resolver for Contracts you might want to know where it's currently deployed.
We provide a method `getContractAddress` for this.

### `getContractAddress(name)`

Returns address of the account where the contract is currently deployed.

#### Arguments

| Name   | Type   | Description          |
| ------ | ------ | -------------------- |
| `name` | string | name of the contract |

#### Returns

| Type                                                          | Description           |
| ------------------------------------------------------------- | --------------------- |
| [Address](https://docs.onflow.org/fcl/reference/api/#address) | `0x` prefixed address |

#### Usage

```javascript
import path from "path"
import {init, emulator, deployContractByName, getContractAddress} from "../src"
;(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()

  // if we omit "to" it will be deployed to Service Account
  // but let's pretend we don't know where it will be deployed :)
  await deployContractByName({name: "Hello"})

  const contractAddress = await getContractAddress("Hello")
  console.log({contractAddress})

  await emulator.stop()
})()
```

📣 Framework does not support contracts with identical names deployed to different accounts. While you can deploy contract
to a new address, the internal system, which tracks where contracts are deployed, will only store last address.
