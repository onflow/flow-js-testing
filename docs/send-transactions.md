---
title: Send Transactions
sidebar_title: Send Transactions
description: How to send transactions
---

Another common case is interactions that mutate network state - sending tokens from one account to another, minting new NFT, etc. Framework provides `sendTransaction` method to achieve this. This method have 2 different signatures.

> ⚠️ **Required:** Your project must follow the [required structure](https://docs.onflow.org/flow-js-testing/structure) it must be [initialized](https://docs.onflow.org/flow-js-testing/init) to use the following functions.

## `sendTransaction(props)`

Send transaction to network.
Provides explicit control over how you pass values.

#### Arguments

`props` object accepts following fields:

| Name         | Type                           | Optional | Description                                                                                          |
| ------------ | ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `code`       | string                         | ✅       | string representation of Cadence transaction                                                         |
| `name`       | string                         | ✅       | name of the file in `transaction` folder to use (sans `.cdc` extension)                              |
| `args`       | [Any]                          | ✅       | an array of arguments to pass to transaction. Optional if transaction does not expect any arguments. |
| `signers`    | [Address]                      | ✅       | an array of [Address](#Address) representing transaction autorizers                                  |
| `addressMap` | [AdressMap](types/#AddressMap) | ✅       | name/address map to use as lookup table for addresses in import statements                           |

> ⚠️ **Required:** Either `code` or `name` field shall be specified. Method will throw an error if both of them are empty.
> If `name` field provided, framework will source code from file and override value passed via `code` field.

> 📣 if `signers` field not provided, service account will be used to authorize the transaction.

> 📣 Pass `addressMap` only in cases, when you would want to override deployed contract. Otherwide
> imports can be resolved automatically without explicitly passing them via `addressMap` field

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
  console.log(tx, error);
  
  // Stop emulator instance
  await emulator.stop();
};

main();
```

## `sendTransaction(name, signers, args)`

This signature provides simplified way to send a transaction, since most of the time you will utilize existing
Cadence files.

| Name      | Type      | Optional | Description                                                                                          |
| --------- | --------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `name`    | string    | ✅       | name of the file in `transaction` folder to use (sans `.cdc` extension)                              |
| `args`    | [Any]     | ✅       | an array of arguments to pass to transaction. Optional if transaction does not expect any arguments. |
| `signers` | [Address] | ✅       | an array of [Address](#Address) representing transaction autorizers                                  |

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

  const [tx, error] = await sendTransaction("log-message", [], args);
  console.log(tx, error);
};

main();
```
