import path from "path";
import {
  init,
  emulator,
  getBlockOffset,
  setBlockOffset,
  builtInMethods,
  executeScript,
} from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  const [initialBlockOffset] = await getBlockOffset();
  console.log({ initialBlockOffset });

  // "getCurrentBlock().height" in your Cadence code will be replaced by Manager to a mocked value
  const code = `
    pub fun main(): UInt64 {
      return getCurrentBlock().height
    }
  `;

  // We can check that non-transformed code still works just fine
  const [normalResult] = await executeScript({ code });
  console.log({ normalResult });

  // Offset current block height by 42
  await setBlockOffset(42);
  // Let's check that offset value on Manager is actually changed to 42
  const [blockOffset] = await getBlockOffset();
  console.log({ blockOffset });

  // "transformers" field expects array of functions to operate update the code.
  // We will pass single operator "builtInMethods" provided by the framework to alter how getCurrentBlock().height is calculated
  const transformers = [builtInMethods];
  const [transformedResult] = await executeScript({ code, transformers });
  console.log({ transformedResult });

  // Stop the emulator
  await emulator.stop();
})();
