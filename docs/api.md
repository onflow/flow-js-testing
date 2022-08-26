# JS Testing API Reference

> ⚠️ **Required:** Your project must follow the [required structure](./structure.md) and it must be [initialized](./api.md#init) to use the following functions.

## Accounts

### `getAccountAddress`

Resolves name alias to a Flow address (`0x` prefixed) under the following conditions:

- If an account with a specific name has not been previously accessed, the framework will create a new one and then store it under the provided alias.
- Next time when you call this method, it will grab exactly the same account. This allows you to create several accounts up-front and then use them throughout your code, without worrying that accounts match or trying to store and manage specific addresses.

#### Arguments

| Name    | Type   | Description                       |
| ------- | ------ | --------------------------------- |
| `alias` | string | The alias to reference or create. |

#### Returns

| Type                                                          | Description                              |
| ------------------------------------------------------------- | ---------------------------------------- |
| [Address](https://docs.onflow.org/fcl/reference/api/#address) | `0x` prefixed address of aliased account |

#### Usage

```javascript
import {getAccountAddress} from "@onflow/flow-js-testing"

const main = async () => {
  const Alice = await getAccountAddress("Alice")
  console.log({Alice})
}

main()
```

### `createAccount({name, keys})`

In some cases, you may wish to manually create an account with a particular set of private keys

#### Options

_Pass in the following as a single object with the following keys._

| Key    | Type                                                                 | Required | Description                                                                                                                                                                                            |
| ------ | -------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name` | string                                                               | No       | human-readable name to be associated with created account (will be used for address lookup within [getAccountAddress](./api.md#getaccountaddress))                                                     |
| `keys` | [[KeyObject](./api.md#keyobject) or [PublicKey](./api.md#publickey)] | No       | An array of [KeyObjects](#./api.md#keyobject) or [PublicKeys](./api.md#publickey) to be added to the account upon creation (defaults to the [universal private key](./accounts#universal-private-key)) |

> 📣 if `name` field not provided, the account address will not be cached and you will be unable to look it up using [`getAccountAddress`](./api.md#getaccountaddress).

#### Returns

| Type                                                          | Description                              |
| ------------------------------------------------------------- | ---------------------------------------- |
| [Address](https://docs.onflow.org/fcl/reference/api/#address) | `0x` prefixed address of created account |

## Contracts

### `deployContractByName(props)`

Deploys contract code located inside a Cadence file. Returns the transaction result.

#### Arguments

Props object accepts the following fields:

| Name           | Type                                                          | Optional | Description                                                                                                                                     |
| -------------- | ------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | string                                                        |          | name of the file in `contracts` folder (with `.cdc` extension) and name of the contract (please note those should be the same)                  |
| `to`           | [Address](https://docs.onflow.org/fcl/reference/api/#address) | ✅       | (optional) account address, where contract will be deployed. If this is not specified, framework will create new account with randomized alias. |
| `addressMap`   | [AddressMap](./api.md#addressmap)                             | ✅       | (optional) object to use for address mapping of existing deployed contracts                                                                     |
| `args`         | [Any]                                                         | ✅       | (optional) arguments, which will be passed to contract initializer. (optional) if template does not expect any arguments.                       |
| `update`       | boolean                                                       | ✅       | (optional) whether to update deployed contract. Default: `false`                                                                                |
| `transformers` | [[CadenceTransformer](./api.md#cadencetransformer)]           | ✅       | (optional) an array of operators to modify the code, before submitting it to network                                                            |

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

### `deployContract(props)`

Deploys contract code specified as string. Returns the transaction result.

#### Arguments

Props object accepts the following fields:

| Name           | Type                                                          | Optional | Description                                                                                                                          |
| -------------- | ------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `contractCode` | string                                                        |          | string representation of contract                                                                                                    |
| `name`         | string                                                        |          | name of the contract to be deployed. Should be the same as the name of the contract provided in `contractCode`                       |
| `to`           | [Address](https://docs.onflow.org/fcl/reference/api/#address) | ✅       | account address, where contract will be deployed. If this is not specified, framework will create new account with randomized alias. |
| `addressMap`   | [AddressMap](./api.md#addressmap)                             | ✅       | object to use for import resolver. Default: `{}`                                                                                     |
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

## Cryptography

### `pubFlowKey(keyObject)`

The `pubFlowKey` method exported by Flow JS Testing Library will generate an RLP-encoded public key given a private key, hashing algorithm, signing algorithm, and key weight.

| Name        | Type                            | Optional | Description                                                                |
| ----------- | ------------------------------- | -------- | -------------------------------------------------------------------------- |
| `keyObject` | [KeyObject](./api.md#keyobject) | ✅       | an object containing a private key & the key's hashing/signing information |

If `keyObject` is not provided, Flow JS Testing will default to the [universal private key](./accounts.md#universal-private-key).

#### Returns

| Type   | Description            |
| ------ | ---------------------- |
| Buffer | RLP-encoded public key |

#### Usage

```javascript
import {pubFlowKey}

const key = {
  privateKey: "a1b2c3" // private key as hex string
  hashAlgorithm: HashAlgorithm.SHA3_256
  signatureAlgorithm: SignatureAlgorithm.ECDSA_P256
  weight: 1000
}

const pubKey = await pubFlowKey(key) // public key generated from keyObject provided
const genericPubKey = await pubFlowKey() // public key generated from universal private key/service key
```

### `signUserMessage(msgHex, signer, domainTag)`

The `signUserMessage` method will produce a user signature of some arbitrary data using a particular signer.

#### Arguments

| Name        | Type                                                                                                     | Optional | Description                                                                                                                                                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `msgHex`    | string or Buffer                                                                                         |          | a hex-encoded string or Buffer which will be used to generate the signature                                                                                                                                                              |
| `signer`    | [Address](https://docs.onflow.org/fcl/reference/api/#address) or [SignerInfo](./api.md#signerinfoobject) | ✅       | [Address](https://docs.onflow.org/fcl/reference/api/#address) or [SignerInfo](./api.md#signerinfoobject) object representing user to generate this signature for (default: [universal private key](./accounts.md#universal-private-key)) |
| `domainTag` | string                                                                                                   | ✅       | Domain separation tag provided as a utf-8 encoded string (default: no domain separation tag). See more about [domain tags here](https://docs.onflow.org/cadence/language/crypto/#hashing-with-a-domain-tag).                             |

#### Returns

| Type                                        | Description                                                                                        |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [SignatureObject](./api.md#signatureobject) | An object representing the signature for the message & account/keyId which signed for this message |

#### Usage

```javascript
import {signUserMessage, getAccountAddress} from "@onflow/flow-js-testing"

const Alice = await getAccountAddress("Alice")
const msgHex = "a1b2c3"

const signature = await generateUserSignature(msgHex, Alice)
```

## `verifyUserSigntatures(msgHex, signatures, domainTag)`

Used to verify signatures generated by [`signUserMessage`](./api.md#signusermessagemessage-signer). This function takes an array of signatures and verifies that the total key weight sums to >= 1000 and that these signatures are valid.

#### Arguments

| Name         | Type                                          | Optional | Description                                                                                                                                                                                                  |
| ------------ | --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `msgHex`     | string                                        |          | the message which the provided signatures correspond to provided as a hex-encoded string or Buffer                                                                                                           |
| `signatures` | [[SignatureObject](./api.md#signatureobject)] |          | An array of [SignatureObjects](./api.md#signatureobject) which will be verified against this message                                                                                                         |
| `domainTag`  | string                                        | ✅       | Domain separation tag provided as a utf-8 encoded string (default: no domain separation tag). See more about [domain tags here](https://docs.onflow.org/cadence/language/crypto/#hashing-with-a-domain-tag). |

#### Returns

This method returns an object with the following keys:
| Type | Description |
| ---- | ----------- |
| boolean | Returns true if signatures are valid and total weight >= 1000 |

#### Usage

```javascript
import {
  signUserMessage,
  verifyUserSignatures,
  getAccountAddress,
} from "@onflow/flow-js-testing"

const Alice = await getAccountAddress("Alice")
const msgHex = "a1b2c3"

const signature = await generateUserSignature(msgHex, Alice)

console.log(await verifyUserSignatures(msgHex, Alice)) // true

const Bob = await getAccountAddress("Bob")
console.log(await verifyUserSignatures(msgHex, Bob)) // false
```

## Emulator

Flow Javascript Testing Framework exposes `emulator` singleton allowing you to run and stop emulator instance
programmatically. There are two methods available on it.

### `emulator.start(options)`

Starts emulator on a specified port. Returns Promise.

#### Arguments

| Name      | Type            | Optional | Description                                            |
| --------- | --------------- | -------- | ------------------------------------------------------ |
| `options` | EmulatorOptions | ✅       | an object containing options for starting the emulator |

#### EmulatorOptions

| Key         | Type    | Optional | Description                                                                       |
| ----------- | ------- | -------- | --------------------------------------------------------------------------------- |
| `logging`   | boolean | ✅       | whether log messages from emulator shall be added to the output (default: false)  |
| `flags`     | string  | ✅       | custom command-line flags to supply to the emulator (default: no flags)           |
| `adminPort` | number  | ✅       | override the port which the emulator will run the admin server on (default: auto) |
| `restPort`  | number  | ✅       | override the port which the emulator will run the REST server on (default: auto)  |
| `grpcPort`  | number  | ✅       | override the port which the emulator will run the GRPC server on (default: auto)  |

#### Returns

| Type                        | Description                                                      |
| --------------------------- | ---------------------------------------------------------------- |
| [Promise](./api.md#Promise) | Promise, which resolves to true if emulator started successfully |

#### Usage

```javascript
import path from "path"
import {emulator, init} from "../src"
;(async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  await init(basePath)

  // Start emulator instance on port 8080
  await emulator.start()
  console.log("emulator is working")

  // Stop running emulator
  await emulator.stop()
  console.log("emulator has been stopped")
})()
```

### `emulator.stop()`

Stops emulator instance. Returns Promise.

#### Arguments

This method does not expect any arguments.

#### Returns

| Type                        | Description                                                        |
| --------------------------- | ------------------------------------------------------------------ |
| [Promise](./api.md#Promise) | Promise, which resolves to true if emulator stopped without issues |

#### Usage

```javascript
import {emulator, init} from "@onflow/flow-js-testing"

describe("test setup", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence")

    await init(basePath)
    await emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    await emulator.stop()
  })
})
```

### `emulator.setLogging(newState)`

Set logging flag on emulator, allowing to temporally enable/disable logging.

#### Arguments

| Name       | Type    | Description            |
| ---------- | ------- | ---------------------- |
| `newState` | boolean | Enable/disable logging |

#### Returns

Method does not return anything.

#### Usage

```javascript
import path from "path"
import {emulator, init} from "@onflow/flow-js-testing"

