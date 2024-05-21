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

import {config, withPrefix} from "@onflow/fcl"
import {exec} from "child_process"
import {createServer} from "net"
import * as semver from "semver"

export const isObject = arg => typeof arg === "object" && arg !== null
export const isString = obj => typeof obj === "string" || obj instanceof String
export const isAddress = address => /^0x[0-9a-f]{0,16}$/.test(address)

export function getAvailablePorts(count = 1) {
  if (count === 0) return Promise.resolve([])
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.listen(0, () => {
      const port = server.address().port
      server.close(async err => {
        if (err) reject(err)
        resolve([...(await getAvailablePorts(count - 1)), port])
      })
    })
  })
}

/**
 * Get the Flow CLI version
 * @param {string} flowCommand - the Flow CLI command name
 * @returns {Promise<import("semver").SemVer>}
 */
export async function getFlowVersion(flowCommand = "flow") {
  return new Promise((resolve, reject) => {
    exec(`${flowCommand} version --output=json`, (error, stdout) => {
      if (error) {
        reject(
          "Could not determine Flow CLI version, please make sure it is installed and available in your PATH"
        )
      } else {
        const versionStr = JSON.parse(stdout).version
        const version = semver.parse(versionStr)
        if (!version) {
          reject(`Invalid Flow CLI version string: ${versionStr}`)
        }

        resolve(version)
      }
    })
  })
}

export const getServiceAddress = async () => {
  return withPrefix(await config().get("SERVICE_ADDRESS"))
}

export function parsePath(path) {
  const rxResult = /(\w+)\/(\w+)/.exec(path)
  if (!rxResult) {
    throw Error(`${path} is not a correct path`)
  }

  return {
    domain: rxResult[1],
    slot: rxResult[2],
  }
}
export const getValueByKey = (keys, value) => {
  if (!value) {
    return null
  }

  if (keys.length > 0 && !isObject(value)) {
    return null
  }

  if (typeof keys === "string") {
    return getValueByKey(keys.split("."), value)
  }
  const [first, ...rest] = keys

  if (!first) {
    return value
  }

  if (!rest) {
    return value[first]
  }
  return getValueByKey(rest, value[first])
}
