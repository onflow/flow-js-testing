import path from "path";
import {
  emulator,
  init,
  getAccountAddress,
  deployContractByName,
  getScriptCode,
  executeScript,
  mintFlow,
  getFlowBalance,
  shallRevert,
  shallResolve,
  shallPass,
  shallThrow,
} from "../src";

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(10000);

describe("Basic Usage test", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence");
    const port = 8080;
    await init(basePath, port);
    return emulator.start(port, false);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  test("create Accounts", async () => {
    // Playground projects support 4 accounts, but nothing stops you from creating more by following the example laid out below
    // Test basic setup...
    const Alice = await getAccountAddress("Alice");
    console.log({ Alice });

    await deployContractByName({ name: "HelloWorld", to: Alice });
    console.log("contract deployed");

    const addressMap = { HelloWorld: Alice };
    const code = await getScriptCode({ name: "get-message", addressMap });
    console.log({ code });
    const message = await executeScript({
      code,
    });
    console.log({ message });

    await mintFlow(Alice, "13.37");
    const balance = await getFlowBalance(Alice);
    console.log({ balance });
  });
});

describe("jest methods", () => {
  test("shall throw and revert properly", async () => {
    await shallRevert(
      async () =>
        new Promise((_, reject) => {
          reject("something is wrong");
        }),
    );
  });

  test("shall resolve properly", async () => {
    const ALL_GOOD = "OK";
    const result = await shallResolve(
      async () =>
        new Promise((resolve) => {
          resolve(ALL_GOOD);
        }),
    );
    expect(result).toBe(ALL_GOOD);
  });

  test("shall pass tx", async () => {
    await shallPass(
      async () =>
        new Promise((resolve) => {
          resolve({
            status: 4,
            errorMessage: "",
          });
        }),
    );
  });

  test("shall throw error", async () => {
    await shallThrow(
      async () =>
        new Promise(() => {
          throw Error("didn't happen");
        }),
    );
  });
});
