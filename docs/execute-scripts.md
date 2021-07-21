---
title: Execute Scripts
sidebar_title: Execute Scripts
description: How to execute scripts
---

It is often the case that you need to query current state of the network. For example, to check balance of the
account, read public value of the contract or ensure that user have specific resource in their storage.

We abstract this interaction into single method called `executeScript`. Method have 2 different signatures.

### executeScript(props)

Provides explicit control over how you pass values.
`props` object accepts following fields:

- `code` - string representation of Cadence script
- `name` - name of the file in `scripts` folder to use (sans `.cdc` extension)

  > Either `code` or `name` field shall be specified. Method will throw an error if both of them are empty.
  
  > If `name` field provided, framework will source code from file and override value passed via `code` field.

- `args` - (optional) an array of arguments to pass to script. Optional if script does not expect any arguments.

Usage:

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

### executeScript(name: string, args: [any])

This signature provides simplified way of executing a script, since most of the time you will utilize existing
Cadence files.

- `name` - name of the file in `scripts` folder to use (sans `.cdc` extension)
- `args` - (optional) an array of arguments to pass to script. Optional if scripts don't expect any arguments.

Usage:

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
