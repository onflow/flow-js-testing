---
title: FLOW Token Management
sidebar_title: FLOW Token
description: How to mint FLOW Token
---

## FLOW

Some actions on the network will require an account to have a certain amount of FLOW (tokens) - transaction and storage fees, account creation, etc.
Framework provides a method to query FLOW balances with `getFlowBalance` and mint new tokens via `mintFlow`.

## `getFlowBalance(address)`

Returns current FLOW token balance of the specified account.

#### Arguments

| Name      | Type                                                | Description                     |
| --------- | --------------------------------------------------- | ------------------------------- |
| `address` | [Address](https://docs.onflow.org/fcl/reference/api/#address) | address of the account to check |

#### Returns

| Type     | Description                                            |
| -------- | ------------------------------------------------------ |
| `string` | UFix64 amount of FLOW tokens stored in account storage |

#### Usage

```javascript
import { init, emulator, getAccountAddress, getFlowBalance } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  const Alice = await getAccountAddress("Alice");

  const [result, error] = await getFlowBalance(Alice);
  console.log(result, error);

  await emulator.stop();
};

main();
```

## `mintFlow(recipient, amount)`

Sends transaction to mint the specified amount of FLOW and send it to recipient.

> ⚠️ **Required:** Framework shall be initialized with `init` method for this method to work.

#### Arguments

| Name        | Type                                                | Description                                                |
| ----------- | --------------------------------------------------- | ---------------------------------------------------------- |
| `recipient` | [Address](https://docs.onflow.org/fcl/reference/api/#address) | address of the account to check                            |
| `amount`    | string                                              | UFix64 amount of FLOW tokens to mint and send to recipient |

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
  const [mintResult, error] = await mintFlow(Alice);
  console.log( mintResult, error );

  await emulator.stop();
};

main();
```

## FUSD

You can also mint FUSD similarly to how you mint FLOW Token

## `getFUSDBalance(address)`

Returns current FUSD token balance of the specified account.

#### Arguments

| Name      | Type                                                | Description                     |
| --------- | --------------------------------------------------- | ------------------------------- |
| `address` | [Address](https://docs.onflow.org/fcl/reference/api/#address) | address of the account to check |

#### Returns

| Type     | Description                                            |
| -------- | ------------------------------------------------------ |
| `string` | UFix64 amount of FUSD tokens stored in account storage |

#### Usage

```javascript
import { init, emulator, getFUSDBalance } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  const Alice = await getAccountAddress("Alice");

  const [result, error] = await getFUSDBalance(Alice);
  console.log(result, error);

  await emulator.stop();
};

main();
```

## `mintFUSD(recipient, amount)`

Sends transaction to mint the specified amount of FUSD and send it to recipient.

> ⚠️ **Required:** Framework shall be initialized with `init` method for this method to work.

#### Arguments

| Name        | Type                                                | Description                                                |
| ----------- | --------------------------------------------------- | ---------------------------------------------------------- |
| `recipient` | [Address](https://docs.onflow.org/fcl/reference/api/#address) | address of the account to check                            |
| `amount`    | string                                              | UFix64 amount of FUSD tokens to mint and send to recipient |

#### Usage

```javascript
import { init, emulator, mintFUSD } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  const Alice = await getAccountAddress("Alice");
  const amount = "42.0";
  const [mintResult, error] = await mintFUSD(Alice);
  console.log( mintResult, error );

  await emulator.stop();
};

main();
```

Note: in order to transfer flow from one account to the other, you must either run `getFUSDBalance` or `mintFUSD` for both accounts. These functions  create and store the FUSD vault. The storage path is `/storage/fusdVault` and the receiver is in `/public/fusdReceiver`