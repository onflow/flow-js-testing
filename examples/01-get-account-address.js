import path from "path";
import { init, emulator, getAccountAddress } from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");

  await init(basePath);
  await emulator.start();

  const Alice = await getAccountAddress("Alice");
  console.log({ Alice });

  await emulator.stop();
})();
