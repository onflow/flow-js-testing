# Complex Arguments
In this example we will pass `{String:String}` dictionary and log it out.

```javascript
import path from "path";
import * as t from "@onflow/types"
import { init, executeScript } from "flow-js-testing"

const basePath = path.resolve(__dirname, "../cadence");

beforeAll(() => {
  init(basePath);
});

describe("Accounts", () => {
  test("log complex arguments", async () => {
    const code = `
            pub fun main(meta: {String: String}){
                log("Display passed meta argument:")
                log(meta)
        }
        `;

    const args = [
      [
        // the following array contains key-value pairs for metadata
        [
          { key: "a", value: "one" },
          { key: "b", value: "two" },
        ],
          
        // Since our script expects {String: String} we need to define types for key and value
        t.Dictionary({ key: t.String, value: t.String }),
      ],
    ];

    const result = await executeScript({
      code,
      args,
    });

    console.log({ result });
  });
});
```

Run emulator with `flow emulator -v` and then in another terminal run `jest`
