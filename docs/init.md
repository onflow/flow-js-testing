---
title: Init Framework
sidebar_title: Init
description: How to init framework
---

For Framework to operate properly you need to initialize it first.
You can do it with provided `init` method.

### init( basePath, options)

Initializes framework variables.

#### Arguments

| Name       | Type   | Optional | Description                                           |
| ---------- | ------ | -------- | ----------------------------------------------------- |
| `basePath` | string |          | path to the folder holding all Cadence template files |
| `options`  | object | ✅       | options object to use during initialization           |

#### Options

| Name   | Type | Optional | Description                     |
| ------ | ---- | -------- | ------------------------------- |
| `pkey` |      | ✅       | private key for service account |

#### Usage

```javascript
import path from "path"
import {init} from "@onflow/flow-js-testing"

describe("test setup", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence")
    await init(basePath)

    // alternatively you can pass specific port
    // await init(basePath, {port: 8085})
  })
})
```
