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

import path from "path"
import fs from "fs"

const TARGET = "flow.json"
let configPath = null
let config = null

function isDir(dir) {
  return fs.lstatSync(dir).isDirectory()
}

function listFiles(dir) {
  return new Set(fs.readdirSync(dir))
}

function parentDir(dir) {
  return path.dirname(dir)
}

function findTarget(dir) {
  if (!isDir(dir)) throw new Error(`Not a directory: ${dir}`)
  return listFiles(dir).has(TARGET) ? path.resolve(dir, TARGET) : null
}

export function getConfigPath(dir) {
  if (configPath != null) return configPath

  const filePath = findTarget(dir)
  if (filePath == null) {
    if (dir === parentDir(dir)) {
      throw new Error("No flow.json found")
    }
    return getConfigPath(parentDir(dir))
  }

  configPath = filePath
  return configPath
}

export function flowConfig() {
  if (config != null) return config

  const filePath = getConfigPath(process.cwd())
  const content = fs.readFileSync(filePath, "utf8")
  config = JSON.parse(content)

  return config
}
