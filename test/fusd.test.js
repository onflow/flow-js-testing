import path from "path";
import {
  init,
  emulator,
  getAccountAddress,
  mintFUSD,
  getFUSDBalance
} from "../src"

describe("fusd-tests", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence");
    // You can specify different port to parallelize execution of describe blocks
    const port = 8080;
    // Setting logging flag to true will pipe emulator output to console
    const logging = true;
      
    await init(basePath, { port });
    return emulator.start(port, logging);
  });

  afterEach(async () => {
    return emulator.stop();
  });

  test("mintFUSD", async () => {
    const acct = await getAccountAddress("acct");

    const response = await mintFUSD(acct, "33.0");
    const balance = await getFUSDBalance(acct);
    expect(response[1]).toBeNull();
    expect(balance[1]).toBeNull();
    expect(parseFloat(balance)).toBe(33.0);
  });
});