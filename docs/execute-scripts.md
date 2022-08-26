---
title: Execute Scripts
sidebar_title: Execute Scripts
description: How to execute scripts
---

It is often the case that you need to query current state of the network. For example, to check balance of the
account, read public value of the contract or ensure that user has specific resource in their storage.

We abstract this interaction into single method called `executeScript`. Method have 2 different signatures.

> ⚠️ **Required:** Your project must follow the [required structure](./structure.md) it must be [initialized](./init.md) to use the following functions.

## `executeScript(props)`

Provides explicit control over how you pass values.

#### Arguments

`props` object accepts following fields:

| Name           | Type                                                | Optional | Description                                                                                |
| -------------- | --------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `code`         | string                                              | ✅       | string representation of Cadence script                                                    |
| `name`         | string                                              | ✅       | name of the file in `scripts` folder to use (sans `.cdc` extension)                        |
| `args`         | [any]                                               | ✅       | an array of arguments to pass to script. Optional if script does not expect any arguments. |
| `transformers` | [[CadenceTransformer](./api.md#cadencetransformer)] | ✅       | an array of operators to modify the code, before submitting it to network                  |

> ⚠️ **Required:** Either `code` or `name` field shall be specified. Method will throw an error if both of them are empty.
> If `name` field provided, framework will source code from file and override value passed via `code` field.

#### Returns

| Type                                                                        | Description   |
| --------------------------------------------------------------------------- | ------------- |
| [ResponseObject](https://docs.onflow.org/fcl/reference/api/#responseobject) | Script result |

#### Usage

```javascript
import path from "path"
import {init, emulator, executeScript} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  // Init framework
  init(basePath)
  // Start emulator
  await emulator.start()

  // Define code and arguments we want to pass
  const code = `
    pub fun main(message: String): Int{
      log(message)

      return 42
    }
  `
  const args = ["Hello, from Cadence"]

  const [result, error, logs] = await executeScript({code, args})
  console.log({result}, {error}, {logs})

  // Stop emulator instance
  await emulator.stop()
}

main()
```

## `executeScript(name: string, args: [any])`

This signature provides simplified way of executing a script, since most of the time you will utilize existing
Cadence files.

#### Arguments

| Name   | Type   | Optional | Description                                                                                            |
| ------ | ------ | -------- | ------------------------------------------------------------------------------------------------------ |
| `name` | string |          | name of the file in `scripts` folder to use (sans `.cdc` extension)                                    |
| `args` | [any]  | ✅       | an array of arguments to pass to script. Optional if scripts don't expect any arguments. Default: `[]` |

#### Returns

| Type                                                                        | Description   |
| --------------------------------------------------------------------------- | ------------- |
| [ResponseObject](https://docs.onflow.org/fcl/reference/api/#responseobject) | Script result |

#### Usage

```javascript
import path from "path"
import {init, emulator, executeScript} from "@onflow/flow-js-testing"

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence")

  // Init framework
  init(basePath)
  // Start emulator
  await emulator.start()

  // Define arguments we want to pass
  const args = ["Hello, from Cadence"]

  // We assume there is a file `scripts/log-message.cdc` under base path
  const [result, error, logs] = await executeScript("log-message", args)
  console.log({result}, {error}, {logs})

  await emulator.stop()
}

main()
```
