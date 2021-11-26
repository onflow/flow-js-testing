---
title: Flow Javascript Testing
sidebar_title: Introduction
description: A Javascript Framework allowing you to test your Cadence code in a simple way
---

### The Problem

Writing smart contracts can be complex. With the help of the Cadence language server you can catch some simple bugs during development - wrong types, spelling errors, etc. Checking interaction behaviour is harder. It's not uncommon that smart contract and integration testing engineers are two different people and thus this can create additional friction for your project.

### The Solution

Flow Javascript Testing Framework aims to reduce said complexity by providing a set of helpful methods allowing
you easily:

- [Start and stop new emulator instance](emulator.md)
- [Deploy contracts](contracts.md)
- [Create new accounts](accounts.md)
- [Send transactions](send-transactions.md)
- [Execute scripts](execute-scripts.md)
- [query balances and mint FLOW for specific account](flow-token.md)

Framework will handle creating and managing the private keys you need to sign transactions, and try to automatically resolve import statements (provided, that necessary contracts deployed), so you can focus on writing Cadence code.

## Which testing library to choose?

Some examples provided in this documentation are using Jest to highlight the process, but most of the methods in
framework are agnostic of any other testing library - except for the ones using Jest explicitly. So you can use whatever you feel more comfortable with.

## Installation

Follow [these steps](install.md) to add framework to your project.
