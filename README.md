# JavaScript Testing Framework for Flow

This repository contains utility methods that, in conjunction with testing libraries like `Jest`,
can be used to speed up your productivity while building Flow dapps in Cadence.

# Emulator Setup

Most of the methods will not work, unless you have Flow Emulator running in the background.
You can install it alongside Flow CLI. Please refer to [Install Flow CLI](https://docs.onflow.org/flow-cli/install)
for instructions.

If you have it already installed, run the `flow init` in your terminal to create `flow.json` config file.
Then start the emulator with `flow emulator`.

# Basic usage

> We are assuming you are using this framework under Node environment. You will need at least version **12.0.0**

Before using any of the methods you need to `init` the framework, basically telling where you Cadence
code will live. In example below, we put all the Cadence code in the folder named `cadence` one level above the place
where you project script is located.

```javascript
const basePath = path.resolve(__dirname, "../cadence");
```

## Utilities

Utilities are grouped by domain.

### Accounts

#### getAccountAddress(name: string)

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
import { deployContractByName } from "flow-js-testing/dist";

const main = async () => {
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
import { deployContract } from "flow-js-testing/dist";

const main = async () => {
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

### Cadence Code Templates

#### getTemplate(file, addressMap = {}, byAddress = false)

Returns Cadence template as string with addresses replaced using addressMap

- `file` - relative (to the place from where the script was called) or absolute path to the file containing the code
- `addressMap` - object to use for address mapping of existing deployed contracts
- `byAddress` - whether addressMap is `{name:address}` or `{address:address}` type. Default: `false`

#### getContractCode(name, addressMap = {}, service = false)

Returns Cadence template from file with `name` in `_basepath/contracts` folder

- `name` - name of the contract
- `addressMap` - object to use for address mapping of existing deployed contracts
- `service` - whether is this a service contract

#### getTransactionCode(name, addressMap = {}, service = false)

Returns Cadence template from file with `name` in `_basepath/transactions` folder

- `name` - name of the contract
- `addressMap` - object to use for address mapping of existing deployed contracts
- `service` - whether is this a service contract

#### getScriptCode(name, addressMap = {}, service = false)

Returns Cadence template from file with `name` in `_basepath/scripts` folder

- `name` - name of the contract
- `addressMap` - object to use for address mapping of existing deployed contracts
- `service` - whether is this a service contract

Usage:
If you don't have any contracts deployed, you can simply do this:

```javascript
import {
  getContractCode,
  getTransactionCode,
  getScriptCode,
} from "flow-js-testing/dist";

const Wallet = await getContractCode("Wallet");
const txGetCapability = await getTransactionCode("get-capability");
const scriptGetBalance = await getScriptCode("get-balance");
```

For any additional contracts used in your code, simply create `addressMap` object and pass it as second argument:

```javascript
const addressMap = {
  WalletProvider: "0x1337",
};

const Wallet = await getContractCode("Wallet", addressMap);
```

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
            log(first);
            log(second);
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
    pub fun main(first: Int, second: Int, third: UFix64): Int{
        log(first);
        log(second);
        log(alice.address);
        log(bob.address);
        
        return 1
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
