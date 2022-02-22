import path from "path";
import { init, emulator, executeScript } from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  const code = `
    pub fun main(data: {UInt32: UInt32}, key: UInt32): UInt32?{
      return data[key]
    }
  `;

  const args = [{ 0: 1, 1: 42 }, 1];

  const [result] = await executeScript({ code, args });
  console.log({ result });

  // Stop the emulator
  await emulator.stop();
})();
