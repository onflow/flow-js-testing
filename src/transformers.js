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

import { getServiceAddress } from "./manager";

export const importManager = async () => {
  const serviceAddress = await getServiceAddress();
  return `import FlowManager from ${serviceAddress}`;
};

export const importExists = (contractName, code) => {
  return new RegExp(`import\\s+${contractName}`).test(code);
};

export const builtInMethods = async (code) => {
  let injectedImports = code;
  if (!importExists("FlowManager", code)) {
    const imports = await importManager();
    injectedImports = `
      ${imports}
      ${code}  
  `;
  }
  return injectedImports
    .replace(/getCurrentBlock\(\).height/g, `FlowManager.getBlockHeight()`)
    .replace(/getCurrentBlock\(\).timestamp/g, `FlowManager.getBlockTimestamp()`);
};

const addressToIndex = (address) => {
  return parseInt(address) - 1;
};

const addressToAlias = (accounts) => (address) => accounts[addressToIndex(address)];

export const playgroundImport = (accounts) => async (code) => {
  let injectedImports = code;
  if (!importExists("FlowManager", code)) {
    const imports = await importManager();
    injectedImports = `
      ${imports}
      ${code}  
  `;
  }
  return injectedImports.replace(/(?:getAccount\()(.+)(?:\))/g, (match, g1) => {
    const alias = addressToAlias(accounts)(g1);
    if (!alias) {
      return `getAccount(FlowManager.resolveDefaultAccounts(${g1}))`;
    }
    return `getAccount(FlowManager.getAccountAddress("${alias}"))`;
  });
};
