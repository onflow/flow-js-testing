# JavaScript Testing Framework for Flow Network

This repository contains utility methods that, in conjunction with testing libraries like `Jest`,
can be used to speed up your productivity while building Flow dapps in Cadence.

## Installation

## Framework

Add framework package to your project

```
npm install flow-js-testing
```

## Jest

Install `jest`:

```
npm install jest
```

Add `jest.config.js` file in your test folder and populate it with:

```javascript
module.exports = {
  testEnvironment: "node",
  verbose: true,
  coveragePathIgnorePatterns: ["/node_modules/"],
};
```

## Babel

Install Babel dependencies:

```
npm install @babel/core @babel/preset-env babel-jest
```

Create `babel.config.json`. Copy and paste there following configuration:

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "current"
        }
      }
    ]
  ]
}
```

## Flow JS SDK Types

Most likely you would want to pass arguments to your Cadence code.
You will need `@onflow/types` package for this:

```
npm install @onflow/types
```

## Emulator

Most of the methods will not work, unless you have Flow Emulator running in the background.
You can install it alongside Flow CLI. Please refer to [Install Flow CLI](https://docs.onflow.org/flow-cli/install)
for instructions.

If you have it already installed, run the `flow init` in your terminal to create `flow.json` config file.
Then start the emulator with `flow emulator -v`.

# Basic usage

> We are assuming you are using this framework under Node environment. You will need at least version **12.0.0**

Before using any of the methods you need to `init` the framework, basically telling where you Cadence
code will live. In example below, we put all the Cadence code in the folder named `cadence` one level above the place
where your test script is located.

```javascript
const basePath = path.resolve(__dirname, "../cadence");
```

Let's create `deploy.test.js` file and write some basic test, which would create 4 accounts for us and output their addresses:

```javascript
import path from "path";

const basePath = path.resolve(__dirname, "../cadence");

beforeAll(() => {
  init(basePath);
});

describe("Accounts", () => {
  test("Create Accounts", async () => {
    const Alice = await getAccountAddress("Alice");
    const Bob = await getAccountAddress("Bob");
    const Charlie = await getAccountAddress("Charlie");
    const Dave = await getAccountAddress("Dave");

    console.log("Four accounts were created with following addresses:\n", {
      Alice,
      Bob,
      Charlie,
      Dave,
    });
  });
});
```

Run emulator with `flow emulator -v` and then in another terminal run `jest`

# Available Methods

Utilities below are grouped by domain.

---

### Accounts

#### getAccountAddress(name)

Resolves name alias to a Flow address (`0x` prefixed).
If account with specific name does not exist on the `ledger` - framework will create new account and assign provided alias to it.
Next time when you call this method, it will grab exactly the same account. This allows you to create several accounts first
and then use them throughout your code, without worrying that accounts match or trying to store/handle specific addresses.

```javascript
import { getAccountAddress } from "flow-js-testing/dist";

const main = async () => {
  const Alice = await getAccountAddress("Alice");
  console.log({ Alice });
};

main();
```

---

### Contracts

#### deployContractByName(props)

Deploys contract code located inside Cadence file. Returns transaction result.
Props object accepts following fields:

- `to` - account address, where contract will be deployed
- `name` - name of the file in `contracts` folder (with `.cdc` extension) and name of the contract (please note those should be the same)
- `addressMap` - object to use for address mapping of existing deployed contracts
- `args` - arguments, which will be passed to contract initializer
- `update` - whether to update deployed contract. Default: `false`

Usage:

```javascript
import path from "path";
import { init, deployContractByName } from "flow-js-testing/dist";

const main = async () => {
  init(path.resolve(__dirname, "../cadence"));

  const to = await getAccountAddress("Alice");
  const name = "Wallet";

  try {
    const deploymentResult = await deployContractByName({ to, name });
    console.log({ deploymentResult });
  } catch (e) {
    console.log(e);
  }
};

