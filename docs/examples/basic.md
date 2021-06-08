# Basic usage

Before using any of the methods you need to `init` the framework, basically telling where you Cadence
code will live. In example below, we put all the Cadence code in the folder named `cadence` one level above the place
where your test script is located.

```javascript
const basePath = path.resolve(__dirname, "../cadence");
```

Let's create `deploy.test.js` file and write some basic test, which would create 4 accounts for us and output their addresses:

```javascript
import path from "path";
import { getAccountAddress, init } from "flow-js-testing";

const basePath = path.resolve(__dirname, "../cadence");

beforeAll(() => {
  init(basePath);
});

describe("Accounts", () => {
  test("Create Accounts", async () => {
    const Alice = await getAccountAddress("Alice");
    const Bob = await getAccountAddress("Bob");
    const Charlie = await getAccountAddress("Charlie");
    const Dave = await getAccountAddress("Dave");

    console.log("Four accounts were created with following addresses:\n", {
      Alice,
      Bob,
      Charlie,
      Dave,
    });
  });
});
```

Run emulator with `flow emulator -v` and then in another terminal run `jest`
