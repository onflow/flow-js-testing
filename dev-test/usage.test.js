import path from "path";
import {
  emulator,
  init,
  getAccountAddress,
  deployContractByName,
  shallPass,
  getScriptCode,
  executeScript,
} from "../src";

// We need to set timeout for a higher number, cause some transactions might take up some time
jest.setTimeout(10000);

describe("Basic Usage test", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async (done) => {
    const basePath = path.resolve(__dirname, "./cadence");
    const port = 8080;
    init(basePath, port);
    // await emulator.start(port, false);
    done();
  });

  // Stop emulator, so it could be restarted
  afterEach(async (done) => {
    // await emulator.stop();
    done();
  });

  test("Create Accounts", async () => {
    // Playground project support 4 accounts, but nothing stops you from creating more by following the example laid out below
    // Test basic setup...
    const Alice = await getAccountAddress("Alice");
    console.log({ Alice });

    await deployContractByName({ name: "HelloWorld", to: Alice });
    console.log("contract deployed")


    /*
    const addressMap = { HelloWorld: Alice };
    const code = await getScriptCode({ name: "get-message", addressMap });
    console.log({ code });
    const message = await executeScript({
      code,
    });
    console.log({ message });
    */
  });
});
