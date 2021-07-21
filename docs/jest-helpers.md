---
title: Jest Helpers
sidebar_title: Jest Helpers
description: Helper methods for Jest
---

In order to simplify the process even further we've created several Jest-based methods, which will help you to catch
thrown errors and ensure your code works as intended.

### shallPass(ix: Promise | Function )

Ensure transaction did not throw and sealed.
Returns Promise, which contains transaction result, when resolved.

- `ix` - transaction interaction, either in form of a promise or function

Usage:

```javascript
import path from "path";
import {
  init,
  emulator,
  shallPass,
  sendTransaction,
  getAccountAddress,
} from "js-testing-framework";

// We need to set timeout for a higher number, cause some transactions might take up some time
jest.setTimeout(10000);

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files

  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence");
    const port = 8080;
    await init(basePath, port);
    return emulator.start(port, false);
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

    const txResult = await shallPass(
      sendTransaction({
        code,
        signers,
      }),
    );

    // Transaction result will hold status, events and error message
    console.log(txResult);
  });
});
```

### shallRevert(ix: Promise | Function )

Ensure interaction throws an error. You might want to use this to test incorrect inputs.
Returns Promise, which contains result, when resolved.

- `ix` - transaction interaction, either in form of a promise or function

Usage:

```javascript
import path from "path";
import {
  init,
  emulator,
  shallPass,
  sendTransaction,
  getAccountAddress,
} from "js-testing-framework";

// We need to set timeout for a higher number, cause some transactions might take up some time
jest.setTimeout(10000);

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files

  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence");
    const port = 8080;
    await init(basePath, port);
    return emulator.start(port, false);
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

    const txResult = await shallRevert(
      sendTransaction({
        code,
        signers,
      }),
    );

    // Transaction result will hold status, events and error message
    console.log(txResult);
  });
});
```

### shallResolve(ix: Promise | Function )

Ensure interaction resolves without throwing errors.

- `ix` - transaction interaction, either in form of a promise or function

Returns Promise.

```javascript
import path from "path";
import { init, emulator, shallPass, executeScript } from "js-testing-framework";

// We need to set timeout for a higher number, cause some transactions might take up some time
jest.setTimeout(10000);

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files

  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence");
    const port = 8080;
    await init(basePath, port);
    return emulator.start(port, false);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  test("basic transaction", async () => {
    const code = `
      pub fun main():Int{
        return 42
      }
    `;

    const result = await shallResolve(
      executeScript({
        code,
      }),
    );

    expect(result).toBe(42);
  });
});
```
