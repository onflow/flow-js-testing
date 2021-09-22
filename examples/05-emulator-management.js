import path from "path";
import { emulator, init } from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");
  const port = 8080;
  await init(basePath);

  // Control emulator log stream
  const logging = true;

  // Start emulator instance on port 8080
  await emulator.start(port, logging);

  // Stop running emulator
  await emulator.stop();
})();
