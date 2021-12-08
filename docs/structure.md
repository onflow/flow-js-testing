---
title: Folder Structure
sidebar_title: Folder Structure
description: How to structure your Cadence files
---

Currently, Framework expects a specific hierarchy of files inside your base directory.
There are no rules that enforce the name of the ase directory, but there should be 3 folders inside with names:

- `contracts`
- `transactions`
- `scripts`

Each of those folders shall store corresponding templates types, i.e. `contracts` folder stores contract templates.

You can have nested folders inside them, but templates in each of those root folders would be treated as of certain
type. For example:

## Usage

#### File is in the root of `scripts` folder

For this simple case you just need to specify name of the file

```javascript
// Let's assume your base folder is one level above your test
const basePath = path.resolve("../cadence");
const [result, error] = await executeScript("log-message");
```

#### File is in nested folder

Let's assume template you want to execute is in `scripts/utility/log-message`
In this case you will need to provide a path relative to `scripts` folder (no `/` prefix needed)

```javascript
// Let's assume your base folder is one level above your test
const basePath = path.resolve("../cadence");
const [result, error] = await executeScript("utility/log-message");
```
