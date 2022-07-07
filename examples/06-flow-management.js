import path from "path";
import { init, emulator, getAccountAddress, getFlowBalance, mintFlow } from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");

  await init(basePath);
  await emulator.start();

  // Get address for account with alias "Alice"
  const Alice = await getAccountAddress("Alice");

  // Get initial balance
  const [initialBalance] = await getFlowBalance(Alice);
  console.log({ initialBalance });

  // Add 1.0 FLOW tokens to Alice account
  await mintFlow(Alice, "1.0");

  // Check updated balance
  const [updatedBalance] = await getFlowBalance(Alice);
  console.log({ updatedBalance });

  await emulator.stop();
})();
