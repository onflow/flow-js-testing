# JS Testing API Reference

> ⚠️ **Required:** Your project must follow the [required structure](#structure) and it must be [initialized](#init) to use the following functions.

## Accounts

### `getAccountAddress`

Resolves name alias to a Flow address (`0x` prefixed) under the following conditions:

- If account with specific name has not been previously accessed framework will first create a new one and then store it under provided alias.
- Next time when you call this method, it will grab exactly the same account. This allows you to create several accounts first and then use them throughout your code, without worrying that accounts match or trying to store/handle specific addresses.

#### Arguments

| Name    | Type   | Description                       |
| ------- | ------ | --------------------------------- |
| `alias` | string | The alias to reference or create. |

#### Returns

| Type                                                | Description                              |
| --------------------------------------------------- | ---------------------------------------- |
| [Address](https://docs.onflow.org/fcl/api/#address) | `0x` prefixed address of aliased account |

#### Usage

```javascript
import path from "path"
import { init, emulator, getAccountAddress } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  const Alice = await getAccountAddress("Alice");
  console.log({ Alice });
};

main();
```

## Contracts

### `deployContractByName(props)`

Deploys contract code located inside a Cadence file. Returns the transaction result.\

#### Arguments

Props object accepts following fields:

| Name         | Type                                                | Optional | Description                                                                                                                                     |
| ------------ | --------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`       | string                                              |          | name of the file in `contracts` folder (with `.cdc` extension) and name of the contract (please note those should be the same)                  |
| `to`         | [Address](https://docs.onflow.org/fcl/api/#address) | ✅       | (optional) account address, where contract will be deployed. If this is not specified, framework will create new account with randomized alias. |
| `addressMap` | [AddressMap](#AddressMap)                           | ✅       | (optional) object to use for address mapping of existing deployed contracts                                                                     |
| `args`       | [Any]                                               | ✅       | (optional) arguments, which will be passed to contract initializer. (optional) if template does not expect any arguments.                       |
| `update`     | boolean                                             | ✅       | (optional) whether to update deployed contract. Default: `false`                                                                                |

#### Returns

| Type                                                              | Description                          |
| ----------------------------------------------------------------- | ------------------------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/api/#responseobject) | Result of the deploying transaction. |

#### Usage

```javascript
import path from "path";
import { init, emulator, deployContractByName } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, {port});
  await emulator.start(port);

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

| Name           | Type                                                | Optional | Description                                                                                                                          |
| -------------- | --------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `contractCode` | string                                              |          | string representation of contract                                                                                                    |
| `name`         | string                                              |          | name of the contract to be deployed. Should be the same as the name of the contract provided in `contractCode`                       |
| `to`           | [Address](https://docs.onflow.org/fcl/api/#address) | ✅       | account address, where contract will be deployed. If this is not specified, framework will create new account with randomized alias. |
| `addressMap`   | [AddressMap](#AddressMap)                           | ✅       | object to use for import resolver. Default: `{}`                                                                                     |
| `args`         | [Any]                                               | ✅       | arguments, which will be passed to contract initializer. Default: `[]`                                                               |
| `update`       | boolean                                             | ✅       | whether to update deployed contract. Default: `false`                                                                                |

#### Returns

| Type                                                              | Description                          |
| ----------------------------------------------------------------- | ------------------------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/api/#responseobject) | Result of the deploying transaction. |

#### Usage

```javascript
import path from "path";
import { init, emulator, getAccountAddress, deployContract, executeScript } from "flow-js-testing";

(async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  // We can specify, which account will hold the contract
  const to = await getAccountAddress("Alice");

  const name = "Wallet";
  const code = `
        pub contract Wallet{
            pub let balance: UInt
            init(balance: UInt){
              self.balance = balance
            }
        }
    `;
  const args = [1337];

  await deployContract({ to, name, code, args });

  const [balance,err] = await executeScript({
    code: `
      import Wallet from 0x01
      pub fun main(): UInt{
        return Wallet.balance
      }
    `,
  });
  console.log({ balance }, { err });

  await emulator.stop();
})();
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

| Type                                                | Description           |
| --------------------------------------------------- | --------------------- |
| [Address](https://docs.onflow.org/fcl/api/#address) | `0x` prefixed address |

#### Usage

```javascript
import path from "path";
import { init, emulator, deployContractByName, getContractAddress } from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  // if we omit "to" it will be deployed to Service Account
  // but let's pretend we don't know where it will be deployed :)
  await deployContractByName({ name: "Hello" });

  const contractAddress = await getContractAddress("Hello");
  console.log({ contractAddress });

  await emulator.stop();
})();

```

📣 Framework does not support contracts with identical names deployed to different accounts. While you can deploy contract
to a new address, the internal system, which tracks where contracts are deployed, will only store last address.

## Emulator

Flow Javascript Testing Framework exposes `emulator` singleton allowing you to run and stop emulator instance
programmatically. There are two methods available on it.

### `emulator.start(port, logging)`

Starts emulator on a specified port. Returns Promise.

#### Arguments

| Name      | Type    | Optional | Description                                                       |
| --------- | ------- | -------- | ----------------------------------------------------------------- |
| `port`    | number  | ✅       | number representing a port to use for access API. Default: `8080` |
| `logging` | boolean | ✅       | whether log messages from emulator shall be added to the output   |

#### Returns

| Type                | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| [Promise](#Promise) | Promise, which resolves to true if emulator started successfully |

#### Usage

```javascript
import path from "path";
import { emulator, init } from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });

  // Start emulator instance on port 8080
  await emulator.start(port);
  console.log("emulator is working");

  // Stop running emulator
  await emulator.stop();
  console.log("emulator has been stopped");
})();

