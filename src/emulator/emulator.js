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

import {send, build, getBlock, decode, config} from "@onflow/fcl"
import {Logger, LOGGER_LEVELS} from "./logger"
import {getAvailablePorts} from "../utils"

const {spawn} = require("child_process")

const DEFAULT_HTTP_PORT = 8080
const DEFAULT_GRPC_PORT = 3569

const print = {
  log: console.log,
  service: console.log,
  info: console.log,
  error: console.error,
  warn: console.warn,
}

/** Class representing emulator */
export class Emulator {
  /**
   * Create an emulator.
   */
  constructor() {
    this.initialized = false
    this.logging = false
    this.filters = []
    this.logger = new Logger()
  }

  /**
   * Set logging flag.
   * @param {boolean} logging - whether logs shall be printed
   */
  setLogging(logging) {
    this.logging = logging
  }

  /**
   * Log message with a specific type.
   * @param {*} message - message to put into log output
   * @param {"log"|"error"} type - type of the message to output
   */
  log(message, type = "log") {
    if (this.logging !== false) {
      print[type](message)
    }
  }

  /**
   * Start emulator.
   * @param {number} port - port to use for accessApi
   * @param {boolean} logging - whether logs shall be printed
   * @returns Promise<*>
   */
  async start(options = {}) {
    // populate emulator ports with available ports
    ;[this.grpcPort, this.restPort, this.adminPort] = await getAvailablePorts(3)

    // override ports if specified in options
    this.grpcPort = options.grpcPort || this.grpcPort
    this.restPort = options.restPort || this.restPort
    this.adminPort = options.adminPort || this.adminPort

    // Support deprecated start call using static port
    if (arguments.length > 1 || typeof arguments[0] === "number") {
      console.warn(`Calling emulator.start with the port argument is now deprecated in favour of dynamically selected ports and will be removed in future versions of flow-js-testing.
Please refrain from supplying this argument, as using it may cause unintended consequences.
More info: https://github.com/onflow/flow-js-testing/blob/master/TRANSITIONS.md#0001-deprecate-emulatorstart-port-argument`)
      ;[this.adminPort, options = {}] = arguments

      const offset = this.adminPort - DEFAULT_HTTP_PORT
      this.grpcPort = DEFAULT_GRPC_PORT + offset
    }

    const {flags = "", logging = false} = options

    // config access node
    config().put("accessNode.api", `http://localhost:${this.restPort}`)

    this.logging = logging
    this.process = spawn("flow", [
      "emulator",
      "--verbose",
      `--log-format=JSON`,
      `--rest-port=${this.restPort}`,
      `--admin-port=${this.adminPort}`,
      `--port=${this.grpcPort}`,
      flags,
    ])
    this.logger.setProcess(this.process)

    // Listen to logger to display logs if enabled
    this.logger.on("*", (level, msg) => {
      if (!this.filters.includes(level)) return

      this.log(`${level.toUpperCase()}: ${msg}`)

      if (msg.includes("Starting") && msg.includes(this.adminPort)) {
        this.log("EMULATOR IS UP! Listening for events!")
      }
    })

    // Suppress logger warning while waiting for emulator
    await config().put("logger.level", 0)

    return new Promise((resolve, reject) => {
      const cleanup = success => {
        this.initialized = success
        this.logger.removeListener(LOGGER_LEVELS.ERROR, listener)
        clearInterval(internalId)
        if (success) resolve()
        else reject()
      }

      let internalId
      const checkLiveness = async function () {
        try {
          await send(build([getBlock(false)])).then(decode)

          // Enable logger after emulator has come online
          await config().put("logger.level", 2)
          cleanup(true)
        } catch (err) {} // eslint-disable-line no-unused-vars, no-empty
      }
      internalId = setInterval(checkLiveness, 100)

      const listener = msg => {
        this.log(`EMULATOR ERROR: ${msg}`, "error")
        cleanup(false)
      }
      this.logger.on(LOGGER_LEVELS.ERROR, listener)

      this.process.on("close", code => {
        if (this.filters.includes("service")) {
          this.log(`EMULATOR: process exited with code ${code}`)
        }
        cleanup(false)
      })
    })
  }

  /**
   * Clear all log filters.
   * @returns void
   **/
  clearFilters() {
    this.filters = []
  }

  /**
   * Remove specific type of log filter.
   * @param {(debug|info|warning)} type - type of message
   * @returns void
   **/
  removeFilter(type) {
    this.filters = this.filters.filter(item => item !== type)
  }

  /**
   * Add log filter.
   * @param {(debug|info|warning)} type type - type of message
   * @returns void
   **/
  addFilter(type) {
    if (!this.filters.includes(type)) {
      this.filters.push(type)
    }
  }

  /**
   * Stop emulator.
   * @returns Promise<*>
   */
  async stop() {
    // eslint-disable-next-line no-undef
    return new Promise(resolve => {
      this.process.kill()
      setTimeout(() => {
        this.initialized = false
        resolve(false)
      }, 50)
    })
  }
}

/** Singleton instance */
export default new Emulator()
