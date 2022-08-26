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

import {getManagerAddress} from "./manager"

export const importManager = async () => {
  const managerAddress = await getManagerAddress()
  return `import FlowManager from ${managerAddress}`
}

export const importExists = (contractName, code) => {
  return new RegExp(`import\\s+${contractName}`).test(code)
}

export const builtInMethods = async code => {
  let replacedCode = code
    .replace(/getCurrentBlock\(\).height/g, `FlowManager.getBlockHeight()`)
    .replace(
      /getCurrentBlock\(\).timestamp/g,
      `FlowManager.getBlockTimestamp()`
    )

  if (code === replacedCode) return code

  let injectedImports = replacedCode
  if (!importExists("FlowManager", replacedCode)) {
    const imports = await importManager()
    injectedImports = `
      ${imports}
      ${replacedCode}  
  `
  }
  return injectedImports
}

export function builtInMethodsDeprecated(code) {
  console.warn(`The usage of the builtInMethods transformer for block & timestamp offset utilities is deprecated and unnecesary.
It is applied by default to all cadence code within Flow JS Testing.
Please remove this transformer from your code as this method will be removed in future versions of Flow JS Testing.
See more here: https://github.com/onflow/flow-js-testing/blob/master/TRANSITIONS.md#0002-depreaction-of-builtinmethods-code-transformer`)
  return builtInMethods(code)
}

const addressToIndex = address => {
  return parseInt(address) - 1
}

const addressToAlias = accounts => address => accounts[addressToIndex(address)]

export const playgroundImport = accounts => async code => {
  let injectedImports = code
  if (!importExists("FlowManager", code)) {
    const imports = await importManager()
    injectedImports = `
      ${imports}
      ${code}  
  `
  }
  return injectedImports.replace(/(?:getAccount\()(.+)(?:\))/g, (match, g1) => {
    const alias = addressToAlias(accounts)(g1)
    if (!alias) {
      return `getAccount(FlowManager.resolveDefaultAccounts(${g1}))`
    }
    return `getAccount(FlowManager.getAccountAddress("${alias}"))`
  })
}

export const applyTransformers = async (code, transformers) =>
  transformers.reduce(async (acc, transformer) => transformer(await acc), code)
