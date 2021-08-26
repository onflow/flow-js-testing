import path from "path";
import {
  emulator,
  init,
  deployContractByName,
  getServiceAddress,
  shallPass,
  executeScript,
  sendTransaction,
} from "../src";

// We need to set timeout for a higher number, cause some transactions might take up some time
jest.setTimeout(10000);

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const contracts = path.resolve(__dirname, "../cadence/contracts");
    const base = path.resolve(__dirname, "./cadence");
    const port = 8080;
    await init({ base, contracts }, { port });
    return emulator.start(port, true);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  it("should deploy TestUtilities contract", async () => {
    const to = await getServiceAddress();
    await shallPass(deployContractByName({ name: "TestUtilities", to }));
  });

  it("should return zero offset", async () => {
    const to = await getServiceAddress();
    await shallPass(deployContractByName({ name: "TestUtilities", to }));

    const result = await executeScript("read-offset");
    expect(result).toBe(0);
  });

  it("should update offset", async () => {
    const to = await getServiceAddress();
    await shallPass(deployContractByName({ name: "TestUtilities", to }));

    const result = await executeScript("read-offset");
    expect(result).toBe(0);

    const offset = 42;
    await shallPass(sendTransaction("set-offset", [to], [offset]));
    // const newOffset = await executeScript("read-offset");
    // expect(newOffset).toBe(offset);
  });
});
