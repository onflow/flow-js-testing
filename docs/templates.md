---
title: Template Code
sidebar_title: Templates
description: How to manage load Cadence template code
---

The Flow JS Testing Framework is essentially a set of helper methods. They can be used in an
opinionated way, envisioned by Flow Team. Or they can work as building blocks, allowing developers to build their own
testing solution as they see fit. Following methods used inside other framework methods, but we feel encouraged to list
them here as well.

## `getTemplate(file, addressMap, byAddress)`

Returns Cadence template as string with addresses replaced using addressMap

| Name         | Type                           | Optional | Description                                                                                               |
| ------------ | ------------------------------ | -------- | --------------------------------------------------------------------------------------------------------- |
| `file`       | string                         |          | relative (to the place from where the script was called) or absolute path to the file containing the code |
| `addressMap` | [AddressMap](./api.md#addressmap) | ✅       | object to use for address mapping of existing deployed contracts. Default: `{}`                           |
| `byAddress`  | boolean                        | ✅       | whether addressMap is `{name:address}` or `{address:address}` type. Default: `false`                      |

#### Returns

| Type   | Description                 |
| ------ | --------------------------- |
| string | content of a specified file |

#### Usage

```javascript
import path from "path";
import { init, getTemplate } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  init(basePath);

  const template = await getTemplate("../cadence/scripts/get-name.cdc");
  console.log({ template });
};

main();
```

## `getContractCode(name, addressMap)`

Returns Cadence template from file with `name` in `_basepath_/contracts` folder

#### Arguments

| Name         | Type                           | Optional | Description                                                      |
| ------------ | ------------------------------ | -------- | ---------------------------------------------------------------- |
| `name`       | string                         |          | name of the contract template                                    |
| `addressMap` | [AddressMap](./api.md#addressmap) | ✅       | object to use for address mapping of existing deployed contracts |

#### Returns

| Type   | Description                                  |
| ------ | -------------------------------------------- |
| string | Cadence template code for specified contract |

#### Usage

```javascript
import path from "path";
import { init, emulator, getContractCode } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  // Let's assume we need to import MessageContract
  await deployContractByName({ name: "MessageContract" });
  const MessageContract = await getContractAddress("MessageContract");
  const addressMap = { MessageContract };

  const contractTemplate = await getContractCode("HelloWorld", {
    MessageContract,
  });
  console.log({ contractTemplate });

  await emulator.stop();
};

main();
```

## `getTransactionCode(name, addressMap)`

Returns Cadence template from file with `name` in `_basepath_/transactions` folder

#### Arguments

| Name         | Type                           | Optional | Description                                                      |
| ------------ | ------------------------------ | -------- | ---------------------------------------------------------------- |
| `name`       | string                         |          | name of the transaction template                                 |
| `addressMap` | [AddressMap](./api.md#addressmap) | ✅       | object to use for address mapping of existing deployed contracts |

#### Returns

| Type   | Description                                     |
| ------ | ----------------------------------------------- |
| string | Cadence template code for specified transaction |

#### Usage

```javascript
import path from "path";
import { init, emulator, getTransactionCode } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  // Let's assume we need to import MessageContract
  await deployContractByName({ name: "MessageContract" });
  const MessageContract = await getContractAddress("MessageContract");
  const addressMap = { MessageContract };

  const txTemplate = await getTransactionCode({
    name: "set-message",
    addressMap,
  });
  console.log({ txTemplate });

  await emulator.stop();
};

main();
```

## `getScriptCode(name, addressMap)`

Returns Cadence template from file with `name` in `_basepath_/scripts` folder

#### Arguments

| Name         | Type                           | Optional | Description                                                      |
| ------------ | ------------------------------ | -------- | ---------------------------------------------------------------- |
| `name`       | string                         |          | name of the script template                                      |
| `addressMap` | [AddressMap](./api.md#addressmap) | ✅       | object to use for address mapping of existing deployed contracts |

#### Returns

| Type   | Description                                |
| ------ | ------------------------------------------ |
| string | Cadence template code for specified script |

#### Usage

```javascript
import path from "path";
import { init, emulator, getScriptCode } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  // Let's assume we need to import MessageContract
  await deployContractByName({ name: "MessageContract" });
  const MessageContract = await getContractAddress("MessageContract");
  const addressMap = { MessageContract };

  const scriptTemplate = await getScriptCode({
    name: "get-message",
    addressMap,
  });

  console.log({ scriptTemplate });
  await emulator.stop();
};

main();
```

## Examples

If you don't have any contract dependencies, you can use those methods without specifying address map as second parameter.

```javascript
import path from "path";
import { init, getContractCode, getTransactionCode, getScriptCode } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  await init(basePath);

  const contractWallet = await getContractCode({ name: "Wallet" });
  const txGetCapability = await getTransactionCode({ name: "get-capability" });
  const scriptGetBalance = await getScriptCode({ name: "get-balance" });

  console.log({ contractWallet, txGetCapability, scriptGetBalance });
};
main();
```
