# JS Testing API Reference

## Accounts

### `getAccountAddress`

Resolves name alias to a Flow address (`0x` prefixed) under the following conditions:
- If account with specific name has not been previously accessed framework will first create a new one and  then store it under provided alias.
- Next time when you call this method, it will grab exactly the same account. This allows you to create several accounts first and then use them throughout your code, without worrying that accounts match or trying to store/handle specific addresses.

#### Arguments
| Name    | Type   | Description                       |
| ------- | ------ | --------------------------------- |
| `alias` | string | The alias to reference or create. |

#### Returns

| Type                              | Description                              |
| --------------------------------- | -----------------------------------      |
| [AccountObject](#AccountObject)   | A JSON representation of a Flow account. |

#### Usage

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

> ⚠️ **Required:** Your project must follow the [required structure](https://docs.onflow.org/flow-js-testing/structure) it must be [initialized](https://docs.onflow.org/flow-js-testing/init) to use the following functions.

### deployContractByName(props)

Deploys contract code located inside Cadence file. Returns transaction result.
Props object accepts following fields:

In a bit more rare case you would want to deploy contract code not from existing template file, but rather from string representation of it. `deployContract` method will help you achieve this.

:tomato: Change this to a table

- `name` - name of the file in `contracts` folder (with `.cdc` extension) and name of the contract (please note those should be the same)
- `to` - (optional) account address, where contract will be deployed. If this is not specified, framework will
  create new account with randomized alias.
- `addressMap` - (optional) object to use for address mapping of existing deployed contracts
- `args` - arguments, which will be passed to contract initializer. Optional if template does not expect any arguments.
- `update` - whether to update deployed contract. Default: `false`

:tomato: Return value needed

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

---
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
# Types

### `AccountObject`

The JSON representation of an account on the Flow blockchain.

| Key         | Value Type                    | Description                                                                                |
| ----------- | ----------------------------- | ------------------------------------------------------------------------------------------ |
| `address`   | [Address](#address)           | The address of the account                                                                 |
| `balance`   | number                        | The FLOW balance of the account in 10\*6.                                                  |
| `code`      | [Code](#code)                 | The code of any Cadence contracts stored in the account.                                   |
| `contracts` | Object: [Contract](#contract) | An object with keys as the contract name deployed and the value as the the cadence string. |
| `keys`      | [[KeyObject]](#keyobject)     | Any contracts deployed to this account.                                                    |

---

# Left Sidebar heading

## Right sidebar heading

### `functionName`

This is a short function description.

> ⚠️ **Required:** Any required steps before using the function.

📣  Any item that needs to be explained for a special use case or adds additional explanation

- Conditions or special logic the user needs to be aware about in the function.

#### Arguments
| Name    | Type   | Description                       |
| ------- | ------ | --------------------------------- |
| `descriptiveParamName` | JS-Type | Description |

#### Returns

| Type                              | Description                              |
| --------------------------------- | -----------------------------------      |
| JS-ReturnType   | Description |

#### Usage

```javascript
import { getAccountAddress } from "flow-js-testing";

const main = async () => {
  const Alice = await getAccountAddress("Alice");
  console.log({ Alice });
};

main();
```
---
