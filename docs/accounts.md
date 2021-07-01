---
title: Account Management
sidebar_title: Accounts
description: How to manage accounts addresses
---

Accounts are generated on Flow and not derived from private key. This creates an issue for testing, since 
you need to create actors in a specific order to use their addresses properly.

In order to reduce this friction we made a handy method `getAccountAddress`, which allows you to access specific address 
by it is alias. This way you can think about actual actors - let's say usual crypto "suspects" `Alice` and `Bob` -  and 
not which address they have.

It also helps you to write tests in sequential and non-sequential way, since calling the method with the same 
alias again will return existing address without creating new account.

### getAccountAddress(name: string)

Resolves name alias to a Flow address (`0x` prefixed).
If account with specific name has not been previously accessed framework will first create a new one and  then store 
it under provided alias. 
Next time when you call this method, it will grab exactly the same account. This allows you to create several accounts first
and then use them throughout your code, without worrying that accounts match or trying to store/handle specific addresses.

```javascript
import { getAccountAddress } from "flow-js-testing";

const main = async () => {
  const Alice = await getAccountAddress("Alice");
  console.log({ Alice });
};

main();
```