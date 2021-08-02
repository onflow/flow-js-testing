---
title: Flow Javascript Testing
sidebar_title: Introduction
description: A Javascript Framework allowing you to test your Cadence code in a simple way
---

### The Problem

Writing smart contracts is quite complex task. With help of language server you can catch some simple bugs during
development - wrong types, spelling errors, etc. Checking interaction behaviour is harder, since you will need to
implement network interaction using methods provided by SDKs. It's not uncommon that smart contract and
integration engineers are two different people and thus this can create additional friction for the project.

### The Solution

Flow Javascript Testing Framework aims to reduce said complexity by providing a set of helpful methods allowing
you easily:

- [start and stop new emulator instance](#emulator)
- [deploy contracts](#contracts)
- [create new accounts](#accounts)
- [send transactions](#send-transactions)
- [execute scripts](#execute-scripts)
- [query balances and mint FLOW for specific account](#flow-token)

Framework will also handle private keys to sign transactions, automatically resolve import statements (provided,
that necessary contracts are deployed), so you can focus on writing Cadence code.

## Which testing library to choose?

Examples provided in this documentation are using Jest to showcase the process, but most methods in the
framework are agnostic of any testing library - except the ones using Jest explicitly. Meaning you can use whatever you feel
more comfortable with.

## Installation

Follow [these steps](https://docs.onflow.org/flow-js-testing/install) to add framework to your project.