describe("test setup", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence")

    await init(basePath)
    await emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    await emulator.stop()
  })

  test("basic test", async () => {
    // Turn on logging from begining
    emulator.setLogging(true)
    // some asserts and interactions

    // Turn off logging for later calls
    emulator.setLogging(false)
    // more asserts and interactions here
  })
})
```

## FLOW Management

Some actions on the network will require account to have certain amount of FLOW token - transaction and storage fees,
account creation, etc.

Framework provides a method to query balance with `getFlowBalance` and mint new tokens via `mintFlow`. You can find
information how to use them below.

### `getFlowBalance(address)`

Fetch current FlowToken balance of account specified by address

#### Arguments

| Name      | Type                                                          | Description                     |
| --------- | ------------------------------------------------------------- | ------------------------------- |
| `address` | [Address](https://docs.onflow.org/fcl/reference/api/#address) | address of the account to check |

#### Returns

| Type   | Description                                                                  |
| ------ | ---------------------------------------------------------------------------- |
| string | UFix64 amount of FLOW tokens stored in account storage represented as string |

#### Usage

```javascript
import {
  init,
  emulator,
  getAccountAddress,
  getFlowBalance,
} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  await init(basePath)
  await emulator.start()

  const Alice = await getAccountAddress("Alice")

  const [result, error] = await getFlowBalance(Alice)
  console.log({result}, {error})

  await emulator.stop()
}

