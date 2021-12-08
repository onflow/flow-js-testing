---
title: Install Flow Javascript Testing Framework
description: How to install the Flow command-line interface (CLI)
---

# Installation

It's possible to install Flow Javacript Testing Framework manually and automatically, using generator.

## Automatic Installation (via npx)

Create new folder and move into it:

```shell
mkdir test && cd ./test
```

Generate complete setup via `init` call:

```shell
npx flow-js-testing init
```

Create new test suit via `make` call, specifying the name of the suit:

```shell
npx flow-js-testing make basic-test
```

## Manual Installation

If, for some reason, you would want to do this manually here's what you need to do.

Create new folder and move into it:

```shell
mkdir test && cd ./test
```

Initiate a project in that folder with:

```shell
npm init
```

Then install all necessary packages by running following command:

```shell
npm install flow-js-testing jest @babel/core @babel/preset-env babel-jest
```

If your project _is_ JavaScript based, then run the above command from the folder that contains your project's `package.json` file.

### Jest Config

You'll need to configure Jest in order for tests to work properly.
Add `jest.config.js` file next to `package.json` and populate it with:

```javascript
module.exports = {
  testEnvironment: "node",
  verbose: true,
  coveragePathIgnorePatterns: ["/node_modules/"],
};
```

### Babel Config

Similarly, create `babel.config.json` then copy and paste the following configuration:

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "current"
        }
      }
    ]
  ]
}
```
