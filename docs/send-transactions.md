---
title: Send Transactions
sidebar_title: Send Transactions
description: How to send transactions
---

Another common case is necessity to mutate network state - sending tokens from one account to another, minting new
NFT, etc. Framework provides `sendTransaction` method to achieve this. This method have 2 different signatures.

### sendTransaction(props)

Provides explicit control over how you pass values.
`props` object accepts following fields:

- `code` - string representation of Cadence transaction
- `name` - name of the file in `transactions` folder to use (sans `.cdc` extension)

  > Either `code` or `name` field shall be specified. Method will throw an error if both of them are empty.

  > If `name` field provided, framework will source code from file and override value passed via `code` field.

- `args` - (optional) an array of arguments to pass to transaction. Optional if transaction does not expect any
  arguments.
- `signers` - (optional) list of account addresses, who will authorize this transaction
  > if `signers` field not provided, service account will be used to authorize the transaction
- `addressMap` - (optional) name/address map to use as lookup table for addresses in import statements

> Pass `addressMap` only in cases, when you would want to override deployed contract. Otherwide
> imports can be resolved automatically without explicitly passing them via `addressMap` field

Usage:

```javascript
import path from "path";
import { init, emulator, sendTransaction, getAccountAddress } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  // Init framework
  init(basePath, port);
  // Start emulator
  await emulator.start(port, false);

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

  // If something wrong with transaction execution method will throw an error,
  // so we need to catch it and process
  try {
    const tx = await sendTransaction({ code, args, signers });
    console.log({ tx });
  } catch (e) {
    console.error(e);
  }

  // Stop emulator instance
  await emulator.stop();
};

main();
```

### sendTransaction(name: string, args: [any], signers: [string])

This signature provides simplified way to send a transaction, since most of the time you will utilize existing
Cadence files.

- `name` - name of the file in `transaction` folder to use (sans `.cdc` extension)
- `args` - (optional) an array of arguments to pass to transaction. Optional if transaction does not expect any 
  arguments.
- `signers` - (optional) list of account addresses, who will authorize this transaction

Usage:

```javascript
import path from "path";
import { init, emulator, sendTransaction } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  // Init framework
  init(basePath, port);
  // Start emulator
  await emulator.start(port, false);

  // Define arguments we want to pass
  const args = ["Hello, Cadence"];
  
  try {
    const tx = await sendTransaction("log-message", args);
    console.log({ tx });
  } catch (e) {
    console.error(e);
  }
};

main();
```