```

### `emulator.stop()`

Stops emulator instance. Returns Promise.

#### Arguments

This method does not expect any arguments.

#### Returns

| Type                | Description                                                        |
| ------------------- | ------------------------------------------------------------------ |
| [Promise](#Promise) | Promise, which resolves to true if emulator stopped without issues |

#### Usage

```javascript
import { emulator, init } from "flow-js-testing";

describe("test setup", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence");
    const port = 8080;

    await init(basePath, { port });
    await emulator.start(port);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    await emulator.stop();
  });
});
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
import path from "path";
import { emulator, init } from "flow-js-testing";

describe("test setup", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence");
    const port = 8080;

    await init(basePath, { port });
    await emulator.start(port);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    await emulator.stop();
  });

  test("basic test", async () => {
    // Turn on logging from begining
    emulator.setLogging(true);
    // some asserts and interactions

    // Turn off logging for later calls
    emulator.setLogging(false);
    // more asserts and interactions here
  });
});
```

## FLOW Management

Some actions on the network will require account to have certain amount of FLOW token - transaction and storage fees,
account creation, etc.

Framework provides a method to query balance with `getFlowBalance` and mint new tokens via `mintFlow`. You can find
information how to use them below.

### `getFlowBalance(address)`

Fetch current FlowToken balance of account specified by address

#### Arguments

| Name      | Type                                                | Description                     |
| --------- | --------------------------------------------------- | ------------------------------- |
| `address` | [Address](https://docs.onflow.org/fcl/api/#address) | address of the account to check |

#### Returns

| Type   | Description                                                                  |
| ------ | ---------------------------------------------------------------------------- |
| string | UFix64 amount of FLOW tokens stored in account storage represented as string |

#### Usage

```javascript
import { init, emulator, getFlowBalance } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  const Alice = await getAccountAddress("Alice");

  const [result, error] = await getFlowBalance(Alice);
  console.log( { result }, { error });

  await emulator.stop();
};

