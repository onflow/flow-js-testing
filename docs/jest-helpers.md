---
title: Jest Helpers
sidebar_title: Jest Helpers
description: Helper methods for Jest
---

In order to simplify the process even further we've created several Jest-based methods, which will help you to catch
thrown errors and ensure your code works as intended.

## `shallPass(ix)`

Ensure transaction did not throw and was sealed.

#### Arguments

| Name | Type                        | Description                                          |
| ---- | --------------------------- | ---------------------------------------------------- |
| `ix` | [Interaction](types/#Interaction)  | interaction, either in form of a Promise or function |

#### Returns

| Type                                    | Description        |
| --------------------------------------- | ------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/api/#responseobject) | Transaction result |

#### Usage

```javascript
import path from "path";
import {
  init,
  emulator,
  shallPass,
  sendTransaction,
  getAccountAddress,
} from "js-testing-framework";

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(10000);

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence");
    const port = 8080;
    await init(basePath, { port });
    return emulator.start(port);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  test("basic transaction", async () => {
    const code = `
      transaction(message: String){
        prepare(singer: AuthAccount){
          log(message)
        }
      }
    `;
    const Alice = await getAccountAddress("Alice");
    const signers = [Alice];
    const args = ["Hello, Cadence"];

    const [txResult, error] = await shallPass(
      sendTransaction({
        code,
        signers,
        args,
      }),
    );

    // Transaction result will hold status, events and error message
    console.log(txResult, error);
  });
});
```

## shallRevert(ix)

Ensure interaction throws an error. Use this to test incorrect inputs.
Returns Promise, which contains result, when resolved.

#### Arguments

| Name | Type                        | Description                                          |
| ---- | --------------------------- | ---------------------------------------------------- |
| `ix` | [Interaction](types/#Interaction) | transaction, either in form of a Promise or function |

#### Returns

| Type                                    | Description        |
| --------------------------------------- | ------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/api/#responseobject) | Transaction result |

#### Usage

```javascript
import path from "path";
import {
  init,
  emulator,
  shallPass,
  sendTransaction,
  getAccountAddress,
} from "js-testing-framework";

// We need to set timeout for a higher number, cause some interactions might need more time
jest.setTimeout(10000);

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence");
    const port = 8080;
    await init(basePath, { port });
    return emulator.start(port);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  test("basic transaction", async () => {
    const code = `
      transaction(message: String){
        prepare(singer: AuthAccount){
          panic("You shall not pass!")
        }
      }
    `;
    const Alice = await getAccountAddress("Alice");
    const signers = [Alice];
    const args = ["Hello, Cadence"];

    const [txResult, error] = await shallRevert(
      sendTransaction({
        code,
        signers,
        args,
      }),
    );

    // Transaction result will hold status, events and error message
    console.log(txResult, error);
  });
});
```

## shallResolve(ix)

Ensure interaction resolves without throwing errors.

#### Arguments

| Name | Type                        | Description                                          |
| ---- | --------------------------- | ---------------------------------------------------- |
| `ix` | [Interaction](types/#Interaction) | interaction, either in form of a Promise or function |

#### Returns

| Type                                    | Description        |
| --------------------------------------- | ------------------ |
| [ResponseObject](https://docs.onflow.org/fcl/api/#responseobject) | Transaction result |

#### Usage

```javascript
import path from "path";
import { init, emulator, shallPass, executeScript } from "js-testing-framework";

// We need to set timeout for a higher number, cause some interactions might need more time
jest.setTimeout(10000);

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence");
    const port = 8080;
    await init(basePath, { port });
    return emulator.start(port);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  test("basic script", async () => {
    const code = `
      pub fun main():Int{
        return 42
      }
    `;

    const [result, error] = await shallResolve(
      executeScript({
        code,
      }),
    );

    expect(result).toBe(42);
    expect(error).toBe(null);
  });
});
```
