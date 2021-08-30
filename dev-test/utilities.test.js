import path from "path";
import {
  emulator,
  init,
  getServiceAddress,
  getAccountAddress,
  shallPass,
  executeScript,
  sendTransaction,
} from "../src";
import { extractParameters } from "../src/interaction";
import { builtInMethods, importExists, playgroundImport } from "../src/transformers";
import { initManager } from "../src/manager";

// We need to set timeout for a higher number, cause some transactions might take up some time
jest.setTimeout(10000);

describe("block height offset", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const base = path.resolve(__dirname, "../cadence");
    const port = 8080;
    await init({ base }, { port, loadManager: false });
    return emulator.start(port);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  it("should return zero offset", async () => {
    const result = await executeScript("get-block-offset");
    expect(result).toBe(0);
  });

  it("should update offset", async () => {
    const manager = await getServiceAddress();
    const result = await executeScript("get-block-offset");
    expect(result).toBe(0);

    const offset = 42;
    await shallPass(sendTransaction("set-block-offset", [manager], [offset]));
    const newOffset = await executeScript("get-block-offset");
    expect(newOffset).toBe(offset);
  });
});

describe("dev tests", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const base = path.resolve(__dirname, "../cadence");
    const scripts = path.resolve(__dirname, "./cadence/scripts");
    const port = 8080;
    await init({ base, scripts }, { port, loadManager: false });
    return emulator.start(port, false);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  it("should return proper offset", async () => {
    const zeroOffset = await executeScript("read-mocked-offset");
    expect(zeroOffset).toBe(0);
  });

  it("should return proper offset, when changed", async () => {
    const offset = 42;
    const manager = await getServiceAddress();
    await shallPass(sendTransaction("set-block-offset", [manager], [offset]));
    const newOffset = await executeScript("read-mocked-offset");
    expect(newOffset).toBe(offset);
  });

  it("should return proper addresses", async () => {
    await initManager();
    const accounts = ["Alice", "Bob", "Charlie", "Dave", "Eve"];
    for (const i in accounts) {
      await getAccountAddress(accounts[i]);
    }

    const code = `
      pub fun main(address:Address):Address{
        return getAccount(address).address
      } 
    `;

    const playgroundAddresses = ["0x01", "0x02", "0x03", "0x04", "0x05"];
    for (const i in playgroundAddresses) {
      const result = await executeScript({
        code,
        transformers: [playgroundImport(accounts)],
        args: [playgroundAddresses[i]],
      });
      const account = await getAccountAddress(accounts[i]);
      expect(result).toBe(account);
    }
  });
});

describe("transformers and injectors", () => {
  it("should inject built in mock", async () => {
    await init("../");

    const props = {
      code: `
      pub fun main(){
        log(getCurrentBlock().height);
      }
    `,
      transformers: [builtInMethods],
    };
    const extractor = extractParameters("script");
    const { code } = await extractor([props]);
    console.log({ code });
    expect(importExists("FlowManager", code)).toBe(true);
  });

  it("should replace getAccount", async () => {
    const accounts = ["Alice", "Bob", "Charlie", "Dave", "Eve"];
    const props = {
      code: `
        pub fun main(){
          let Alice = getAccount(0x01)
          let Bob = getAccount(0x02)
          let Charlie = getAccount(0x03)
          let Dave = getAccount(0x04)
          let Eve = getAccount(0x05)
        } 
      `,
      transformers: [playgroundImport(accounts)],
    };
    const extractor = extractParameters("script");
    const { code } = await extractor([props]);
    console.log({ code });
  });

  it("should replace getAccount in script", async () => {
    const accounts = ["Alice", "Bob", "Charlie", "Dave", "Eve"];
    const props = {
      code: `
        pub fun main(address:Address):Address{
          return getAccount(address).address
        } 
      `,
      transformers: [playgroundImport(accounts)],
    };
    const extractor = extractParameters("script");
    const { code } = await extractor([props]);
    console.log({ code });
  });
});