main();
```

#### deployContract(props)

Deploys contract code specified as string. Returns transaction result.
Props object accepts following fields:

- `to` - account address, where contract will be deployed
- `contractCode` - string representation of contract
- `name` - name of the contract to be deployed. Should be the same as the name of the contract provided in `contractCode`
- `addressMap` - object to use for address mapping of existing deployed contracts
- `args` - arguments, which will be passed to contract initializer
- `update` - whether to update deployed contract. Default: `false`

Usage:

```javascript
import path from "path";
import { deployContract } from "flow-js-testing/dist";

const main = async () => {
  init(path.resolve(__dirname, "../cadence"));

  const to = await getAccountAddress("Alice");
  const name = "Wallet";
  const contractCode = `
        pub contract Wallet{
            init(){
                log("Thank you for the food!")
            }
        }
    `;

  try {
    const deploymentResult = await deployContractByName({
      to,
      name,
      contractCode,
    });
    console.log({ deploymentResult });
  } catch (e) {
    console.log(e);
  }
};

main();
```

#### getContractAddress(name, useDefaults = false)

Returns address of the account, where contract is currently deployed.

- `name` - name of the contract
- `useDefault` - whether to look for contract in default accounts
  > Currently, framework does not support contracts with identical names deployed to different accounts.
  > Though if you don't pass second argument, you can override contracts deployed by default.

```javascript
import { getContractAddress } from "flow-js-testing/dist";

const main = async () => {
  const contract = await getContractAddress("HelloWorld");
  console.log({ contract });
};

main();
```

---

### Cadence Code Templates

#### getTemplate(file, addressMap = {}, byAddress = false)

Returns Cadence template as string with addresses replaced using addressMap

- `file` - relative (to the place from where the script was called) or absolute path to the file containing the code
- `addressMap` - object to use for address mapping of existing deployed contracts
- `byAddress` - whether addressMap is `{name:address}` or `{address:address}` type. Default: `false`

```javascript
import path from "path";
import { init, getTemplate } from "flow-js-testing/dist";

const main = async () => {
  init(path.resolve(__dirname, "../cadence"));
  const template = await getTemplate("../cadence/scripts/get-name.cdc");
  console.log({ template });
};

main();
```

#### getContractCode(name, addressMap = {}, service = false)

Returns Cadence template from file with `name` in `_basepath/contracts` folder

- `name` - name of the contract
- `addressMap` - object to use for address mapping of existing deployed contracts
- `service` - whether is this a service contract.

```javascript
import path from "path";
import { init, getContractCode } from "flow-js-testing/dist";

const main = async () => {
  init(path.resolve(__dirname, "../cadence"));

  // Let's assume we need to import MessageContract
  const MessageContract = await getContractAddress("MessageContract");
  const addressMap = { MessageContract };

  const contractTemplate = await getContractCode("HelloWorld", {
    MessageContract,
  });
  console.log({ contractTemplate });
};

main();
```

#### getTransactionCode(name, addressMap = {}, service = false)

Returns Cadence template from file with `name` in `_basepath/transactions` folder

- `name` - name of the contract
- `addressMap` - object to use for address mapping of existing deployed contracts
- `service` - whether is this a service contract

```javascript
import path from "path";
import { init, getTransactionCode } from "flow-js-testing/dist";

const main = async () => {
  init(path.resolve(__dirname, "../cadence"));

  // Let's assume we need to import MessageContract
  const MessageContract = await getContractAddress("MessageContract");
  const addressMap = { MessageContract };

  const txTemplate = await getTransactionCode({
    name: "set-message",
    addressMap,
  });
  console.log({ txTemplate });
};

main();
```

#### getScriptCode(name, addressMap = {}, service = false)

Returns Cadence template from file with `name` in `_basepath/scripts` folder

- `name` - name of the contract
- `addressMap` - object to use for address mapping of existing deployed contracts
- `service` - whether is this a service contract

```javascript
import path from "path";
import { init, getScriptCode } from "flow-js-testing/dist";

const main = async () => {
  init(path.resolve(__dirname, "../cadence"));

  // Let's assume we need to import MessageContract
  const MessageContract = await getContractAddress("MessageContract");
  const addressMap = { MessageContract };

  const scriptTemplate = await getScriptCode({
    name: "get-message",
    addressMap,
  });
  console.log({ scriptTemplate });
};