main()
```

### `mintFlow(recipient, amount)`

Sends transaction to mint specified amount of FLOW token and send it to recipient.

> ⚠️ **Required:** Framework shall be initialized with `init` method for this method to work.

#### Arguments

| Name        | Type                                                          | Description                                                |
| ----------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| `recipient` | [Address](https://docs.onflow.org/fcl/reference/api/#address) | address of the account to check                            |
| `amount`    | string                                                        | UFix64 amount of FLOW tokens to mint and send to recipient |

#### Returns

| Type                                                                        | Description        |
| --------------------------------------------------------------------------- | ------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/reference/api/#responseobject) | Transaction result |

#### Usage

```javascript
import path from "path"
import {
  init,
  emulator,
  getAccountAddress,
  getFlowBalance,
  mintFlow,
} from "../src"
;(async () => {
  const basePath = path.resolve(__dirname, "./cadence")

  await init(basePath)
  await emulator.start()

  // Get address for account with alias "Alice"
  const Alice = await getAccountAddress("Alice")

  // Get initial balance
  const [initialBalance] = await getFlowBalance(Alice)
  console.log(initialBalance)

  // Add 1.0 FLOW tokens to Alice account
  await mintFlow(Alice, "1.0")

  // Check updated balance
  const updatedBalance = await getFlowBalance(Alice)
  console.log({updatedBalance})

  await emulator.stop()
})()
```

## Init

For Framework to operate properly you need to initialize it first.
You can do it with provided `init` method.

### init( basePath, options)

Initializes framework variables.

#### Arguments

| Name       | Type   | Optional | Description                                           |
| ---------- | ------ | -------- | ----------------------------------------------------- |
| `bastPath` | string |          | path to the folder holding all Cadence template files |
| `options`  | object | ✅       | options object to use during initialization           |

#### Options

| Name   | Type | Optional | Description                     |
| ------ | ---- | -------- | ------------------------------- |
| `pkey` |      | ✅       | private key for service account |

#### Returns

| Type                        | Description                                                           |
| --------------------------- | --------------------------------------------------------------------- |
| [Promise](./api.md#Promise) | Promise, which resolves to true if framework was initialized properly |

#### Usage

```javascript
import path from "path"
import {init} from "@onflow/flow-js-testing"

