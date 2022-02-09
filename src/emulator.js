/*
 * Flow JS Testing
 *
 * Copyright 2020-2021 Dapper Labs, Inc.
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
import { send, build, getBlock, decode } from "@onflow/fcl";

const { spawn } = require("child_process");

const DEFAULT_HTTP_PORT = 8080;
const DEFAULT_GRPC_PORT = 3569;

/** Class representing emulator */
export class Emulator {
  /**
   * Create an emulator.
   */
  constructor() {
    this.initialized = false;
    this.logging = false;
    this.logProcessor = (item) => item;
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

  extractKeyValue(str) {
    // TODO: add regexp check that it conforms to necessary pattern
    const [key, value] = str.split("=");
    if (value.includes("LOG")) {
      return { key, value: value.replace(`"\x1b[1;34m`, `"\x1b[1[34m`) };
    }
    return { key, value };
  }

  fixJSON(msg){
    const splitted = msg.split("\n").filter((item) => item !== "");
    const reconstructed =
      splitted.length > 1 ? `[${splitted.join(",")}]` : splitted[0];
    return reconstructed;
  };

  parseDataBuffer(data){
    const message = data.toString();
    console.log("PARSER BUS =============>")
    console.log({message, spt: message.includes("level")})
    try {
      if (message.includes("level")) {
        return JSON.parse(this.fixJSON(message));
      }
    } catch (e) {
      console.error(e);
      return { msg: e };
    }
    return message;
  }

  /**
   * Start emulator.
   * @param {number} port - port to use for accessApi
   * @param {boolean} logging - whether logs shall be printed
   * @returns Promise<*>
   */
  async start(port = DEFAULT_HTTP_PORT, logging = false, options = {}) {
    const { flags = "" } = options;
    const offset = port - DEFAULT_HTTP_PORT;
    let grpc = DEFAULT_GRPC_PORT + offset;

    this.logging = logging;
    this.filters = [];
    this.process = spawn("flow", [
      "emulator",
      "--verbose",
      `--log-format=JSON`,
      `--admin-port=${port}`,
      `--port=${grpc}`,
      flags,
    ]);
    this.logProcessor = (item) => item;

    return new Promise((resolve, reject) => {
      let internalId;
      const checkLiveness = async function () {
        try {
          await send(build([getBlock(false)])).then(decode);
          clearInterval(internalId);
          this.initialized = true;
          resolve(true);
        } catch (err) {
        } // eslint-disable-line no-unused-vars, no-empty
      };
      internalId = setInterval(checkLiveness, 100);

      this.process.stdout.on("data", (data) => {
        console.log("DATA BUS ================>");
        const json = this.parseDataBuffer(data);
        console.log({ json });
        if (this.filters.length > 0) {
          for (let i = 0; i < this.filters.length; i++) {
            const filter = this.filters[i];
            if (json.level === filter) {
              // TODO: use this.log to output string with this.logProcessor and type
              // TODO: Fix output colors: https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
              // this.log(`LOG: ${data.toString().replace(/\\x1b\[1;34m/, "\x1b[36m")}`);
              this.log(`LOG: ${data}`);
              break;
            }
          }
        } else {
          this.log(`LOG: ${json.msg}`);
        }
        if (data.includes("Starting HTTP server")) {
          this.log("EMULATOR IS UP! Listening for events!");
        }
      });

      this.process.stderr.on("data", (data) => {
        const { message } = this.parseDataBuffer(data);

        this.log(`EMULATOR ERROR: ${message}`, "error");
        this.initialized = false;
        clearInterval(internalId);
        reject();
      });

      this.process.on("close", (code) => {
        this.log(`emulator exited with code ${code}`);
        this.initialized = false;
        clearInterval(internalId);
        resolve(false);
      });
    });
  }

  /**
   * Clear all log filters.
   * @returns void
   **/
  clearFilters() {
    this.filters = [];
  }

  /**
   * Remove specific type of log filter.
   * @param {(debug|info|warning)} type - type of message
   * @returns void
   **/
  removeFilter(type) {
    this.filters = this.filters((item) => item !== type);
  }

  /**
   * Add log filter.
   * @param {(debug|info|warning)} type type - type of message
   * @returns void
   **/
  addFilter(type) {
    if (!this.filters.includes(type)) {
      this.filters.push(type);
    }
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
        resolve(false);
      }, 50);
    });
  }
}

/** Singleton instance */
export default new Emulator();
