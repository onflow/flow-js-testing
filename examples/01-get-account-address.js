import path from "path"
import { init, emulator, getAccountAddress } from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  const Alice = await getAccountAddress("Alice");
  console.log({ Alice });

  await emulator.stop();
})();