describe("test setup", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence")
    await init(basePath)

    // alternatively you can pass specific port
    // await init(basePath, {port: 8085})
  })
})
```

## Environment

### `getBlockOffset()`

Returns current block offset - amount of blocks added on top of real current block height.

#### Returns

| Type   | Description                                                                                 |
| ------ | ------------------------------------------------------------------------------------------- |
| string | number representing amount of blocks added on top of real current block (encoded as string) |

#### Usage

```javascript
import path from "path"
import {init, emulator, getBlockOffset} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  init(basePath)
  await emulator.start()

  const [blockOffset, err] = await getBlockOffset()
  console.log({blockOffset}, {err})

  await emulator.stop()
}

main()
```

### `setBlockOffset(offset)`

Returns current block offset - amount of blocks added on top of real current block height.

#### Arguments

| Name | Type | Description |
| ---- | ---- | ----------- |

#### Returns

| Type   | Description                                                                    |
| ------ | ------------------------------------------------------------------------------ |
| number | number representing amount of blocks added on top of real current block height |

#### Usage

```javascript
import path from "path"
import {
  init,
  emulator,
  executeScript,
  getBlockOffset,
  setBlockOffset,
  sendTransaction,
} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  init(basePath)
  await emulator.start()

  // Offset current block height by 42
  await setBlockOffset(42)

  const [blockOffset, err] = await getBlockOffset()
  console.log({blockOffset}, {err})

  // "getCurrentBlock().height" in your Cadence code will be replaced by Manager to a mocked value
  const code = `
    pub fun main(): UInt64 {
      return getCurrentBlock().height
    }
  `

  const [result, error] = await executeScript({code})
  console.log({result}, {error})

  await emulator.stop()
}

main()
```

### `getTimestampOffset()`

Returns current timestamp offset - amount of seconds added on top of real current timestamp.

#### Returns

| Type   | Description                                                                  |
| ------ | ---------------------------------------------------------------------------- |
| number | number representing amount of seconds added on top of real current timestamp |

#### Usage

```javascript
import path from "path"
import {init, emulator, getTimestampOffset} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  init(basePath)
  await emulator.start()

  const [timestampOffset, err] = await getTimestampOffset()
  console.log({timestampOffset}, {err})

  await emulator.stop()
}

main()
```

### `setTimestampOffset(offset)`

Returns current timestamp offset - amount of seconds added on top of real current timestamp.

#### Arguments

| Name | Type | Description |
| ---- | ---- | ----------- |

#### Returns

| Type   | Description                                                                  |
| ------ | ---------------------------------------------------------------------------- |
| number | number representing amount of seconds added on top of real current timestamp |

#### Usage

```javascript
import path from "path"
import {
  init,
  emulator,
  executeScript,
  getTimestampOffset,
  setTimestampOffset,
  sendTransaction,
} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  init(basePath)
  await emulator.start()

  // Offset current timestamp by 10s
  await setTimestampOffset(10)

  const [timestampOffset, err] = await getTimestampOffset()
  console.log({timestampOffset}, {err})

  // "getCurrentBlock().timestamp" in your Cadence code will be replaced by Manager to a mocked value
  const code = `
    pub fun main(): UInt64 {
      return getCurrentBlock().timestamp
    }
  `

  const [result, error] = await executeScript({code})
  console.log({result}, {error})

  await emulator.stop()
}

main()
```

## Jest Helpers

In order to simplify the process even further we've created several Jest-based methods, which will help you to catch
thrown errors and ensure your code works as intended.

### `shallPass(ix)`

Ensure transaction does not throw and sealed.

#### Arguments

| Name | Type                                | Description                                          |
| ---- | ----------------------------------- | ---------------------------------------------------- |
| `ix` | [Interaction](./api.md#interaction) | interaction, either in form of a Promise or function |

#### Returns

| Type                                                                        | Description        |
| --------------------------------------------------------------------------- | ------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/reference/api/#responseobject) | Transaction result |

#### Usage

```javascript
import path from "path"
import {
  init,
  emulator,
  shallPass,
  sendTransaction,
  getAccountAddress,
} from "js-testing-framework"

// We need to set timeout for a higher number, cause some interactions might need more time
jest.setTimeout(10000)

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence")
    await init(basePath)
    return emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop()
  })

  test("basic transaction", async () => {
    const code = `
      transaction(message: String){
        prepare(singer: AuthAccount){
          log(message)
        }
      }
    `
    const Alice = await getAccountAddress("Alice")
    const signers = [Alice]
    const args = ["Hello, Cadence"]

    const [txResult, error] = await shallPass(
      sendTransaction({
        code,
        signers,
        args,
      })
    )

    // Transaction result will hold status, events and error message
    console.log({txResult}, {error})
  })
})
```

### shallRevert(ix, message)

Ensure interaction throws an error. Can test for specific error messages or catch any error message if `message` is not provided.
Returns Promise, which contains result, when resolved.

#### Arguments

| Name                     | Type                                | Description                                                                                                              |
| ------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `ix`                     | [Interaction](./api.md#interaction) | transaction, either in form of a Promise or function                                                                     |
| `message` **(optional)** | `string` or `RegExp`                | expected error message provided as either a string equality or regular expression to match, matches any error by default |

#### Returns

| Type                                                                        | Description        |
| --------------------------------------------------------------------------- | ------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/reference/api/#responseobject) | Transaction result |

#### Usage

```javascript
import path from "path"
import {
  init,
  emulator,
  shallPass,
  sendTransaction,
  getAccountAddress,
} from "js-testing-framework"

