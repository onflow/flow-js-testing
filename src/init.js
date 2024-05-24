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

import {config} from "@onflow/fcl"
import {flowConfig, getConfigPath} from "./flow-config"
import path from "path"
import fs from "fs"

const DEFAULT_COMPUTE_LIMIT = 9999

/**
 * Inits framework variables, storing private key of service account and base path
 * where Cadence files are stored.
 * @param {string} basePath - path to the folder with Cadence files to be tested.
 * @param {number} [props.port] - port to use for accessAPI
 * @param {number} [props.pkey] - private key to use for service account in case of collisions
 */
export const init = async (basePath, props = {}) => {
  const {
    pkey = "48a1f554aeebf6bf9fe0d7b5b79d080700b073ee77909973ea0b2f6fbc902",
  } = props

  const cfg = flowConfig()

  config().put("PRIVATE_KEY", getServiceKey(cfg) ?? pkey)
  config().put(
    "SERVICE_ADDRESS",
    cfg?.accounts?.["emulator-account"]?.address ?? "f8d6e0586b0a20c7"
  )
  config().put("BASE_PATH", cfg?.testing?.paths ?? basePath)
  config().put("fcl.limit", DEFAULT_COMPUTE_LIMIT)
}

function getServiceKey(cfg) {
  const value = cfg?.accounts?.["emulator-account"]?.key
  if (value) {
    if (typeof value === "object") {
      switch (value.type) {
        case "hex":
          return value.privateKey
        case "file":
          const configDir = path.dirname(getConfigPath())
          const resovledPath = path.resolve(configDir, value.location)
          return fs.readFileSync(resovledPath, "utf8")
        default:
          return null
      }
    } else if (typeof value === "string") {
      if (value.startsWith("$")) {
        return process.env[value.slice(1)]
      } else {
        return value
      }
    } else {
      return null
    }
  }

  return null
}
