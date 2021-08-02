---
title: Account Management
sidebar_title: Accounts
description: How to manage accounts addresses
---

## `getAccountAddress`

Resolves name alias to a Flow address (`0x` prefixed) under the following conditions:

- If account with specific name has not been previously accessed framework will first create a new one and then store it under provided alias.
- Next time when you call this method, it will grab exactly the same account. This allows you to create several accounts first and then use them throughout your code, without worrying that accounts match or trying to store/handle specific addresses.

#### Arguments

| Name    | Type   | Description                       |
| ------- | ------ | --------------------------------- |
| `alias` | string | The alias to reference or create. |

#### Returns

| Type   | Description                              |
| ------ | ---------------------------------------- |
| `string` | `0x` prefixed address of aliased account |

#### Usage

```javascript
import { getAccountAddress } from "flow-js-testing";

const main = async () => {
  const Alice = await getAccountAddress("Alice");
  console.log({ Alice });
};

main();
```
