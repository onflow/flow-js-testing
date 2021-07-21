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
Flow Javascript Testing Framework aims to reduce it by providing a set of helpful methods out of the box, allowing 
you easily:
- start and stop new emulator instance
- deploy contracts
- create new accounts
- send transactions
- execute scripts
- add FLOW to account's balance

Framework will also handle private keys to sign transactions, try to automatically resolve import statements (provided, 
that necessary contracts deployed), so you can focus on writing Cadence code.

## Which testing library to choose?
Some examples provided in this documentation are using Jest to highlight the process, but most of the methods in 
framework are agnostic of testing library - except for the ones using Jest explicitly. So you can use whatever you feel 
more comfortable with. 

## Installation
Follow [these steps](https://docs.onflow.org/flow-js-testing/install) to add framework to your project.