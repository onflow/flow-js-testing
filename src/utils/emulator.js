const { spawn } = require("child_process");

const DEFAULT_HTTP_PORT = 8080;
const DEFAULT_GRPC_PORT = 3569;

class Emulator {
  constructor() {
    this.initialized = false;
    this.logging = true;
  }

  setLogging(logging) {
    this.logging = logging;
  }

  log(message, type = "log") {
    this.logging && console[type](message);
  }

  async start(
    port = DEFAULT_HTTP_PORT,
    logging = false,
  ) {
    const offset = port - DEFAULT_HTTP_PORT;
    let grpc = DEFAULT_GRPC_PORT + offset;

    this.logging = logging;
    this.process = spawn("flow", [
      "emulator",
      "-v",
      "--http-port",
      port,
      "--port",
      grpc,
    ]);

    return new Promise((resolve, reject) => {
      this.process.stdout.on("data", (data) => {
        this.log(`LOG: ${data}`);
        if (data.includes("Starting HTTP server")) {
          this.log("EMULATOR IS UP! Listening for events!");
          this.initialized = true;
          resolve(true);
        }
      });

      this.process.stderr.on("data", (data) => {
        this.log(`stderr: ${data}`, "error");
        this.initialized = false;
      });

      this.process.on("close", (code) => {
        this.log(`emulator exited with code ${code}`);
        this.initialized = false;
      });
    });
  }

  async stop() {
    return new Promise((resolve) => {
      this.process.kill();
      setTimeout(() => {
        resolve(true);
      }, 0);
    });
  }
}

const emulator = new Emulator();

module.exports = {
  emulator,
};
