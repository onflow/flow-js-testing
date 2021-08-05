---
title: Emulator
sidebar_title: Emulator
description: How to start a new instance of emulator
---

Flow Javascript Testing Framework exposes `emulator` singleton allowing you to run and stop emulator instance
programmatically. There are two methods available on it.

## `emulator.start(port, logging)`

Starts emulator on a specified port. Returns Promise.

#### Arguments

| Name      | Type    | Optional | Description                                                       |
| --------- | ------- | -------- | ----------------------------------------------------------------- |
| `port`    | number  | ✅       | number representing a port to use for access API. Default: `8080` |
| `logging` | boolean | ✅       | whether log messages from emulator shall be added to the output   |

#### Usage

```javascript
import { emulator, init } from "flow-js-testing";

describe("test setup", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async (done) => {
    const basePath = path.resolve(__dirname, "../cadence");
    const port = 8080;

    await init(basePath, { port });

    // Start emulator instance on port 8080
    await emulator.start(port);

    done();
  });
});
```

## `emulator.stop()`

Stops emulator instance. Returns Promise.

#### Arguments

This method does not expect any arguments.

#### Usage

```javascript
import { emulator, init } from "flow-js-testing";

describe("test setup", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async (done) => {
    const basePath = path.resolve(__dirname, "../cadence");
    const port = 8080;

    await init(basePath, { port });
    await emulator.start(port);
    done();
  });

  // Stop emulator, so it could be restarted
  afterEach(async (done) => {
    await emulator.stop();
    done();
  });
});
```