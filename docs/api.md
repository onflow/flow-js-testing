# Table of Contents

- [Init](#init)
- [Emulator](#emulator)
  - [start](#emulator.start)
  - [stop](#emulator.stop)
- [Accounts](#accounts)
  - [getAccountAddress](#getaccountaddressname)
- [Contracts](#contracts)
  - [deployContractByName](#deploycontractbynameprops)
  - [deployContract](#deploycontractbynameprops)
  - [getContractAddress](#getcontractaddressname-usedefaults--false)
- [Cadence Code Templates](#cadence-code-templates)
  - [getTemplate](#gettemplatefile-addressmap---byaddress--false)
  - [getContractCode](#getcontractcodename-addressmap---service--false)
  - [getTransactionCode](#gettransactioncodename-addressmap---service--false)
  - [getScriptCode](#getscriptcodename-addressmap---service--false)
- [Send and Execute](#send-and-execute)
  - [sendTransaction](#sendtransactionprops)
  - [executeScript](#executescriptprops)
- [FlowToken](#flowtoken)
  - [getFlowBalance](#getflowbalanceaddress)
  - [mintFlow](#mintflowrecipient-amount)

---

## Init

### init(basePath, port)

Initializes framework variables and specifies port to use for HTTP and grpc access.
`port` is set to 8080 by default. grpc port is calculated to `3569 + (port - 8080)` to allow multiple instances
of emulator to be run in parallel

- `basePath` - path to the folder, with Cadence template files
- `port` - http port to use for access node

```javascript
import path from "path";
import { init } from "js-testing-framework";

describe("test setup", () => {
  beforeEach(async (done) => {
    const basePath = path.resolve(__dirname, "../cadence");
    init(basePath);

    // alternatively you can pass specific port
    // init(basePath, 8085)

    done();
  });
});
```

## Emulator

### emulator.start

Starts emulator on specified port.

- `port` - number representing a port to use for access API
- `logging` - whether log messages from emulator shall be added to the output

### emulator.stop

Stops emulator instance.

```javascript
describe("test setup", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async (done) => {
    const basePath = path.resolve(__dirname, "../cadence");
    const port = 8080;
    init(basePath, port);
    await emulator.start(port, false);
    done();
  });

  // Stop emulator, so it could be restarted
  afterEach(async (done) => {
    await emulator.stop();
    done();
  });
});
```

## Accounts

### getAccountAddress(name)

Resolves name alias to a Flow address (`0x` prefixed).
If account with specific name does not exist on the `ledger` - framework will create new account and assign provided alias to it.
Next time when you call this method, it will grab exactly the same account. This allows you to create several accounts first
and then use them throughout your code, without worrying that accounts match or trying to store/handle specific addresses.

```javascript
import { getAccountAddress } from "flow-js-testing";

const main = async () => {
  const Alice = await getAccountAddress("Alice");
  console.log({ Alice });
};

main();
```

---

## Contracts

### deployContractByName(props)

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
import { init, deployContractByName } from "flow-js-testing";

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

### deployContract(props)

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
import { deployContract } from "flow-js-testing";

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

### getContractAddress(name, useDefaults = false)

Returns address of the account, where contract is currently deployed.

- `name` - name of the contract
- `useDefault` - whether to look for contract in default accounts
  > Currently, framework does not support contracts with identical names deployed to different accounts.
  > Though if you don't pass second argument, you can override contracts deployed by default.

```javascript
import { getContractAddress } from "flow-js-testing";

const main = async () => {
  const contract = await getContractAddress("HelloWorld");
  console.log({ contract });
};

main();
```

---

## Cadence Code Templates

### getTemplate(file, addressMap = {}, byAddress = false)

Returns Cadence template as string with addresses replaced using addressMap

- `file` - relative (to the place from where the script was called) or absolute path to the file containing the code
- `addressMap` - object to use for address mapping of existing deployed contracts
- `byAddress` - whether addressMap is `{name:address}` or `{address:address}` type. Default: `false`

```javascript
import path from "path";
import { init, getTemplate } from "flow-js-testing";

const main = async () => {
  init(path.resolve(__dirname, "../cadence"));
  const template = await getTemplate("../cadence/scripts/get-name.cdc");
  console.log({ template });
};

main();
```

### getContractCode(name, addressMap = {}, service = false)

Returns Cadence template from file with `name` in `_basepath/contracts` folder

- `name` - name of the contract
- `addressMap` - object to use for address mapping of existing deployed contracts
- `service` - whether is this a service contract.

```javascript
import path from "path";
import { init, getContractCode } from "flow-js-testing";

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

### getTransactionCode(name, addressMap = {}, service = false)

Returns Cadence template from file with `name` in `_basepath/transactions` folder

- `name` - name of the contract
- `addressMap` - object to use for address mapping of existing deployed contracts
- `service` - whether is this a service contract

```javascript
import path from "path";
import { init, getTransactionCode } from "flow-js-testing";

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

### getScriptCode(name, addressMap = {}, service = false)

Returns Cadence template from file with `name` in `_basepath/scripts` folder

- `name` - name of the contract
- `addressMap` - object to use for address mapping of existing deployed contracts
- `service` - whether is this a service contract

```javascript
import path from "path";
import { init, getScriptCode } from "flow-js-testing";

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
import { init, getContractCode, getTransactionCode, getScriptCode } from "flow-js-testing";

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

## Send and Execute

### sendTransaction(props)

Sends transaction to the chain. Returns transaction result.

Props object accepts following fields:

- `code` - account address, where contract will be deployed
- `args` - arguments, which will be passed to contract initializer
- `signers` - an array of `0x` prefixed addresses in the same order as specified in `prepare` block

Usage:

```javascript
import { Int, UFix64 } from "@onflow/types";
import { deployContract } from "flow-js-testing";

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

### executeScript(props)

Props object accepts following fields:

- `code` - account address, where contract will be deployed
- `args` - arguments, which will be passed to contract initializer

```javascript
import { Int, UFix64 } from "@onflow/types";
import { deployContract } from "flow-js-testing";

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

## FlowToken

Every account on Flow network have FlowToken Vault and exposed capability. Following methods allow you to get current balance
and top up specific account with new tokens.

### getFlowBalance(address)

Returns current FlowToken balance of account specified by address

- `address` - account address

Usage:

```javascript
import { getFlowBalance } from "flow-js-testing";

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

### mintFlow(recipient, amount)

Sends transaction to mint specified amount of FlowToken and send it to recipient.

- `recipient` - address of recipient account
- `amount` - amount to mint and send

```javascript
import { mintFlow } from "flow-js-testing";

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
