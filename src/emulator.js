/*
 * Flow JS Testing
 *
 * Copyright 2020 Dapper Labs, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { spawn } = require("child_process");

const DEFAULT_HTTP_PORT = 8080;
const DEFAULT_GRPC_PORT = 3569;

/** Class representing emulator */
class Emulator {
  /**
   * Create an emulator.
   */
  constructor() {
    this.initialized = false;
    this.logging = true;
  }

  /**
   * Set logging flag.
   * @param {boolean} logging - whether logs shall be printed
   */
  setLogging(logging) {
    this.logging = logging;
  }

  /**
   * Log message with a specific type.
   * @param {*} message - message to put into log output
   * @param {"log"|"error"} type - type of the message to output
   */
  log(message, type = "log") {
    this.logging && console[type](message);
  }

  /**
   * Start emulator.
   * @param {number} port - port to use for accessApi
   * @param {boolean} logging - whether logs shall be printed
   * @returns Promise<*>
   */
  async start(port = DEFAULT_HTTP_PORT, logging = false) {
    const offset = port - DEFAULT_HTTP_PORT;
    let grpc = DEFAULT_GRPC_PORT + offset;

    this.logging = logging;
    this.process = spawn("flow", ["emulator", "-v", "--http-port", port, "--port", grpc]);

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
        this.log(`ERROR: ${data}`, "error");
        this.initialized = false;
        reject();
      });

      this.process.on("close", (code) => {
        this.log(`emulator exited with code ${code}`);
        this.initialized = false;
        resolve(true);
      });
    });
  }

  /**
   * Stop emulator.
   * @returns Promise<*>
   */
  async stop() {
    // eslint-disable-next-line no-undef
    return new Promise((resolve) => {
      this.process.kill();
      setTimeout(() => {
        this.initialized = false;
        resolve(true);
      }, 50);
    });
  }
}

/** Singleton instance */
export default new Emulator();
