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

import {getContractAddress} from "./contract"
import {defaultsByName} from "./file"
import {replaceImportAddresses, extractImports} from "@onflow/flow-cadut"

// TODO remove once flow-cadut is updated to support short-hand imports
const importTokenPart = `(?:"[\\w\\d]+?")|(?:[\\w\\d]+)`
const importRegex = new RegExp(
  `(^\\s*import\\s+)((?:${importTokenPart}[^\\n]*?,?[^\\n]?)+)[^\\n]*?(from)?[^\\n]*?$`,
  "gium"
)
export const fixShorthandImports = code => {
  return code.replaceAll(importRegex, found => {
    if (found.indexOf(" from") !== -1) return found
    const whatMatch = found.matchAll(/"([^"\s]+)"\s*,?\s*?/giu)
    return [...whatMatch]
      .map(what => `import ${what[1]} from "./${what[1]}.cdc"`)
      .join("\n")
  })
}

/**
 * Resolves import addresses defined in code template
 * @param {string} code - Cadence template code.
 * @returns {{string:string}} - name/address map
 */
export const resolveImports = async code => {
  const addressMap = {}
  const importList = extractImports(fixShorthandImports(code))
  for (const key in importList) {
    if (
      key !== "FlowManager" &&
      importList[key] &&
      importList[key].toLowerCase().startsWith("0x") &&
      importList[key].length === 18
    ) {
      addressMap[key] = importList[key]
    } else if (
      defaultsByName[key] &&
      !(importList[key] && importList[key] === '"DYNAMIC"')
    ) {
      addressMap[key] = defaultsByName[key]
    } else {
      const address = await getContractAddress(key)
      addressMap[key] = address
    }
  }
  return addressMap
}

export {replaceImportAddresses, extractImports}
