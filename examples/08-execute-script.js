import path from "path";
import { init, emulator, executeScript } from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  // We have created a file called "log-args.cdc" under "./cadence/scripts" folder.
  // It's available for use since we configured framework to use "./cadence" folder as root
  const code = `
    pub fun main(a: Int, b: Bool, c: String, d: UFix64, e: [Int], f: {String: String}, res: Int): Int{
      log(a)
      log(b)
      log(c)
      log(d)
      log(e)
      log(f)
      
      return res
    }
  `;

  // args is just an array of values in the same order as they are defined in script code
  const args = [
    1337,
    true,
    "Hello, Cadence",
    "1.337",
    [1, 3, 3, 7],
    {
      name: "Cadence",
      status: "active",
    },
    42,
  ];
  const name = "log-args";

  const [fromCode] = await executeScript({ code, args });
  const [fromFile] = await executeScript({ name, args });
  console.log({ fromCode });
  console.log({ fromFile });

  // "executeScript" also supports short form, accepting name of the file in "scripts folder
  // and array of arguments
  const [shortForm] = await executeScript("hello")
  console.log({ shortForm });

  await emulator.stop();
})();
