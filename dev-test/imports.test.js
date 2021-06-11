import path from "path";
import { emulator, init, deployContract, resolveImports, getAccountAddress } from "../src";
import { defaultsByName } from "../src/file";

jest.setTimeout(10000);

const emptyContract = (name) =>
  `pub contract ${name}{
        init(){}
    }
`;

describe("import resolver", () => {
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

  test("use imports", async () => {
    const Registry = await getAccountAddress("Registry");

    await deployContract({ code: emptyContract("First"), to: Registry, name: "First" });
    await deployContract({ code: emptyContract("Second"), to: Registry, name: "Second" });

    const code = `
            import First from 0xFIRST
            import Second from 0xSECOND
            
            import FungibleToken from 0xFUNGIBLETOKEN
            import FlowToken from 0xFLOWTOKEN
            
            pub fun main(){}
        `;

    const addressMap = await resolveImports(code);
    expect(addressMap["First"]).toBe(Registry);
    expect(addressMap["Second"]).toBe(Registry);
    expect(addressMap["FungibleToken"]).toBe(defaultsByName.FungibleToken);
  });
});
