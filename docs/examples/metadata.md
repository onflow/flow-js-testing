# Complex Arguments
In this example we will pass `{String:String}` dictionary and display log it out.

```javascript
import path from "path";

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
        [
          { key: "a", value: "one" },
          { key: "b", value: "two" },
        ],
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
