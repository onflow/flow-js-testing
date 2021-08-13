import path from "path";
import {
  emulator,
  init,
  deployContractByName,
  getContractAddress,
  getAccountAddress,
  getServiceAddress,
} from "../src";

// We need to set timeout for a higher number, cause some transactions might take up some time
jest.setTimeout(10000);

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence");
    const port = 8080;
    await init(basePath, { port });
    return emulator.start(port);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  test("deploy basic contract - to service account", async () => {
    const name = "HelloWorld";
    await deployContractByName({ name });
    const address = await getContractAddress(name);
    const serviceAccount = await getServiceAddress();
    expect(address).toBe(serviceAccount);
  });

  test("deploy basic contract - to service account, short notation", async () => {
    const name = "HelloWorld";
    await deployContractByName(name);
    const address = await getContractAddress(name);
    const serviceAccount = await getServiceAddress();
    expect(address).toBe(serviceAccount);
  });

  test("deploy basic contract - to Alice account", async () => {
    const Alice = await getAccountAddress("Alice");
    const name = "HelloWorld";
    await deployContractByName({ name, to: Alice });
    const address = await getContractAddress(name);
    expect(address).toBe(Alice);
  });

  test("deploy basic contract - to Alice account, short notation", async () => {
    const name = "HelloWorld";
    const Alice = await getAccountAddress("Alice");
    await deployContractByName(name, Alice);
    const address = await getContractAddress(name);
    expect(address).toBe(Alice);
  });
});
