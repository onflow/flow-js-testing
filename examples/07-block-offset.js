import path from "path";
import {
  init,
  emulator,
  getBlockOffset,
  setBlockOffset,
  builtInMethods,
  executeScript,
  getAccountAddress,
} from "../src";

(async () => {
  console.log("/home/max")
  const basePath = path.resolve(__dirname, "./cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  const Alice = await getAccountAddress("Alice");
  console.log({ Alice });

  // Offset current block height by 42
  await setBlockOffset(42);

  const blockOffset = await getBlockOffset();
  console.log({ blockOffset });

  // "getCurrentBlock().height" in your Cadence code will be replaced by Manager to a mocked value
  const code = `
    pub fun main(): UInt64 {
      return getCurrentBlock().height
    }
  `;

  // "transformers" field expects array of functions to operate update the code.
  // We will pass single operator "builtInMethods" provided by the framework
  const transformers = [builtInMethods];
  const result = await executeScript({ code, transformers });
  console.log({ result });

  await emulator.stop();

})();
