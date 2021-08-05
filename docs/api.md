# JS Testing API Reference

> ⚠️ **Required:** Your project must follow the [required structure](https://docs.onflow.org/flow-js-testing/structure) and it must be [initialized](https://docs.onflow.org/flow-js-testing/init) to use the following functions.

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

| Type     | Description                              |
| -------- | ---------------------------------------- |
| `string` | `0x` prefixed address of aliased account |

#### Usage

```javascript
import { getAccountAddress } from "flow-js-testing";

const main = async () => {
  const Alice = await getAccountAddress("Alice");
  console.log({ Alice });
};

main();
```

## Contracts

### `deployContractByName(props)`

Deploys contract code located inside Cadence file. Returns transaction result.\

#### Arguments

Props object accepts following fields:

| Name         | Type    | Optional | Description                                                                                                                                     |
| ------------ | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`       | string  |          | name of the file in `contracts` folder (with `.cdc` extension) and name of the contract (please note those should be the same)                  |
| `to`         | string  | ✅       | (optional) account address, where contract will be deployed. If this is not specified, framework will create new account with randomized alias. |
| `addressMap` | object  | ✅       | (optional) object to use for address mapping of existing deployed contracts                                                                     |
| `args`       | array   | ✅       | (optional) arguments, which will be passed to contract initializer. (optional) if template does not expect any arguments.                       |
| `update`     | boolean | ✅       | (optional) whether to update deployed contract. Default: `false`                                                                                |

#### Returns

| Type                                    | Description                          |
| --------------------------------------- | ------------------------------------ |
| [TransactionResult](#TransactionResult) | Result of the deploying transaction. |

Usage:

```javascript
import path from "path";
import { init, emulator, deployContractByName } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  init(basePath, port);
  await emulator.start(port);

  // We will deploy our contract to the address that corresponds to "Alice" alias
  const to = await getAccountAddress("Alice");

  // We assume there is a file on "../cadence/contracts/Wallet.cdc" path
  const name = "Wallet";

  // Arguments will be processed and type matched in the same order as they are specified
  // inside of a contract template
  const args = [1337, "Hello", { name: "Alice" }];

  try {
    const deploymentResult = await deployContractByName({ to, name });
    console.log({ deploymentResult });
  } catch (e) {
    // If we encounter any errors during teployment, we can catch and process them here
    console.log(e);
  }

  await emulator.stop();
};

main();
```

In a bit more rare case you would want to deploy contract code not from existing template file, but rather
from string representation of it. `deployContract` method will help you achieve this.

### `deployContract(props)`

Deploys contract code specified as string. Returns transaction result.

#### Arguments

Props object accepts following fields:

| Name           | Type    | Optional | Description                                                                                                                          |
| -------------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `contractCode` | string  |          | string representation of contract                                                                                                    |
| `name`         | string  |          | name of the contract to be deployed. Should be the same as the name of the contract provided in `contractCode`                       |
| `to`           | string  | ✅       | account address, where contract will be deployed. If this is not specified, framework will create new account with randomized alias. |
| `addressMap`   | object  | ✅       | object to use for import resolver. Default: `{}`                                                                                     |
| `args`         | array   | ✅       | arguments, which will be passed to contract initializer. Default: `[]`                                                               |
| `update`       | boolean | ✅       | whether to update deployed contract. Default: `false`                                                                                |

Usage:

```javascript
import path from "path";
import { init, emulator, deployContract } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port, false);

  const to = await getAccountAddress("Alice");
  const name = "Wallet";
  const contractCode = `
        pub contract Wallet{
            init(amount: Int){
                log(amount)
                log("Thank you for the food!")
            }
        }
    `;
  const args = [1337];

  try {
    const deploymentResult = await deployContractByName({
      to,
      name,
      contractCode,
      args,
    });

    console.log({ deploymentResult });
  } catch (e) {
    console.log(e);
  }

  await emulator.stop();
};

main();
```

While framework have automatic import resolver for Contracts you might want to know where it's currently deployed.
We provide a method `getContractAddress` for this.

### `getContractAddress(name)`

Returns address of the account where the contract is currently deployed.

#### Arguments

| Name   | Type   | Description          |
| ------ | ------ | -------------------- |
| `name` | string | name of the contract |

```javascript
import { getContractAddress } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port, false);

  // if we ommit "to" it will be deployed to a newly generated address with "unknown" alias
  await deployContractByName({ name: "HelloWorld" });

  const contract = await getContractAddress("HelloWorld");
  console.log({ contract });
};

