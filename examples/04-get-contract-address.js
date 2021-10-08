import path from "path";
import { init, emulator, deployContractByName, getContractAddress } from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port);

  // if we omit "to" it will be deployed to Service Account
  // but let's pretend we don't know where it will be deployed :)
  await deployContractByName({ name: "Hello" });

  const contractAddress = await getContractAddress("Hello");
  console.log({ contractAddress });

  await emulator.stop();
})();
