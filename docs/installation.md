# Installation

You can get all packages by running following command in terminal
 ```
npm install flow-js-testing jest @babel/core @babel/preset-env babel-jest @onflow/types
```

### Jest Config

Add `jest.config.js` file in your test folder and populate it with:

```javascript
module.exports = {
  testEnvironment: "node",
  verbose: true,
  coveragePathIgnorePatterns: ["/node_modules/"],
};
```

### Babel Config

Create `babel.config.json`. Copy and paste there following configuration:

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
