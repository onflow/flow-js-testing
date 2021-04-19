/*
 * Flow JS Testing
 *
 * Copyright 2020 Dapper Labs, Inc.
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

const getPairs = (line) => {
  return line
    .split(/\s/)
    .map((item) => item.replace(/\s/g, ""))
    .filter((item) => item.length > 0 && item !== "import" && item !== "from");
};

const collect = (acc, item) => {
  const [contract, address] = item;
  acc[contract] = address;
  return acc;
};

/**
 * Returns address map for contracts defined in template code.
 * @param {string} code - Cadence code to parse.
 * @returns {*}
 */
export const extractImports = (code) => {
  if (!code || code.length === 0) {
    return {};
  }
  return code
    .split("\n")
    .filter((line) => line.includes("import"))
    .map(getPairs)
    .reduce(collect, {});
};

export const replaceImports = (code, addressMap) => {
  return code.replace(
    /(\s*import\s*)([\w\d]+)(\s+from\s*)([\w\d]+)/g,
    (match, imp, contract) => {
      const newAddress =
        addressMap instanceof Function
          ? addressMap(contract)
          : addressMap[contract];
      return `${imp}${contract} from ${newAddress}`;
    }
  );
};

/**
 * Returns Cadence template code with replaced import addresses
 * @param {string} code - Cadence template code.
 * @param {{string:string}} [addressMap={}] - name/address map or function to use as lookup table
 * for addresses in import statements.
 * @param byName - lag to indicate whether we shall use names of the contracts.
 * @returns {*}
 */
export const replaceImportAddresses = (code, addressMap, byName = true) => {
  return code.replace(
    /(\s*import\s*)([\w\d]+)(\s+from\s*)([\w\d]+)/g,
    (match, imp, contract, _, address) => {
      const key = byName ? contract : address;
      const newAddress =
        addressMap instanceof Function ? addressMap(key) : addressMap[key];
      return `${imp}${contract} from ${newAddress}`;
    }
  );
};
