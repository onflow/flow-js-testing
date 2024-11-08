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

import {EventEmitter} from "events"

/**
 * Enum of all logger levels
 * @readonly
 * @enum {number}
 */
export const LOGGER_LEVELS = {
  PANIC: 5,
  FATAL: 4,
  ERROR: 3,
  WARN: 2,
  INFO: 1,
  DEBUG: 0,
  TRACE: -1,
}

// eslint-disable-next-line no-control-regex
const LOG_REGEXP = /LOG:.*?\s+(.*)/

export class Logger extends EventEmitter {
  constructor(options) {
    super(options)
    this.handleMessage = this.handleMessage.bind(this)
    this.process = null
    this.setMaxListeners(100)
  }

  /**
   * Sets the emulator process to monitor logs of
   * @param {import("child_process").ChildProcessWithoutNullStreams} process
   * @returns {void}
   */
  setProcess(process) {
    if (this.process) {
      this.process.stdout.removeListener("data", this.handleMessage)
      this.process.stderr.removeListener("data", this.handleMessage)
    }

    this.process = process
    this.process.stdout.on("data", this.handleMessage)
    this.process.stderr.on("data", this.handleMessage)
  }

  handleMessage(buffer) {
    const logs = this.parseDataBuffer(buffer)
    logs.forEach(({level, msg, ...data}) => {
      // Handle log special case
      const levelMatch =
        level === LOGGER_LEVELS.INFO || level === LOGGER_LEVELS.DEBUG

      const logMatch = LOG_REGEXP.test(msg)
      if (levelMatch && logMatch) {
        let logMessage = msg.match(LOG_REGEXP).at(1)
        // if message is string, remove from surrounding and unescape
        if (/^"(.*)"/.test(logMessage)) {
          logMessage = logMessage
            .substring(1, logMessage.length - 1)
            .replace(/\\"/g, '"')
        }

        this.emit("log", logMessage)
      }

      // Emit emulator message to listeners
      this.emit("message", {level, msg, ...data})
    })
  }

  fixJSON(msg) {
    // TODO: Test this functionality
    const split = msg.split("\n").filter(item => item !== "")
    return split.length > 1 ? `[${split.join(",")}]` : split[0]
  }

  parseDataBuffer(dataBuffer) {
    const data = dataBuffer.toString()
    try {
      if (data.includes("msg")) {
        let messages = JSON.parse(this.fixJSON(data))

        // Make data into array if not array
        messages = [].concat(messages)

        // Map string levels to enum
        messages = messages.map(m => ({
          ...m,
          level: LOGGER_LEVELS[m.level.toUpperCase()],
        }))

        return messages
      }
    } catch (e) {
      console.error(e)
    }
    return []
  }
}
