---
title: Additional Examples
sidebar_title: Additional Examples
description: More examples, which cover specific use cases
---

## Metadata

One of the most frequent questions we receive over Discord is about how to pass dictionaries as arguments. The most
common is metadata with `{String:String}` type. While JS SDK

```javascript
import { executeScript } from "flow-js-testing";

const main = async () => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;

  // Init framework
  init(basePath, port);
  // Start emulator
  await emulator.start(port, false);

  const code = `
    pub fun main(metadata: {String: String}): String{
      return metadata["name"]!
    }  
  `;

  // Define arguments we want to pass
  const args = [{ name: "Boris", nickname: "The Blade" }];

  // If something wrong with script execution method will throw an error,
  // so we need to catch it and process
  const name = await shallResolve(executeScript({ code, args }));
  console.log({ name });

  await emulator.stop();
};

main();
```

If you need to pass an array of dictionaries, it's not that different. Just replace `args` variable above with
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

Framework will try to resolve the types to the best of its abilities. If you encounter error for your use case, 
please fill the issue here: [https://github.com/onflow/flow-js-testing/issues](https://github.com/onflow/flow-js-testing/issues)