main();
```

Usage:
If you don't have any contract dependencies, you can use those methods without specifying address map as second parameter.

```javascript
import path from "path";
import {
  init,
  getContractCode,
  getTransactionCode,
  getScriptCode,
} from "flow-js-testing/dist";

const main = async () => {
  init(path.resolve(__dirname, "../cadence"));

  const contractWallet = await getContractCode({ name: "Wallet" });
  const txGetCapability = await getTransactionCode({ name: "get-capability" });
  const scriptGetBalance = await getScriptCode({ name: "get-balance" });

  console.log({ contractWallet, txGetCapability, scriptGetBalance });
};
main();
```

---

### Send and Execute

#### sendTransaction(props)

Sends transaction to the chain. Returns transaction result.

Props object accepts following fields:

- `code` - account address, where contract will be deployed
- `args` - arguments, which will be passed to contract initializer
- `signers` - an array of `0x` prefixed addresses in the same order as specified in `prepare` block

Usage:

```javascript
import { Int, UFix64 } from "@onflow/types";
import { deployContract } from "flow-js-testing/dist";

const main = async () => {
  // Get signers adresses
  const Alice = await getAccountAddress("Alice");
  const Bob = await getAccountAddress("Bob");

  // Read or create transaction code
  const code = `
    transaction(first: Int, second: Int, third: UFix64){
        prepare(alice: AuthAccount, bob: AuthAccount){
            // Log passed arguments
            log(first);
            log(second);
            
            // Log signers' addresses
            log(alice.address);
            log(bob.address);
        }
    }
  `;

  // Create list of arguments
  // You can group items with the same time under single array
  // Last item in the list should always be the type of passed values
  const args = [
    [13, 37, Int],
    [42.12, UFix64],
  ];

  // Specify order of signers
  const signers = [Alice, Bob];

  try {
    const txResult = await sendTransaction({ code, args, signers });
    console.log({ txResult });
  } catch (e) {
    console.log(e);
  }
};

main();
```

#### executeScript(props)

Props object accepts following fields:

- `code` - account address, where contract will be deployed
- `args` - arguments, which will be passed to contract initializer

```javascript
import { Int, UFix64 } from "@onflow/types";
import { deployContract } from "flow-js-testing/dist";

const main = async () => {
  // Read or create script code
  const code = `
    pub fun main(first: Int, second: Int, third: UFix64){
        // Log passed arguments
        log(first);
        log(second);
    }
  `;

  // Create list of arguments
  // You can group items with the same time under single array
  // Last item in the list should always be the type of passed values
  const args = [
    [13, 37, Int],
    [42.12, UFix64],
  ];

  try {
    const result = await executeScript({ code, args });
    console.log({ result });
  } catch (e) {
    console.log(e);
  }
};

main();
```

---

### FlowToken

Every account on Flow network have FlowToken Vault and exposed capability. Following methods allow you to get current balance
and top up specific account with new tokens.

#### getFlowBalance(address)

Returns current FlowToken balance of account specified by address

- `address` - account address

Usage:

```javascript
import { getFlowBalance } from "flow-js-testing/dist";

const main = async () => {
  const Alice = await getAccountAddress("Alice");

  try {
    const result = await getFlowBalance(Alice);
    console.log({ result });
  } catch (e) {
    console.log(e);
  }
};

main();
```

#### mintFlow(recipient, amount)

Sends transaction to mint specified amount of FlowToken and send it to recipient.

- `recipient` - address of recipient account
- `amount` - amount to mint and send

```javascript
import { mintFlow } from "flow-js-testing/dist";

const main = async () => {
  const Alice = await getAccountAddress("Alice");
  const amount = "42.0";
  try {
    const mintResult = await mintFlow(Alice);
    console.log({ mintResult });
  } catch (e) {
    console.log(e);
  }
};

main();
```

# Playground Integration

Every Playground project has the ability to `export` it's content as a set of files with Cadence template code and
basic test environment "out of the box".

If you want to use this functionality:

- Press "Export" button in the top right corner
- Pick the name of the project - or keep auto-generated version
- Press "Export" button within popup window

Playground will create a `zip` file for you, which you can save wherever you like.
