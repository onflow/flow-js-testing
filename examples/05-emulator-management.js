import path from "path";
import { emulator, init, executeScript } from "../src";

(async () => {
  const basePath = path.resolve(__dirname, "./cadence");
  const port = 8080;
  await init(basePath);

  // Let's define simple method to log message to emulator console
  const logMessage = async (message) => {
    return executeScript({
      code: `
        pub fun main(){
          log("------------> ${message}")
        }
      `,
    });
  };

  // Let's disable logging initially
  const logging = true;

  // Start emulator instance on port 8080
  await emulator.start(port, logging);

  // Enable only debug messages
  emulator.addFilter("debug");

  // This line will be visible in emulator output
  await logMessage("Now you see me...");

  // Next turn it OFF
  emulator.setLogging(false);
  // Next log will not be visible in emulator output
  await logMessage("NOW YOU DON'T!");

  // And ON back again
  emulator.setLogging(true);
  await logMessage("Easy right?");

  // Now let's disable debug messages and only show "info" messages
  emulator.clearFilters();
  emulator.addFilter("info");
  await logMessage("this won't be visible as well");

  // Then silently turn it off
  emulator.setLogging(false);
  // Stop running emulator
  await emulator.stop();
})();