// We need to set timeout for a higher number, cause some interactions might need more time
jest.setTimeout(10000)

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence")
    await init(basePath)
    return emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop()
  })

  test("basic transaction", async () => {
    const code = `
      transaction(message: String){
        prepare(singer: AuthAccount){
          panic("You shall not pass!")
        }
      }
    `
    const Alice = await getAccountAddress("Alice")
    const signers = [Alice]
    const args = ["Hello, Cadence"]

    // Catch any cadence error
    let [txResult, error] = await shallRevert(
      sendTransaction({
        code,
        signers,
        args,
      })
    )

    // Catch only specific panic message
    let [txResult, error] = await shallRevert(
      sendTransaction({
        code,
        signers,
        args,
      }),
      "You shall not pass!"
    )

    // Transaction result will hold status, events and error message
    console.log({txResult}, {error})
  })
})
```

### shallResolve(ix)

Ensure interaction resolves without throwing errors.

#### Arguments

| Name | Type                                | Description                                          |
| ---- | ----------------------------------- | ---------------------------------------------------- |
| `ix` | [Interaction](./api.md#interaction) | interaction, either in form of a Promise or function |

#### Returns

| Type                                            | Description        |
| ----------------------------------------------- | ------------------ |
| [InteractionResult](./api.md#InteractionResult) | Interaction result |

#### Usage

```javascript
import path from "path"
import {init, emulator, shallPass, executeScript} from "js-testing-framework"

// We need to set timeout for a higher number, cause some interactions might need more time
jest.setTimeout(10000)

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence")
    await init(basePath)
    return emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop()
  })

  test("basic script", async () => {
    const code = `
      pub fun main():Int{
        return 42
      }
    `

    const [result, error] = await shallResolve(
      executeScript({
        code,
      })
    )

    expect(result).toBe(42)
    expect(error).toBe(null)
  })
})
```

## Scripts

It is often the case that you need to query current state of the network. For example, to check balance of the
account, read public value of the contract or ensure that user has specific resource in their storage.

We abstract this interaction into single method called `executeScript`. Method have 2 different signatures.

> ⚠️ **Required:** Your project must follow the [required structure](./structure.md) it must be [initialized](./init.md) to use the following functions.

### `executeScript(props)`

Provides explicit control over how you pass values.

#### Arguments

`props` object accepts following fields:

| Name           | Type                                                | Optional | Description                                                                                |
| -------------- | --------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `code`         | string                                              | ✅       | string representation of Cadence script                                                    |
| `name`         | string                                              | ✅       | name of the file in `scripts` folder to use (sans `.cdc` extension)                        |
| `args`         | [any]                                               | ✅       | an array of arguments to pass to script. Optional if script does not expect any arguments. |
| `transformers` | [[CadenceTransformer](./api.md#cadencetransformer)] | ✅       | an array of operators to modify the code, before submitting it to network                  |

> ⚠️ **Required:** Either `code` or `name` field shall be specified. Method will throw an error if both of them are empty.
> If `name` field provided, framework will source code from file and override value passed via `code` field.

#### Returns

| Type                                                                        | Description   |
| --------------------------------------------------------------------------- | ------------- |
| [ResponseObject](https://docs.onflow.org/fcl/reference/api/#responseobject) | Script result |

#### Usage

```javascript
import path from "path"
import {init, emulator, executeScript} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  // Init framework
  init(basePath)
  // Start emulator
  await emulator.start()

  // Define code and arguments we want to pass
  const code = `
    pub fun main(message: String): Int{
      log(message)

      return 42
    }
  `
  const args = ["Hello, from Cadence"]

  const [result, error, logs] = await executeScript({code, args})
  console.log({result}, {error}, {logs})

  // Stop emulator instance
  await emulator.stop()
}

main()
```

### `executeScript(name: string, args: [any])`

This signature provides simplified way of executing a script, since most of the time you will utilize existing
Cadence files.

#### Arguments

| Name   | Type   | Optional | Description                                                                                            |
| ------ | ------ | -------- | ------------------------------------------------------------------------------------------------------ |
| `name` | string |          | name of the file in `scripts` folder to use (sans `.cdc` extension)                                    |
| `args` | [any]  | ✅       | an array of arguments to pass to script. Optional if scripts don't expect any arguments. Default: `[]` |

#### Returns

| Type                                                                        | Description   |
| --------------------------------------------------------------------------- | ------------- |
| [ResponseObject](https://docs.onflow.org/fcl/reference/api/#responseobject) | Script result |

#### Usage

```javascript
import path from "path"
import {init, emulator, executeScript} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  // Init framework
  init(basePath)
  // Start emulator
  await emulator.start()

  // Define arguments we want to pass
  const args = ["Hello, from Cadence"]

  // We assume there is a file `scripts/log-message.cdc` under base path
  const [result, error, logs] = await executeScript("log-message", args)
  console.log({result}, {error}, {logs})

  await emulator.stop()
}

