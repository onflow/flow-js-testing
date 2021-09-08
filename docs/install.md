---
title: Install Flow Javascript Testing Framework
description: How to install the Flow command-line interface (CLI)
---

# Installation

If you have a non-JS project, you will need to initiate a project in your test folder first with:

```shell
npm init
```

Then install all necessary packages by running following command:

```shell
npm install flow-js-testing jest @babel/core @babel/preset-env babel-jest @onflow/types
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
