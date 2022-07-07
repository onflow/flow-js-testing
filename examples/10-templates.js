import path from "path";
import {
  init,
  emulator,
  getTemplate,
  getContractCode,
  getScriptCode,
  getTransactionCode,
} from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");

  await init(basePath);
  await emulator.start();

  const addressMap = {
    Profile: "0xf8d6e0586b0a20c7",
  };

  const withPath = await getTemplate("./cadence/scripts/replace-address.cdc", addressMap);
  console.log({ withPath });

  const contractTemplate = await getContractCode({ name: "Greeting", addressMap });
  console.log({ contractTemplate });

  const transactionTemplate = await getTransactionCode({ name: "log-signers", addressMap });
  console.log({ transactionTemplate });

  const scriptTemplate = await getScriptCode({ name: "log-args", addressMap });
  console.log({ scriptTemplate });

  await emulator.stop();
})();
