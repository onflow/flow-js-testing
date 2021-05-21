"use strict";
const { exec } = require("child_process");

class Emulator {
  constructor() {
    this.initialized = false;
    this.logging = true;
  }

  setLogging(logging) {
    this.logging = logging;
  }

  init(logging = true) {
    this.logging = logging;
    this.process = exec("flow emulator - v");

    return new Promise((resolve, reject) => {
      this.process.stdout.on("data", (data) => {
        this.logging && console.log(`LOG: ${data}`);
        if (data.includes("Starting HTTP server")) {
          console.log("EMULATOR IS UP! Listening for events!");
          this.initialized = true;
          resolve(true);
        }
      });

      this.process.stderr.on("data", (data) => {
        this.logging && console.error(`stderr: ${data}`);
        this.initialized = false;
      });

      this.process.on("close", (code) => {
        this.logging && console.log(`emulator exited with code ${code}`);
        this.initialized = false;
      });
    });
  }
}

const emulator = new Emulator();

module.exports = {
  emulator,
};
