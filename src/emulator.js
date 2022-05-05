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
import { config } from "@onflow/config";

const { spawn } = require("child_process");

const DEFAULT_HTTP_PORT = 8080;
const DEFAULT_GRPC_PORT = 3569;

const print = {
  "log": console.log,
  "service": console.log,
  "info": console.log,
  "error": console.error,
  "warn": console.warn
}

/** Class representing emulator */
export class Emulator {
  /**
   * Create an emulator.
   */
  constructor() {
    this.initialized = false;
    this.logging = false;
    this.filters = [];
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
    if (this.logging !== false) {
      print[type](message);
    }
  }

  checkLevel(message, level){
    if(level === "debug"){
      // We might need to find a better way for this, but this will do for now...
      return message.includes("LOG") ? "log" : level
    }
    return level
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
  async start(port = DEFAULT_HTTP_PORT, options = {}) {
    // config access node
    config().put("accessNode.api", `http://localhost:${port}`);

    const { flags = "", logging = false } = options;
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
          let filtered = [];
          if (this.filters.length > 0) {
            filtered = data.filter((item) => {
              const level = this.checkLevel(item.msg, item.level);
              return this.filters.includes(level);
            });
          }
          for (let i = 0; i < filtered.length; i++) {
            const item = data[i]
            const { msg } = item;
            const level = this.checkLevel(msg, item.level);
            this.log(`${level.toUpperCase()}: ${msg}`);
          }
        } else {
          const { msg } = data;
          const level = this.checkLevel(msg, data.level);
          if (this.filters.length > 0) {
            if (this.filters.includes(level)) {
              this.log(`${level.toUpperCase()}: ${msg}`);
              // TODO: Fix this
              // This is really hacky solution, which depends on specific phrasing
              if (msg.includes("Starting") && msg.includes(port)) {
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
    this.filters = this.filters.filter((item) => item !== type);
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
