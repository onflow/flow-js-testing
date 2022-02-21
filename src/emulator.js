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
    this.filters = ["debug"];
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
    if (this.logging) {
      const logType = type === "debug" ? "log" : type;
      console[logType](message);
    }
  }

  extractKeyValue(str) {
    // TODO: add regexp check that it conforms to necessary pattern
    const [key, value] = str.split("=");
    if (value.includes("LOG")) {
      return { key, value: value.replace(`"\x1b[1;34m`, `"\x1b[1[34m`) };
    }
    return { key, value };
  }

  fixJSON(msg) {
    const splitted = msg.split("\n").filter((item) => item !== "");
    const reconstructed = splitted.length > 1 ? `[${splitted.join(",")}]` : splitted[0];
    return reconstructed;
  }

  parseDataBuffer(data) {
    const message = data.toString();
    try {
      if (message.includes("msg")) {
        return JSON.parse(this.fixJSON(message));
      }
    } catch (e) {
      console.error(e);
      return { msg: e, level: "JSON Error" };
    }
    return { msg: message, level: "parser" };
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
        } catch (err) {} // eslint-disable-line no-unused-vars, no-empty
      };
      internalId = setInterval(checkLiveness, 100);

      this.process.stdout.on("data", (buffer) => {
        const data = this.parseDataBuffer(buffer);
        
        if (Array.isArray(data)) {
          let filtered = data;
          if (this.filters.length > 0) {
            filtered = data.filter((item) => {
              return this.filters.includes(item.level);
            });
          }
          for (let i = 0; i < filtered.length; i++) {
            const { level = "log", msg } = data[i];
            this.log(`${level.toUpperCase()}: ${msg}`);
          }
        } else {
          const { level, msg } = data;
          if (this.filters.length > 0) {
            if (this.filters.includes(data.level)) {
              this.log(`${level.toUpperCase()}: ${msg}`);
              if (data.msg.includes("Starting HTTP server")) {
                this.log("EMULATOR IS UP! Listening for events!");
              }
            }
          } else {
            this.log(`${level.toUpperCase()}: ${msg}`);
            if (data.msg.includes("Starting HTTP server")) {
              this.log("EMULATOR IS UP! Listening for events!");
            }
          }
        }
      });

      this.process.stderr.on("data", (buffer) => {
        const { message } = this.parseDataBuffer(buffer);

        this.log(`EMULATOR ERROR: ${message}`, "error");
        this.initialized = false;
        clearInterval(internalId);
        reject();
      });

      this.process.on("close", (code) => {
        if (this.filters.includes("service")) {
          this.log(`EMULATOR: process exited with code ${code}`);
        }
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
