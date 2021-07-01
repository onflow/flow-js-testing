---
title: Install Flow Javascript Testing Framework
description: How to install the Flow command-line interface (CLI)
---

# Installation
If you have a non-JS project, you will need to initiate project in your test folder first with:
```shell
npm init
```
Then install all necessary packages by running following command in terminal
```shell
npm install flow-js-testing jest @babel/core @babel/preset-env babel-jest @onflow/types
```

If your project is Javascript based, then run aforementioned command from the folder, where you have `package.json` file.

### Jest Config
We need to configure Jest slightly in order for tests to work properly.
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