main()
```

## Transactions

Another common case is interactions that mutate network state - sending tokens from one account to another, minting new NFT, etc. Framework provides `sendTransaction` method to achieve this. This method have 2 different signatures.

> ⚠️ **Required:** Your project must follow the [required structure](./structure.md) it must be [initialized](./init.md) to use the following functions.

### `sendTransaction(props)`

Send transaction to network.
Provides explicit control over how you pass values.

#### Arguments

`props` object accepts following fields:

| Name           | Type                                                                                                       | Optional | Description                                                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `code`         | string                                                                                                     | ✅       | string representation of Cadence transaction                                                                                                                     |
| `name`         | string                                                                                                     | ✅       | name of the file in `transaction` folder to use (sans `.cdc` extension)                                                                                          |
| `args`         | [any]                                                                                                      | ✅       | an array of arguments to pass to transaction. Optional if transaction does not expect any arguments.                                                             |
| `signers`      | [[Address](https://docs.onflow.org/fcl/reference/api/#address) or [SignerInfo](./api.md#signerinfoobject)] | ✅       | an array of [Address](https://docs.onflow.org/fcl/reference/api/#address) or [SignerInfo](./api.md#signerinfoobject) objects representing transaction autorizers |
| `addressMap`   | [AddressMap](./api.md#addressmap)                                                                          | ✅       | name/address map to use as lookup table for addresses in import statements                                                                                       |
| `transformers` | [[CadenceTransformer](./#cadencetransformer)]                                                              | ✅       | an array of operators to modify the code, before submitting it to network                                                                                        |

> ⚠️ **Required:** Either `code` or `name` field shall be specified. Method will throw an error if both of them are empty.
> If `name` field provided, framework will source code from file and override value passed via `code` field.

> 📣 if `signers` field not provided, service account will be used to authorize the transaction.

> 📣 Pass `addressMap` only in cases, when you would want to override deployed contract. Otherwide
> imports can be resolved automatically without explicitly passing them via `addressMap` field

#### Usage

```javascript
import path from "path"
import {
  init,
  emulator,
  sendTransaction,
  getAccountAddress,
} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  // Init framework
  await init(basePath)
  // Start emulator
  await emulator.start()

  // Define code and arguments we want to pass
  const code = `
    transaction(message: String){
      prepare(signer: AuthAccount){
        log(message)
      }
    }
  `
  const args = ["Hello, from Cadence"]
  const Alice = await getAccountAddress("Alice")
  const signers = [Alice]

  const [result, error, logs] = await sendTransaction({code, args, signers})
  console.log({result}, {error}, {logs})

  // Stop emulator instance
  await emulator.stop()
}

main()
```

### `sendTransaction(name, signers, args)`

This signature provides simplified way to send a transaction, since most of the time you will utilize existing
Cadence files.

| Name      | Type                                                                                                             | Optional | Description                                                                                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | string                                                                                                           | ✅       | name of the file in `transaction` folder to use (sans `.cdc` extension)                                                                                                 |
| `args`    | [any]                                                                                                            | ✅       | an array of arguments to pass to transaction. Optional if transaction does not expect any arguments.                                                                    |
| `signers` | [[Address](https://docs.onflow.org/fcl/reference/api/#address) or [SignerInfoObject](./api.md#signerinfoobject)] | ✅       | an array of [Address](https://docs.onflow.org/fcl/reference/api/#address) or array of [SignerInfoObject](./api.md#signerinfoobject) representing transaction autorizers |

#### Usage

```javascript
import path from "path"
import {
  init,
  emulator,
  sendTransaction,
  shallPass,
} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  // Init framework
  await init(basePath)
  // Start emulator
  await emulator.start()

  // Define arguments we want to pass
  const args = ["Hello, Cadence"]

  const [result, error, logs] = await shallPass(
    sendTransaction("log-message", [], args)
  )
  console.log({result}, {error}, {logs})

  // Stop the emulator instance
  await emulator.stop()
}

main()
```

## Templates

The philosophy behind Flow JS Testing Framework is to be a set of helper methods. They can be used in
opinionated way, envisioned by Flow Team. Or they can work as building blocks, allowing developers to build their own
testing solution as they see fit.

Following methods used inside other framework methods, but we feel encouraged to list them here as well.

### `getTemplate(file, addressMap, byAddress)`

Returns Cadence template as string with addresses replaced using addressMap

| Name         | Type                              | Optional | Description                                                                                               |
| ------------ | --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `file`       | string                            |          | relative (to the place from where the script was called) or absolute path to the file containing the code |
| `addressMap` | [AddressMap](./api.md#addressmap) | ✅       | object to use for address mapping of existing deployed contracts. Default: `{}`                           |
| `byAddress`  | boolean                           | ✅       | whether addressMap is `{name:address}` or `{address:address}` type. Default: `false`                      |

#### Returns

| Type   | Description                 |
| ------ | --------------------------- |
| string | content of a specified file |

#### Usage

```javascript
import path from "path"
import {init, getTemplate} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")
  await init(basePath)

  const template = await getTemplate("../cadence/scripts/get-name.cdc")
  console.log({template})
}

