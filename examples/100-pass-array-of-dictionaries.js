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

  const code = `
    pub fun main(meta: {String:String}, index: UInt, key: String): String?{
      return meta[key]
    }
  `;
  const args = [
    {
      name: "Giovanni Giorgio",
      nickname: "Giorgio",
    },
    0,
    "nickname",
  ];

  const result = await executeScript({ code, args });
  console.log({ result });

  // Stop the emulator
  await emulator.stop();
})();
