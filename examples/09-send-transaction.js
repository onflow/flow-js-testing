import path from "path";
import { init, emulator, getAccountAddress, sendTransaction } from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");
  const port = 8080;

  await init(basePath, { port });
  await emulator.start(port, true);

  emulator.addFilter(`debug`);

  const Alice = await getAccountAddress("Alice");
  const Bob = await getAccountAddress("Bob");

  const name = "log-signers";
  const code = `
    transaction(message: String){
      prepare(first: AuthAccount, second: AuthAccount){
          log(message)
          log(first.address)
          log(second.address)
      }
    }
  `;
  const signers = [Alice, Bob];
  const args = ["Hello from Cadence"];

  // There are several ways to call "sendTransaction"
  // 1. Providing "code" field for Cadence template
  const [txInlineResult] = await sendTransaction({ code, signers, args });
  // 2. Providing "name" field to read Cadence template from file in "./transaction" folder
  const [txFileResult] = await sendTransaction({ name, signers, args });

  console.log("txInlineResult", txInlineResult);
  console.log("txFileResult", txFileResult);

  // 3. Providing name of the file in short form (name, signers, args)
  const [txShortResult] = await sendTransaction(name, signers, args);
  console.log("txShortResult", txShortResult);

  await emulator.stop();
})();
