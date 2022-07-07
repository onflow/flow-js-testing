import path from "path";
import { init, emulator, executeScript } from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");

  await init(basePath);
  await emulator.start();

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
