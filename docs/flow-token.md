---
title: FLOW Token Management
sidebar_title: FLOW Token
description: How to mint FLOW Token
---

Some actions on the network will require account to have certain amount of FLOW token - transaction and storage fees,
account creation, etc.

Framework provides a method to query balance with `getFlowBalance` and mint new tokens via `mintFlow`. You can find
information how to use them below.

## `getFlowBalance(address)`

Fetch current FlowToken balance of account specified by address

#### Arguments

| Name      | Type                | Description                     |
| --------- | ------------------- | ------------------------------- |
| `address` | [Address](#Address) | address of the account to check |

#### Returns

| Type               | Description                                     |
| ------------------ | ----------------------------------------------- |
| [Amount](#Amount`) | amount of FLOW tokens stored in account storage |

#### Usage

```javascript
import { init, emulator, getFlowBalance } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  const Alice = await getAccountAddress("Alice");

  try {
    const result = await getFlowBalance(Alice);
    console.log({ result });
  } catch (e) {
    console.log(e);
  }

  await emulator.stop();
};

main();
```

## `mintFlow(recipient, amount)`

Sends transaction to mint specified amount of FLOW token and send it to recipient.

> ⚠️ **Required:** Framework shall be initialized with `init` method for this method to work.

#### Arguments

| Name        | Type                | Description                                         |
| ----------- | ------------------- | --------------------------------------------------- |
| `recipient` | [Address](#Address) | address of the account to check                     |
| `amount`    | [Amount](#Amount)   | amount of FLOW tokens to mint and send to recipient |

#### Usage

```javascript
import { init, emulator, mintFlow } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  const Alice = await getAccountAddress("Alice");
  const amount = "42.0";
  try {
    const mintResult = await mintFlow(Alice);
    console.log({ mintResult });
  } catch (e) {
    console.log(e);
  }

  await emulator.stop();
};

main();
```