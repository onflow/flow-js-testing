---
title: Init Framework
sidebar_title: Init
description: How to init framework
---

For Framework to operate properly you need to initialize it first.
You can do it with provided `init` method.

### init( basePath, options)

Initializes framework variables and specifies port to use for HTTP and grpc access.
`port` is set to 8080 by default. gRPC port is calculated to `3569 + (port - 8080)` to allow multiple instances
of emulator to be run in parallel.

#### Arguments

| Name       | Type   | Optional | Description                                           |
| ---------- | ------ | -------- | ----------------------------------------------------- |
| `bastPath` | string |          | path to the folder holding all Cadence template files |
| `options`  | object | ✅       | options object to use during initialization           |

#### Options

| Name   | Type | Optional | Description                     |
| ------ | ---- | -------- | ------------------------------- |
| `port` |      | ✅       | http port for access node       |
| `pkey` |      | ✅       | private key for service account |

#### Usage

```javascript
import path from "path";
import { init } from "flow-js-testing";

describe("test setup", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence");
    await init(basePath);

    // alternatively you can pass specific port
    // await init(basePath, {port: 8085})
  });
});
```
