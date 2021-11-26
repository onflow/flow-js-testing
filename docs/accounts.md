---
title: Account Management
sidebar_title: Accounts
description: How to manage accounts addresses
---

Flow accounts are not derived from a private key. This creates an issues for testing, since
you need to create actors in a specific order to use their addresses properly.
In order to reduce this friction we made a handy method `getAccountAddress`, which allows you to access specific address using an alias. This way you can think about actual actors - for example `Alice` and `Bob` - without needing to know their Flow addresses.
It also helps you to write tests in a sequential or non-sequential way. Calling this method for the first time will create a new account and return the address. Calling it a second time with the same alias again will return the Flow address for that account, without creating new account.

## `getAccountAddress`

Resolves name alias to a Flow address (`0x` prefixed) under the following conditions:

- If an account with a specific name has not been previously accessed, the framework will create a new one and then store it under the provided alias.
- Next time when you call this method, it will grab exactly the same account. This allows you to create several accounts up-front and then use them throughout your code, without worrying that accounts match or trying to store and manage specific addresses.

#### Arguments

| Name    | Type   | Description                       |
| ------- | ------ | --------------------------------- |
| `alias` | string | The alias to reference or create. |

#### Returns

| Type                                                | Description                              |
| --------------------------------------------------- | ---------------------------------------- |
| [Address](https://docs.onflow.org/fcl/reference/api/#address) | `0x` prefixed address of aliased account |

#### Usage

```javascript
import { getAccountAddress } from "flow-js-testing";

const main = async () => {
  const Alice = await getAccountAddress("Alice");
  console.log({ Alice });
};

main();
```
