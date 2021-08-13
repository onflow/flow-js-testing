---
title: Bootstrap Framework
sidebar_title: Bootstrap Framework
description: How to quickly init testing environment
---

### Init Testing Environment

Bootstrap your testing environment with a single command:

```shell
npx flow-js-testing init
```

When you run this command in the terminal it will initiate npm package in your current directory and create `package.json` file.
Then it will install dependencies. After the installation is finished, the utility will create the required config files for Babel, Jest and Flow CLI.

> ⚠️ **Warning:** This command will overwrite `babel.config.sj`, `jest.config.js` and `flow.json` files in the folder, where
> it would be executed and also could affect your `package.json` file. That's why we advise you to use new empty folder
> to contain your Cadence related tests.

### Generate New Test Suit

Create a test suit file for your project with all necessary imports and setup for describe blocks.
You can start writing your asserts and expectations right away:

```shell
npx flow-js-testing make [name]
```

#### Flags

| Name                  | Description                          |
| --------------------- | ------------------------------------ |
| `-c` or `--clear`     | Exclude comments from test suit code |
| `-b` or `--base-path` | Specify base path to Cadence folder  |

If you do not specify `name` as second argument, the tool will give your file a unique name.