main()
```

### `getContractCode(name, addressMap)`

Returns Cadence template from file with `name` in `_basepath_/contracts` folder

#### Arguments

| Name         | Type                              | Optional | Description                                                      |
| ------------ | --------------------------------- | -------- | ---------------------------------------------------------------- |
| `name`       | string                            |          | name of the contract template                                    |
| `addressMap` | [AddressMap](./api.md#addressmap) | ✅       | object to use for address mapping of existing deployed contracts |

#### Returns

| Type   | Description                                  |
| ------ | -------------------------------------------- |
| string | Cadence template code for specified contract |

#### Usage

```javascript
import path from "path"
import {init, emulator, getContractCode} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  await init(basePath)
  await emulator.start()

  // Let's assume we need to import MessageContract
  await deployContractByName({name: "MessageContract"})
  const [MessageContract] = await getContractAddress("MessageContract")
  const addressMap = {MessageContract}

  const contractTemplate = await getContractCode("HelloWorld", {
    MessageContract,
  })
  console.log({contractTemplate})

  await emulator.stop()
}

main()
```

### `getTransactionCode(name, addressMap)`

Returns Cadence template from file with `name` in `_basepath_/transactions` folder

#### Arguments

| Name         | Type                              | Optional | Description                                                      |
| ------------ | --------------------------------- | -------- | ---------------------------------------------------------------- |
| `name`       | string                            |          | name of the transaction template                                 |
| `addressMap` | [AddressMap](./api.md#addressmap) | ✅       | object to use for address mapping of existing deployed contracts |

#### Returns

| Type   | Description                                     |
| ------ | ----------------------------------------------- |
| string | Cadence template code for specified transaction |

#### Usage

```javascript
import path from "path"
import {init, emulator, getTransactionCode} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  await init(basePath)
  await emulator.start()

  // Let's assume we need to import MessageContract
  await deployContractByName({name: "MessageContract"})
  const [MessageContract] = await getContractAddress("MessageContract")
  const addressMap = {MessageContract}

  const txTemplate = await getTransactionCode({
    name: "set-message",
    addressMap,
  })
  console.log({txTemplate})

  await emulator.stop()
}

main()
```

### `getScriptCode(name, addressMap)`

Returns Cadence template from file with `name` in `_basepath_/scripts` folder

#### Arguments

| Name         | Type                              | Optional | Description                                                      |
| ------------ | --------------------------------- | -------- | ---------------------------------------------------------------- |
| `name`       | string                            |          | name of the script template                                      |
| `addressMap` | [AddressMap](./api.md#addressmap) | ✅       | object to use for address mapping of existing deployed contracts |

#### Returns

| Type   | Description                                |
| ------ | ------------------------------------------ |
| string | Cadence template code for specified script |

#### Usage

```javascript
import path from "path"
import {init, emulator, getScriptCode} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  await init(basePath)
  await emulator.start()

  // Let's assume we need to import MessageContract
  await deployContractByName({name: "MessageContract"})
  const [MessageContract] = await getContractAddress("MessageContract")
  const addressMap = {MessageContract}

  const scriptTemplate = await getScriptCode({
    name: "get-message",
    addressMap,
  })

  console.log({scriptTemplate})
  await emulator.stop()
}

main()
```

## Types

### `AddressMap`

Object to use for address mapping of existing deployed contracts. Key shall be `string` and value shall be [Address](https://docs.onflow.org/fcl/reference/api/#address)

#### Example

```javascript
const addressMap = {
  Messanger: "0x01cf0e2f2f715450",
  Logger: "0x179b6b1cb6755e31",
}
```

### `Interaction`

Interaction is a Promise or function returning a promise.

#### Example

```javascript
const ix = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1337)
    })
  }, 500)
}
```

### `CadenceTransformer`

Function, which will get valid Cadence code, modify it and return valid Cadence code

#### Example

This transformer will look for occupancies of specific import statement and replace it with proper address, where it's deployed on Emulator

```javascript
const replaceAddress = async code => {
  const modified = code.replace(
    /import\s+FungibleToken\s+from\s+0xFUNGIBLETOKEN/,
    "import FungibleToken from 0xee82856bf20e2aa6"
  )

  return modified
}
```

### KeyObject

Key objects are used to specify signer keys when [creating accounts](./accounts.md).

| Key                  | Required | Value Type                                        | Description                                                                                                                 |
| -------------------- | -------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `hashAlgorithm`      | No       | [HashAlgorithm](./api.md#hashalgorithm)           | Hashing algorithm to use for generating signatures to be signed by this key (default: `HashAlgorithm.SHA3_256`)             |
| `privateKey`         | Yes      | string                                            | Private key to use to generate the signature                                                                                |
| `signatureAlgorithm` | No       | [SignatureAlgorithm](./api.md#signaturealgorithm) | Signing algorithm used to sign transactions with this key (default: `SignatureAlgorithm.ECDSA_P256`)                        |
| `weight`             | No       | number                                            | Weight of the key - see [Flow Core Concepts](https://docs.onflow.org/concepts/accounts-and-keys/#keys) for more information |

### PublicKey

Public keys are stored as `Buffer` objects which have been RLP encoded according to the [Flow spec](https://docs.onflow.org/concepts/accounts-and-keys/).

In order to generate this object using the Flow JS Testing library, use the [`pubFlowKey` method](./api.md#pubflowkeykeyobject) exported by the library.

```javascript
import {pubFlowKey} from "@onflow/flow-js-testing"

