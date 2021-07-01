---
title: Emulator
sidebar_title: Emulator
description: How to start new instance of emulator
---

Flow Javascript Testing Framework exposes `emulator` singleton allowing you to run and stop emulator instance 
programmatically. There are two methods available on it.

### emulator.start(port: number, logging: boolean)

Starts emulator on a specified port.
- `port` - number representing a port to use for access API
- `logging` - (optional) whether log messages from emulator shall be added to the output

### emulator.stop
Stops emulator instance.

```javascript
import { emulator, init } from "flow-js-testing";

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