main();
```

### `mintFlow(recipient, amount)`

Sends transaction to mint specified amount of FLOW token and send it to recipient.

> ⚠️ **Required:** Framework shall be initialized with `init` method for this method to work.

#### Arguments

| Name        | Type                                                | Description                                                |
| ----------- | --------------------------------------------------- | ---------------------------------------------------------- |
| `recipient` | [Address](https://docs.onflow.org/fcl/api/#address) | address of the account to check                            |
| `amount`    | string                                              | UFix64 amount of FLOW tokens to mint and send to recipient |

#### Returns

| Type                                                              | Description        |
| ----------------------------------------------------------------- | ------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/api/#responseobject) | Transaction result |

#### Usage

```javascript
import path from "path";
import { init, emulator, getAccountAddress, getFlowBalance, mintFlow } from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  // Get address for account with alias "Alice"
  const Alice = await getAccountAddress("Alice");

  // Get initial balance
  const [initialBalance] = await getFlowBalance(Alice);
  console.log( initialBalance );

  // Add 1.0 FLOW tokens to Alice account
  await mintFlow(Alice, "1.0");

  // Check updated balance
  const updatedBalance = await getFlowBalance(Alice);
  console.log({ updatedBalance });

  await emulator.stop();
})();

```

## Init

For Framework to operate properly you need to initialize it first.
You can do it with provided `init` method.

### init( basePath, options)

Initializes framework variables and specifies port to use for HTTP and grpc access.
`port` is set to 8080 by default. grpc port is calculated to `3569 + (port - 8080)` to allow multiple instances
of emulator to be run in parallel.

#### Arguments

| Name       | Type   | Optional | Description                                           |
| ---------- | ------ | -------- | ----------------------------------------------------- |
| `bastPath` | string |          | path to the folder holding all Cadence template files |
| `options`  | object | ✅       | options object to use during initialization           |

#### Options

| Name   | Type | Optional | Description                     |
| ------ | ---- | -------- | ------------------------------- |
| `port` |      | ✅       | http port for access node       |
| `pkey` |      | ✅       | private key for service account |

#### Returns

| Type                | Description                                                           |
| ------------------- | --------------------------------------------------------------------- |
| [Promise](#Promise) | Promise, which resolves to true if framework was initialized properly |

#### Usage

```javascript
import path from "path";
import { init } from "flow-js-testing";

describe("test setup", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence");
    await init(basePath);

    // alternatively you can pass specific port
    // await init(basePath, {port: 8085})
  });
});
```

## Environment

### `getBlockOffset()`

Returns current block offset - amount of blocks added on top of real current block height.

#### Returns

| Type   | Description                                                             |
| ------ | ----------------------------------------------------------------------- |
| number | number representing amount of blocks added on top of real current block |

#### Usage

```javascript
import path from "path";
import { init, emulator, getBlockOffset } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  init(basePath, port);
  await emulator.start(port);

  const [blockOffset, err] = await getBlockOffset();
  console.log({ blockOffset }, { err });

  await emulator.stop();
};

main();
```

> ⚠️ **Required:** In order for this method to work, you will need to pass code transformer to your interaction.
> Framework exposes `builtInMethods` transformer to mock built in methods

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
import path from "path";
import {
  init,
  emulator,
  executeScript,
  getBlockOffset,
  builtInMethods,
  sendTransaction,
} from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  init(basePath, port);
  await emulator.start(port);

  // Offset current block height by 42
  await setBlockOffset(42);

  const [blockOffset, err] = await getBlockOffset();
  console.log({ blockOffset }, { err });

  // "getCurrentBlock().height" in your Cadence code will be replaced by Manager to a mocked value
  const code = `
    pub fun main(): UInt64 {
      return getCurrentBlock().height
    }
  `;

  // "transformers" field expects array of functions to operate update the code.
  // We will pass single operator "builtInMethods" provided by the framework
  const transformers = [builtInMethods];
  const [result, error] = await executeScript({ code, transformers });
  console.log({ result }, { error });

  await emulator.stop();
};

main();
```

## Jest Helpers

In order to simplify the process even further we've created several Jest-based methods, which will help you to catch
thrown errors and ensure your code works as intended.