const pubKey = await pubFlowKey({
  privateKey: ...,
  hashAlgorithm: ...,
  signatureAlgorithm: ...,
  weight: ...
})
```

### SignatureObject

Signature objects are used to represent a signature for a particular message as well as the account and keyId which signed for this message.

| Key         | Value Type                                                    | Description                                                                                                                                                      |
| ----------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addr`      | [Address](https://docs.onflow.org/fcl/reference/api/#address) | the address of the account which this signature has been generated for                                                                                           |
| `keyId`     | number                                                        | [Address](https://docs.onflow.org/fcl/reference/api/#address) or [SignerInfo](./api.md#signerinfoobject) object representing user to generate this signature for |
| `signature` | string                                                        | a hexidecimal-encoded string representation of the generated signature                                                                                           |

### SignerInfoObject

Signer Info objects are used to specify information about which signer and which key from this signer shall be used to [sign a transaction](./send-transactions.md).

| Key                  | Required | Value Type                                                    | Description                                                                                                                                                                                        |
| -------------------- | -------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addr`               | Yes      | [Address](https://docs.onflow.org/fcl/reference/api/#address) | The address of the signer's account                                                                                                                                                                |
| `hashAlgorithm`      | No       | [HashAlgorithm](./api.md#hashalgorithm)                       | Hashing algorithm to use for generating the signature (default: `HashAlgorithm.SHA3_256`)                                                                                                          |
| `keyId`              | No       | number                                                        | The index of the desired key to use from the signer's account (default: `0`)                                                                                                                       |
| `privateKey`         | No       | string                                                        | Private key to use to generate the signature (default: service account private key - this is the default PK for all accounts generated by Flow JS Testing Library, see: [accounts](./accounts.md)) |
| `signatureAlgorithm` | No       | [SignatureAlgorithm](./api.md#signaturealgorithm)             | Signing algorithm used to generate the signature (default: `SignatureAlgorithm.ECDSA_P256`)                                                                                                        |

### HashAlgorithm

| Identifier | Value |
| ---------- | ----- |
| SHA2_256   | 1     |
| SHA3_256   | 3     |

Hash algorithms may be provided as either an enum (accessible via the `HashAlgorithm` object exported by Flow JS Testing, i.e. `HashAlgorithm.SHA3_256`) or as a string representation of their enum identifier (i.e. `"SHA3_256"`)

### SignatureAlgorithm

| Identifier      | Value |
| --------------- | ----- |
| ECDSA_P256      | 2     |
| ECDSA_secp256k1 | 3     |

Signing algorithms may be provided as either an enum (accessible via the `SignatureAlgorithm` object exported by Flow JS Testing, i.e. `SignatureAlgorithm.ECDSA_P256`) or as a string representation of their enum identifier (i.e. `"ECDSA_P256"`)

## Utilities

### `isAddress(address)`

Returns true if the given string is a validly formatted account [address](https://docs.onflow.org/fcl/reference/api/#address) (both "0x" prefixed and non-prefixed are valid)

#### Arguments

| Name      | Type   | Optional | Description                      |
| --------- | ------ | -------- | -------------------------------- |
| `address` | string |          | string to test against the regex |

#### Returns

| Type    | Description                                                                                                                |
| ------- | -------------------------------------------------------------------------------------------------------------------------- |
| boolean | Returns true if given string is a validly formatted account [address](https://docs.onflow.org/fcl/reference/api/#address). |

#### Usage

```javascript
import {isAddress} from "@onflow/flow-js-testing"

const badAddr = "0xqrtyff"
console.log(isAddress(badAddr)) // false

const goodAddrWithPrefix = "0xf8d6e0586b0a20c1"
console.log(isAddress(goodAddrWithPrefix)) // true

const goodAddrSansPrefix = "f8d6e0586b0a20c1"
console.log(isAddress(goodAddrSansPrefix)) // true
```