main();
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

#### Usage

```javascript
import { emulator, init } from "flow-js-testing";

describe("test setup", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async (done) => {
    const basePath = path.resolve(__dirname, "../cadence");
    const port = 8080;

    await init(basePath, { port });

    // Start emulator instance on port 8080
    await emulator.start(port);

    done();
  });
});
```

### `emulator.stop()`

Stops emulator instance. Returns Promise.

#### Arguments

This method does not expect any arguments.

#### Usage

```javascript
import { emulator, init } from "flow-js-testing";

describe("test setup", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async (done) => {
    const basePath = path.resolve(__dirname, "../cadence");
    const port = 8080;

    await init(basePath, { port });
    await emulator.start(port);
    done();
  });

  // Stop emulator, so it could be restarted
  afterEach(async (done) => {
    await emulator.stop();
    done();
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

| Name      | Type                | Description                     |
| --------- | ------------------- | ------------------------------- |
| `address` | [Address](#Address) | address of the account to check |

#### Returns

| Type               | Description                                     |
| ------------------ | ----------------------------------------------- |
| [Amount](#Amount`) | amount of FLOW tokens stored in account storage |

#### Usage

```javascript
import { init, emulator, getFlowBalance } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  const Alice = await getAccountAddress("Alice");

  try {
    const result = await getFlowBalance(Alice);
    console.log({ result });
  } catch (e) {
    console.log(e);
  }

  await emulator.stop();
};

main();
```

### `mintFlow(recipient, amount)`

Sends transaction to mint specified amount of FLOW token and send it to recipient.

> ⚠️ **Required:** Framework shall be initialized with `init` method for this method to work.

#### Arguments

| Name        | Type                | Description                                         |
| ----------- | ------------------- | --------------------------------------------------- |
| `recipient` | [Address](#Address) | address of the account to check                     |
| `amount`    | [Amount](#Amount)   | amount of FLOW tokens to mint and send to recipient |

#### Usage

```javascript
import { init, emulator, mintFlow } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  const Alice = await getAccountAddress("Alice");
  const amount = "42.0";
  try {
    const mintResult = await mintFlow(Alice);
    console.log({ mintResult });
  } catch (e) {
    console.log(e);
  }

  await emulator.stop();
};

main();
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

- `basePath` - path to the folder holding all Cadence template files
- `port` - (optional) http port to use for access node

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

## Scripts

It is often the case that you need to query current state of the network. For example, to check balance of the
account, read public value of the contract or ensure that user has specific resource in their storage.

We abstract this interaction into single method called `executeScript`. Method have 2 different signatures.

> ⚠️ **Required:** Your project must follow the [required structure](https://docs.onflow.org/flow-js-testing/structure) it must be [initialized](https://docs.onflow.org/flow-js-testing/init) to use the following functions.

### `executeScript(props)`

Provides explicit control over how you pass values.

#### Arguments

`props` object accepts following fields:

| Name   | Type   | Optional | Description                                                                                |
| ------ | ------ | -------- | ------------------------------------------------------------------------------------------ |
| `code` | string | ✅       | string representation of Cadence script                                                    |
| `name` | string | ✅       | name of the file in `scripts` folder to use (sans `.cdc` extension)                        |
| `args` | array  | ✅       | an array of arguments to pass to script. Optional if script does not expect any arguments. |

> ⚠️ **Required:** Either `code` or `name` field shall be specified. Method will throw an error if both of them are empty.
> If `name` field provided, framework will source code from file and override value passed via `code` field.

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

  // If something wrong with script execution method will throw an error,
  // so we need to catch it and process
  try {
    const result = await executeScript({ code, args });
    console.log({ result });
  } catch (e) {
    console.error(e);
  }

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
  await emulator.start(port, false);

  // Define arguments we want to pass
  const args = ["Hello, from Cadence"];

  // If something wrong with script execution method will throw an error,
  // so we need to catch it and process
  try {
    // We assume there is a file `scripts/log-message.cdc` under base path
    const result = await executeScript("log-message", args);
    console.log({ result });
  } catch (e) {
    console.error(e);
  }

  await emulator.stop();
};

main();
```
