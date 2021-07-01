---
title: Contracts Management
sidebar_title: Contracts
description: How to manage contracts
---

Assuming your project follows [required structure](https://docs.onflow.org/flow-js-testing/structure) and you
initialized the project ([as described here](https://docs.onflow.org/flow-js-testing/init)) you can deploy contract
using just it's name with `deployContractByName` method.

### deployContractByName(props)

Deploys contract code located inside Cadence file. Returns transaction result.
Props object accepts following fields:

- `name` - name of the file in `contracts` folder (with `.cdc` extension) and name of the contract (please note those should be the same)
- `to` - (optional) account address, where contract will be deployed. If this is not specified, framework will
  create new account with randomized alias.
- `addressMap` - (optional) object to use for address mapping of existing deployed contracts
- `args` - arguments, which will be passed to contract initializer. Optional if template does not expect any arguments.
- `update` - whether to update deployed contract. Default: `false`

Usage:

```javascript
import path from "path";
import { init, emulator, deployContractByName } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  init(basePath, port);
  await emulator.start(port, false);

  const Alice = await getAccountAddress("Alice");
  // We assume there is a file on "../cadence/contracts/Wallet.cdc" path
  const name = "Wallet";
  // Arguments will be processed and type matched in the same order as they are specified
  // inside of a contract template
  const args = [1337, "Hello", { name: "Alice" }];

  try {
    const deploymentResult = await deployContractByName({ to: Alice, name });
    console.log({ deploymentResult });
  } catch (e) {
    console.log(e);
  }

  await emulator.stop();
};

main();
```

In a bit more rare case you would want to deploy contract code not from existing template file, but rather
from string representation of it. `deployContract` method will help you achieve this.

### deployContract(props)

Deploys contract code specified as string. Returns transaction result.
Props object accepts following fields:

- `to` - (optional) account address, where contract will be deployed. If this is not specified, framework will 
  create new account with randomized alias.
- `contractCode` - string representation of contract
- `name` - name of the contract to be deployed. Should be the same as the name of the contract provided in `contractCode`
- `addressMap` - (optional) object to use for address mapping of existing deployed contracts
- `args` - (optional) arguments, which will be passed to contract initializer
- `update` - (optional) whether to update deployed contract. Default: `false`

Usage:

```javascript
import path from "path";
import { init, emulator, deployContract } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  init(basePath, port);
  await emulator.start(port, false);

  const to = await getAccountAddress("Alice");
  const name = "Wallet";
  const contractCode = `
        pub contract Wallet{
            init(){
                log("Thank you for the food!")
            }
        }
    `;
  const args = [1337, "Hello", { name: "Alice" }];

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

While framework have automatic import resolver for Contracts you might want to know, where it's currently deployed.
We provide a method `getContractAddress` for this.

### getContractAddress(name, useDefaults = false)

Returns address of the account, where contract currently deployed.
- `name` - name of the contract

```javascript
import { getContractAddress } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  init(basePath, port);
  await emulator.start(port, false);
  
  // if we ommit "to"
  await deployContractByName({ name: "HelloWorld" })
  
  const contract = await getContractAddress("HelloWorld");
  console.log({ contract });
};

main();
```
Framework does not support contracts with identical names deployed to different accounts.

