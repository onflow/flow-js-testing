---
title: Template Code
sidebar_title: Templates
description: How to manage load Cadence template code
---

The philosophy behind Flow JS Testing Framework is to be a set of helper methods. They can be used in
opinionated way, envisioned by Flow Team. Or they can work as building blocks, allowing developers to build their own
testing solution as they see fit.

Following methods used inside other framework methods, but we feel encouraged to list them here as well.

### getTemplate(file, addressMap = {}, byAddress = false)

Returns Cadence template as string with addresses replaced using addressMap

- `file` - relative (to the place from where the script was called) or absolute path to the file containing the code
- `addressMap` - object to use for address mapping of existing deployed contracts
- `byAddress` - whether addressMap is `{name:address}` or `{address:address}` type. Default: `false`

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

### getContractCode(name, addressMap = {}, service = false)

Returns Cadence template from file with `name` in `_basepath_/contracts` folder

- `name` - name of the contract
- `addressMap` - object to use for address mapping of existing deployed contracts
- `service` - whether is this a service contract.

```javascript
import path from "path";
import { init, emulator, getContractCode } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  init(basePath, port);
  await emulator.start(port, false);

  // Let's assume we need to import MessageContract
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

### getTransactionCode(name, addressMap = {}, service = false)

Returns Cadence template from file with `name` in `_basepath_/transactions` folder

- `name` - name of the contract
- `addressMap` - object to use for address mapping of existing deployed contracts
- `service` - whether is this a service contract

```javascript
import path from "path";
import { init, emulator, getTransactionCode } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  init(basePath, port);
  await emulator.start(port, false);

  // Let's assume we need to import MessageContract
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

### getScriptCode(name, addressMap = {}, service = false)

Returns Cadence template from file with `name` in `_basepath_/scripts` folder

- `name` - name of the contract
- `addressMap` - object to use for address mapping of existing deployed contracts
- `service` - whether is this a service contract

```javascript
import path from "path";
import { init, emulator, getScriptCode } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  init(basePath, port);
  await emulator.start(port, false);

  // Let's assume we need to import MessageContract
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
  init(basePath);

  const contractWallet = await getContractCode({ name: "Wallet" });
  const txGetCapability = await getTransactionCode({ name: "get-capability" });
  const scriptGetBalance = await getScriptCode({ name: "get-balance" });

  console.log({ contractWallet, txGetCapability, scriptGetBalance });
};
main();
```
