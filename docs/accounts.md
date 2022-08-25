---
title: Account Management
sidebar_title: Accounts
description: How to manage accounts addresses
---

## Overview

Flow accounts are not derived from a private key. This creates an issues for testing, since
you need to create actors in a specific order to use their addresses properly.

To reduce this friction, `getAccountAddress`, allows you to access a specific address using an alias. This way you can think about actual actors -- for example `Alice` and `Bob` -- without needing to know their Flow addresses.

It also helps you to write tests in a sequential or non-sequential way. Calling this method for the first time will create a new account and return the address. Calling it a second time with the same alias again will return the Flow address for that account, without creating new account.

## Private Key Management

#### Universal private key

By default, accounts created and consumed by the Flow JS Testing library will use a universal private key for signing transactions. Generally, this alleviates the burden of any low-level key management and streamlines the process of testing cadence code.

#### Custom private keys

However, under some circumstances the user may wish to create accounts (see: [`createAccount`](./accounts.md#createaccountname-keys)) or sign for accounts (see: [`sendTransaction`](./send-transactions.md)) using custom private keys (i.e. private key value, [hashing algorithm](./api.md#hashalgorithm), [signing algorithm](./send-transactions.md#signaturealgorithm), etc.) - this functionality is facilitated by the aforementioned methods.

## `getAccountAddress`

Resolves name alias to a Flow address (`0x` prefixed) under the following conditions:

- If an account with a specific name has not been previously accessed, the framework will create a new one and then store it under the provided alias.
- Next time when you call this method, it will grab exactly the same account. This allows you to create several accounts up-front and then use them throughout your code, without worrying that accounts match or trying to store and manage specific addresses.

#### Arguments

| Name    | Type   | Description                       |
| ------- | ------ | --------------------------------- |
| `alias` | string | The alias to reference or create. |

#### Returns

| Type                                                          | Description                              |
| ------------------------------------------------------------- | ---------------------------------------- |
| [Address](https://docs.onflow.org/fcl/reference/api/#address) | `0x` prefixed address of aliased account |

#### Usage

```javascript
import {getAccountAddress} from "@onflow/flow-js-testing"

const main = async () => {
  const Alice = await getAccountAddress("Alice")
  console.log({Alice})
}

main()
```

## `createAccount({name, keys})`

In some cases, you may wish to manually create an account with a particular set of private keys

#### Options

_Pass in the following as a single object with the following keys._

| Key    | Type                                                                 | Required | Description                                                                                                                                                                                            |
| ------ | -------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name` | string                                                               | No       | human-readable name to be associated with created account (will be used for address lookup within [getAccountAddress](./accounts.md#getaccountaddress))                                                             |
| `keys` | [[KeyObject](./api.md#keyobject) or [PublicKey](./api.md#publickey)] | No       | An array of [KeyObjects](#./api.md#keyobject) or [PublicKeys](./api.md#publickey) to be added to the account upon creation (defaults to the [universal private key](./accounts#universal-private-key)) |

> 📣 if `name` field not provided, the account address will not be cached and you will be unable to look it up using [`getAccountAddress`](./accounts.md#getaccountaddress).

#### Returns

| Type                                                          | Description                              |
| ------------------------------------------------------------- | ---------------------------------------- |
| [Address](https://docs.onflow.org/fcl/reference/api/#address) | `0x` prefixed address of created account |