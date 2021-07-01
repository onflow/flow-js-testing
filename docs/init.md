---
title: Init Framework
sidebar_title: Init
description: How to init framework
---

For Framework to operate properly you need to initialize it first.
You can do it with provided `init` method.

### init( basePath: string, port: string )
Initializes framework variables and specifies port to use for HTTP and grpc access.
`port` is set to 8080 by default. grpc port is calculated to `3569 + (port - 8080)` to allow multiple instances
of emulator to be run in parallel.

- `basePath` - path to the folder holding all Cadence template files
- `port` - (optional) http port to use for access node

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