### `shallPass(ix)`

Ensure transaction does not throw and sealed.

#### Arguments

| Name | Type                        | Description                                          |
| ---- | --------------------------- | ---------------------------------------------------- |
| `ix` | [Interaction](#Interaction) | interaction, either in form of a Promise or function |

#### Returns

| Type                                                              | Description        |
| ----------------------------------------------------------------- | ------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/api/#responseobject) | Transaction result |

#### Usage

```javascript
import path from "path";
import {
  init,
  emulator,
  shallPass,
  sendTransaction,
  getAccountAddress,
} from "js-testing-framework";

// We need to set timeout for a higher number, cause some interactions might need more time
jest.setTimeout(10000);

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence");
    const port = 8080;
    await init(basePath, { port });
    return emulator.start(port);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  test("basic transaction", async () => {
    const code = `
      transaction(message: String){
        prepare(singer: AuthAccount){
          log(message)
        }
      }
    `;
    const Alice = await getAccountAddress("Alice");
    const signers = [Alice];
    const args = ["Hello, Cadence"];

    const [txResult, error] = await shallPass(
      sendTransaction({
        code,
        signers,
        args,
      }),
    );

    // Transaction result will hold status, events and error message
    console.log({ txResult }, { error });
  });
});
```

### shallRevert(ix)

Ensure interaction throws an error. You might want to use this to test incorrect inputs.

#### Arguments

| Name | Type                        | Description                                          |
| ---- | --------------------------- | ---------------------------------------------------- |
| `ix` | [Interaction](#Interaction) | transaction, either in form of a Promise or function |

#### Returns

| Type                                                              | Description        |
| ----------------------------------------------------------------- | ------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/api/#responseobject) | Transaction result |

#### Usage

```javascript
import path from "path";
import {
  init,
  emulator,
  shallPass,
  sendTransaction,
  getAccountAddress,
} from "js-testing-framework";

// We need to set timeout for a higher number, cause some interactions might need more time
jest.setTimeout(10000);

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence");
    const port = 8080;
    await init(basePath, { port });
    return emulator.start(port);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  test("basic transaction", async () => {
    const code = `
      transaction(message: String){
        prepare(singer: AuthAccount){
          panic("You shall not pass!")
        }
      }
    `;
    const Alice = await getAccountAddress("Alice");
    const signers = [Alice];
    const args = ["Hello, Cadence"];

    const [txResult, error] = await shallRevert(
      sendTransaction({
        code,
        signers,
        args,
      }),
    );

    // Transaction result will hold status, events and error message
    console.log({ txResult }, { error });
  });
});
```

### shallResolve(ix)

Ensure interaction resolves without throwing errors.

#### Arguments

| Name | Type                        | Description                                          |
| ---- | --------------------------- | ---------------------------------------------------- |
| `ix` | [Interaction](#Interaction) | interaction, either in form of a Promise or function |

#### Returns

| Type                                    | Description        |
| --------------------------------------- | ------------------ |
| [InteractionResult](#InteractionResult) | Interaction result |

#### Usage

```javascript
import path from "path";
import { init, emulator, shallPass, executeScript } from "js-testing-framework";

// We need to set timeout for a higher number, cause some interactions might need more time
jest.setTimeout(10000);

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence");
    const port = 8080;
    await init(basePath, { port });
    return emulator.start(port);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  test("basic script", async () => {
    const code = `
      pub fun main():Int{
        return 42
      }
    `;

    const [result, error] = await shallResolve(
      executeScript({
        code,
      }),
    );

    expect(result).toBe(42);
    expect(error).toBe(null);
  });
});
```

## Scripts

It is often the case that you need to query current state of the network. For example, to check balance of the
account, read public value of the contract or ensure that user has specific resource in their storage.

We abstract this interaction into single method called `executeScript`. Method have 2 different signatures.

> ⚠️ **Required:** Your project must follow the [required structure](https://docs.onflow.org/flow-js-testing/structure) it must be [initialized](https://docs.onflow.org/flow-js-testing/init) to use the following functions.

### `executeScript(props)`

Provides explicit control over how you pass values.

#### Arguments

`props` object accepts following fields:

| Name           | Type                                                                          | Optional | Description                                                                                |
| -------------- | ----------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `code`         | string                                                                        | ✅       | string representation of Cadence script                                                    |
| `name`         | string                                                                        | ✅       | name of the file in `scripts` folder to use (sans `.cdc` extension)                        |
| `args`         | array                                                                         | ✅       | an array of arguments to pass to script. Optional if script does not expect any arguments. |
| `transformers` | array[[CadenceTransformer](https://docs.onflow.org/fcl/api/#codetransformer)] | ✅       | an array of operators to modify the code, before submitting it to network                  |

> ⚠️ **Required:** Either `code` or `name` field shall be specified. Method will throw an error if both of them are empty.
> If `name` field provided, framework will source code from file and override value passed via `code` field.

#### Returns

| Type                                                              | Description   |
| ----------------------------------------------------------------- | ------------- |
| [ResponseObject](https://docs.onflow.org/fcl/api/#responseobject) | Script result |

#### Usage

```javascript
import path from "path";
import { init, emulator, executeScript } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  // Init framework
  init(basePath, { port });
  // Start emulator
  await emulator.start(port);

  // Define code and arguments we want to pass
  const code = `
    pub fun main(message: String): Int{
      log(message)

      return 42
    }
  `;
  const args = ["Hello, from Cadence"];

  const [result, error] = await executeScript({ code, args });
  console.log({ result }, { error });

  // Stop emulator instance
  await emulator.stop();
};

main();
```

### `executeScript(name: string, args: [any])`

This signature provides simplified way of executing a script, since most of the time you will utilize existing
Cadence files.

#### Arguments

| Name   | Type   | Optional | Description                                                                                            |
| ------ | ------ | -------- | ------------------------------------------------------------------------------------------------------ |
| `name` | string |          | name of the file in `scripts` folder to use (sans `.cdc` extension)                                    |
| `args` | array  | ✅       | an array of arguments to pass to script. Optional if scripts don't expect any arguments. Default: `[]` |

#### Returns

| Type                                                              | Description   |
| ----------------------------------------------------------------- | ------------- |
| [ResponseObject](https://docs.onflow.org/fcl/api/#responseobject) | Script result |

#### Usage

```javascript
import path from "path";
import { init, emulator, executeScript } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  // Init framework
  init(basePath, port);
  // Start emulator
  await emulator.start(port);

  // Define arguments we want to pass
  const args = ["Hello, from Cadence"];

  // We assume there is a file `scripts/log-message.cdc` under base path
  const [result, error] = await executeScript("log-message", args);
  console.log({ result }, { error });

  await emulator.stop();
};

main();
```

## Transactions

Another common case is necessity to mutate network state - sending tokens from one account to another, minting new
NFT, etc. Framework provides `sendTransaction` method to achieve this. This method has 2 different signatures.

> ⚠️ **Required:** Your project must follow the [required structure](https://docs.onflow.org/flow-js-testing/structure) it must be [initialized](https://docs.onflow.org/flow-js-testing/init) to use the following functions.

### `sendTransaction(props)`

Send transaction to network.
Provides explicit control over how you pass values.

#### Arguments

`props` object accepts following fields:

| Name           | Type                                                                          | Optional | Description                                                                                          |
| -------------- | ----------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `code`         | string                                                                        | ✅       | string representation of Cadence transaction                                                         |
| `name`         | string                                                                        | ✅       | name of the file in `transaction` folder to use (sans `.cdc` extension)                              |
| `args`         | [Any]                                                                         | ✅       | an array of arguments to pass to transaction. Optional if transaction does not expect any arguments. |
| `signers`      | [Address]                                                                     | ✅       | an array of [Address](https://docs.onflow.org/fcl/api/#address) representing transaction autorizers  |
| `addressMap`   | [AddressMap](#AddressMap)                                                     | ✅       | name/address map to use as lookup table for addresses in import statements                           |
| `transformers` | array[[CadenceTransformer](https://docs.onflow.org/fcl/api/#codetransformer)] | ✅       | an array of operators to modify the code, before submitting it to network                            |

> ⚠️ **Required:** Either `code` or `name` field shall be specified. Method will throw an error if both of them are empty.
> If `name` field provided, framework will source code from file and override value passed via `code` field.

> 📣 if `signers` field not provided, service account will be used to authorize the transaction.

> 📣 Pass `addressMap` only in cases, when you would want to override deployed contract. Otherwide
> imports can be resolved automatically without explicitly passing them via `addressMap` field

#### Returns

| Type                                                              | Description        |
| ----------------------------------------------------------------- | ------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/api/#responseobject) | Interaction result |

#### Usage

```javascript
import path from "path";
import { init, emulator, sendTransaction, getAccountAddress } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  // Init framework
  await init(basePath, { port });
  // Start emulator
  await emulator.start(port);

  // Define code and arguments we want to pass
  const code = `
    transaction(message: String){
      prepare(signer: AuthAccount){
        log(message)
      }
    }
  `;
  const args = ["Hello, from Cadence"];
  const Alice = await getAccountAddress("Alice");
  const signers = [Alice];

  const [tx, error] = await sendTransaction({ code, args, signers });
  console.log({ tx }, { error });

  // Stop emulator instance
  await emulator.stop();
};

main();
```

### `sendTransaction(name, signers, args)`

This signature provides simplified way to send a transaction, since most of the time you will utilize existing
Cadence files.

| Name      | Type   | Optional | Description                                                                                          |
| --------- | ------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `name`    | string | ✅       | name of the file in `transaction` folder to use (sans `.cdc` extension)                              |
| `signers` | array  | ✅       | an array of [Address](https://docs.onflow.org/fcl/api/#address) representing transaction autorizers  |
| `args`    | [Any]  | ✅       | an array of arguments to pass to transaction. Optional if transaction does not expect any arguments. |

#### Returns

| Type                                                              | Description        |
| ----------------------------------------------------------------- | ------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/api/#responseobject) | Interaction result |

#### Usage

```javascript
import path from "path";
import { init, emulator, sendTransaction } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  // Init framework
  await init(basePath, { port });
  // Start emulator
  await emulator.start(port);

  // Define arguments we want to pass
  const args = ["Hello, Cadence"];
  const Alice = await getAccountAddress("Alice");
  const signers = [Alice];

  const [tx, error] = await sendTransaction("log-message", [Alice], args);
  console.log({ tx }, { error });
};

main();
```

## Templates

The philosophy behind Flow JS Testing Framework is to be a set of helper methods. They can be used in
opinionated way, envisioned by Flow Team. Or they can work as building blocks, allowing developers to build their own
testing solution as they see fit.

Following methods used inside other framework methods, but we feel encouraged to list them here as well.

### `getTemplate(file, addressMap, byAddress)`

Returns Cadence template as string with addresses replaced using addressMap

| Name         | Type                      | Optional | Description                                                                                               |
| ------------ | ------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `file`       | string                    |          | relative (to the place from where the script was called) or absolute path to the file containing the code |
| `addressMap` | [AddressMap](#AddressMap) | ✅       | object to use for address mapping of existing deployed contracts. Default: `{}`                           |
| `byAddress`  | boolean                   | ✅       | whether addressMap is `{name:address}` or `{address:address}` type. Default: `false`                      |

#### Returns

| Type   | Description                 |
| ------ | --------------------------- |
| string | content of a specified file |

#### Usage

```javascript
import path from "path";
import { init, getTemplate } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  await init(basePath);

  const template = await getTemplate("../cadence/scripts/get-name.cdc");
  console.log({ template });
};

main();
```

## `getContractCode(name, addressMap)`

Returns Cadence template from file with `name` in `_basepath_/contracts` folder

#### Arguments

| Name         | Type                      | Optional | Description                                                      |
| ------------ | ------------------------- | -------- | ---------------------------------------------------------------- |
| `name`       | string                    |          | name of the contract template                                    |
| `addressMap` | [AddressMap](#AddressMap) | ✅       | object to use for address mapping of existing deployed contracts |

#### Returns

| Type   | Description                                  |
| ------ | -------------------------------------------- |
| string | Cadence template code for specified contract |

#### Usage

```javascript
import path from "path";
import { init, emulator, getContractCode } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  // Let's assume we need to import MessageContract
  await deployContractByName({ name: "MessageContract" });
  const [MessageContract] = await getContractAddress("MessageContract");
  const addressMap = { MessageContract };

  const contractTemplate = await getContractCode("HelloWorld", {
    MessageContract,
  });
  console.log({ contractTemplate });

  await emulator.stop();
};

main();
```

### `getTransactionCode(name, addressMap)`

Returns Cadence template from file with `name` in `_basepath_/transactions` folder

#### Arguments

| Name         | Type                      | Optional | Description                                                      |
| ------------ | ------------------------- | -------- | ---------------------------------------------------------------- |
| `name`       | string                    |          | name of the transaction template                                 |
| `addressMap` | [AddressMap](#AddressMap) | ✅       | object to use for address mapping of existing deployed contracts |

#### Returns

| Type   | Description                                     |
| ------ | ----------------------------------------------- |
| string | Cadence template code for specified transaction |

#### Usage

```javascript
import path from "path";
import { init, emulator, getTransactionCode } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  // Let's assume we need to import MessageContract
  await deployContractByName({ name: "MessageContract" });
  const [MessageContract] = await getContractAddress("MessageContract");
  const addressMap = { MessageContract };

  const txTemplate = await getTransactionCode({
    name: "set-message",
    addressMap,
  });
  console.log({ txTemplate });

  await emulator.stop();
};

main();
```

### `getScriptCode(name, addressMap)`

Returns Cadence template from file with `name` in `_basepath_/scripts` folder

#### Arguments

| Name         | Type                      | Optional | Description                                                      |
| ------------ | ------------------------- | -------- | ---------------------------------------------------------------- |
| `name`       | string                    |          | name of the script template                                      |
| `addressMap` | [AddressMap](#AddressMap) | ✅       | object to use for address mapping of existing deployed contracts |

#### Returns

| Type   | Description                                |
| ------ | ------------------------------------------ |
| string | Cadence template code for specified script |

#### Usage

```javascript
import path from "path";
import { init, emulator, getScriptCode } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  // Let's assume we need to import MessageContract
  await deployContractByName({ name: "MessageContract" });
  const [MessageContract] = await getContractAddress("MessageContract");
  const addressMap = { MessageContract };

  const scriptTemplate = await getScriptCode({
    name: "get-message",
    addressMap,
  });

  console.log({ scriptTemplate });
  await emulator.stop();
};

main();
```

## Types

### `AddressMap`

Object to use for address mapping of existing deployed contracts. Key shall be `string` and value shall be [Address](https://docs.onflow.org/fcl/api/#address)

#### Example

```javascript
const addressMap = {
  Messanger: "0x01cf0e2f2f715450",
  Logger: "0x179b6b1cb6755e31",
};
```

### `Interaction`

Interaction is a Promise or function returning a promise.

#### Example

```javascript
const ix = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1337);
    });
  }, 500);
};
```

### `CadenceTransformer`

Function, which will get valid Cadence code, modify it and return valid Cadence code

#### Example

This transformer will look for occupancies of specific import statement and replace it with proper address, where it's deployed on Emulator

```javascript
const replaceAddress = async (code) => {
  const modified = code.replace(
    /import\s+FungibleToken\s+from\s+0xFUNGIBLETOKEN/,
    "import FungibleToken from 0xee82856bf20e2aa6",
  );

  return modified;
};
```
