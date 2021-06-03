import path from "path";
import {
  emulator,
  init,
  sendTransaction,
  executeScript,
  shallResolve,
  shallThrow,
  shallPass,
} from "../src";

// We need to set timeout for a higher number, cause some transactions might take up some time
jest.setTimeout(10000);

describe("interactions - sendTransaction", () => {
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

  test("sendTransaction - shall throw  when no code and name provided", async () => {
    await shallThrow(async () => {
      return sendTransaction({});
    });
  });

  test("sendTransaction - shall pass with name provided", async () => {
    await shallPass(async () => {
      const name = "log-signer-address";
      return sendTransaction({ name });
    });
  });

  test("sendTransaction - shall pass with name passed directly", async () => {
    await shallPass(async () => {
      return sendTransaction("log-signer-address");
    });
  });

  test("sendTransaction - shall pass with code provided", async () => {
    await shallPass(async () => {
      const code = `
        transaction{
          prepare(signer: AuthAccount){
            log(signer.address)
          }
        }
      `;
      return sendTransaction({ code });
    });
  });
});
describe("interactions - executeScript", () => {
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

  test("executeScript - shall throw  when no code and name provided", async () => {
    shallThrow(async () => {
      return executeScript({});
    });
  });

  test("executeScript - shall pass with name provided", async () => {
    await shallResolve(async () => {
      const name = "log-message";
      return executeScript({ name });
    });
  });

  test("executeScript - shall pass with code provided", async () => {
    await shallResolve(async () => {
      const code = `
        pub fun main(){
            log("hello from cadence")
        }
      `;
      return executeScript({ code });
    });
  });
});
