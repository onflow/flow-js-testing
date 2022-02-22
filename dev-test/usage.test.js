import path from "path";
import {
  emulator,
  init,
  getAccountAddress,
  deployContractByName,
  getScriptCode,
  executeScript,
  sendTransaction,
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
    const port = 8084;
    await init(basePath, { port });
    return emulator.start(port);
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
    const [message] = await executeScript({
      code,
    });
    console.log({ message });

    await mintFlow(Alice, "13.37");
    const balance = await getFlowBalance(Alice);
    console.log({ balance });
  });
});

describe("jest methods", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence");
    const port = 8082;
    await init(basePath, { port });
    return emulator.start(port);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  test("shall throw and revert properly", async () => {
    await shallRevert(
      sendTransaction({
        code: `
          transaction{
            prepare(signer: AuthAccount){
              panic("not on my watch!")
            }
          }
        `
      })
    );
  });

  test("shall resolve properly", async () => {
    const [result, err] = await shallResolve(
      executeScript({
        code: `
          pub fun main(): Int{
            return 42
          }
        `
      })
    );
    expect(result).toBe(42);
    expect(err).toBe(null);
  });

  test("shall pass tx", async () => {
    await shallPass(
      sendTransaction({
        code: `
          transaction{
            prepare(signer: AuthAccount){}
          }
        `
      })
    );
  });

  test("shall throw error", async () => {
    await shallThrow(
      executeScript({
        code: `
          pub fun main(){
            panic("exit here")
          }
        `
      })
    );
  });
});
