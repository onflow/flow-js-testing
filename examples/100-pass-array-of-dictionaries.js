import path from "path";
import {
  init,
  emulator,
  executeScript,
} from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  const code = `
    pub fun main(meta: [{String:String}], key: String): String?{
      return meta[0]![key]
    }
  `;
  const args = [
    [
      {
        name: "Giovanni Giorgio",
        nickname: "Giorgio",
      },
    ],
    "name"
  ];

  const result = await executeScript({ code, args });
  console.log({ result });

  // Stop the emulator
  await emulator.stop();
})();
