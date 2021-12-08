---
title: Additional Examples
sidebar_title: Additional Examples
description: More examples, which cover specific use cases
---

## Metadata

You may want to pass dictionaries as arguments to your Cadence code. The most
common is metadata with `{String:String}` type

```javascript
import { executeScript } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  // Init framework
  await init(basePath, { port });
  // Start emulator
  await emulator.start(port);

  const code = `
    pub fun main(metadata: {String: String}): String{
      return metadata["name"]!
    }  
  `;

  // Define arguments we want to pass
  const args = [{ name: "Boris", nickname: "The Blade" }];

  // If something goes wrong with script execution, the method will throw an error
  // so we need to catch it and proce
  const [name, err] = await shallResolve(executeScript({ code, args }));
  console.log( name, err );

  await emulator.stop();
};

main();
```

If you need to pass an array of dictionaries, it's not that different. Just replace the `args` variable above with
multiple values:

```javascript
const args = [
  // This is array of dictionaries
  [
    { name: "Boris", nickname: "The Blade" },
    { name: "Franky", nickname: "Four-Fingers" },
  ],
];
```

Or maybe you want to pass dictionary with type {String: [String]}:

```javascript
const args = [
  {
    names: ["Alice", "Bob", "Charlie"],
  },
];
```

Framework will try to resolve the types to the best of its abilities. If you encounter an error for your use case,
please create an issue here: [https://github.com/onflow/flow-js-testing/issues](https://github.com/onflow/flow-js-testing/issues)