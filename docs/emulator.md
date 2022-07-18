---
title: Emulator
sidebar_title: Emulator
description: How to start a new instance of emulator
---

Flow Javascript Testing Framework exposes `emulator` singleton allowing you to run and stop emulator instance
programmatically. There are two methods available on it.

## `emulator.start(options)`

Starts emulator on random available port, unless overriden in options. Returns Promise.

#### Arguments

| Name      | Type            | Optional | Description                                            |
| --------- | --------------- | -------- | ------------------------------------------------------ |
| `options` | EmulatorOptions | ✅       | an object containing options for starting the emulator |

#### EmulatorOptions

| Key         | Type    | Optional | Description                                                                       |
| ----------- | ------- | -------- | --------------------------------------------------------------------------------- |
| `logging`   | boolean | ✅       | whether log messages from emulator shall be added to the output (default: false)  |
| `flags`     | string  | ✅       | custom command-line flags to supply to the emulator (default: "")                 |
| `adminPort` | number  | ✅       | override the port which the emulator will run the admin server on (default: auto) |
| `restPort`  | number  | ✅       | override the port which the emulator will run the REST server on (default: auto)  |
| `grpcPort`  | number  | ✅       | override the port which the emulator will run the GRPC server on (default: auto)  |

#### Returns

| Type                | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| [Promise](#Promise) | Promise, which resolves to true if emulator started successfully |

#### Usage

```javascript
import {emulator, init} from "@onflow/flow-js-testing"

describe("test setup", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence")

    await init(basePath)

    // Start emulator instance on auto-selected available ports
    await emulator.start()
  })
})
```

## `emulator.stop()`

Stops emulator instance. Returns Promise.

#### Arguments

This method does not expect any arguments.

#### Usage

```javascript
import {emulator, init} from "@onflow/flow-js-testing"

describe("test setup", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence")

    await init(basePath)
    await emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    await emulator.stop()
  })
})
```

## `emulator.setLogging(newState)`

Set logging flag on emulator, allowing to temporally enable/disable logging.

#### Arguments

| Name       | Type    | Description            |
| ---------- | ------- | ---------------------- |
| `newState` | boolean | Enable/disable logging |

#### Usage

```javascript
import {emulator, init} from "@onflow/flow-js-testing"

describe("test setup", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence")

    await init(basePath)
    await emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    await emulator.stop()
  })

  test("basic test", async () => {
    // Turn on logging from begining
    emulator.setLogging(true)
    // some asserts and interactions

    // Turn off logging for later calls
    emulator.setLogging(false)
    // more asserts and interactions here
  })
})
```
