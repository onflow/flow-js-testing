import path from "path";
import { init, emulator, deployContractByName, getContractAddress } from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");

  await init(basePath);
  await emulator.start();

  // if we omit "to" it will be deployed to Service Account
  // but let's pretend we don't know where it will be deployed :)
  await deployContractByName({ name: "Hello" });

  const contractAddress = await getContractAddress("Hello");
  console.log({ contractAddress });

  await emulator.stop();
})();
