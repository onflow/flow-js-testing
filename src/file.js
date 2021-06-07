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

import fs from "fs";
import path from "path";
import { config } from "@onflow/config";

import { replaceImportAddresses } from "./imports";

export const readFile = (path) => {
  return fs.readFileSync(path, "utf8");
};

/**
 * Address map with access by name for contracts deployed to emulator by default.
 * @type {{FlowFees: string, FlowToken: string, FungibleToken: string}}
 */
export const defaultsByName = {
  FlowToken: "0x0ae53cb6e3f42a79",
  FungibleToken: "0xee82856bf20e2aa6",
  FlowFees: "0xe5a8b7f23e8b548f",
  FlowStorageFees: "0xf8d6e0586b0a20c7",
};

/**
 * Address map with access by address for contracts deployed to emulator by default.
 * @type {{"0xe5a8b7f23e8b548f": string, "0xf8d6e0586b0a20c7": string, "0xee82856bf20e2aa6": string, "0x0ae53cb6e3f42a79": string}}
 */
export const defaultsByAddress = {
  "0xe5a8b7f23e8b548f": "0xe5a8b7f23e8b548f", // FlowFees
  "0xf8d6e0586b0a20c7": "0xf8d6e0586b0a20c7", // FlowStorageFees
  "0x0ae53cb6e3f42a79": "0x0ae53cb6e3f42a79", // FlowToken
  "0xee82856bf20e2aa6": "0xee82856bf20e2aa6", // FungibleToken
};

const SCRIPT = "./scripts/";
const TRANSACTION = "./transactions/";
const CONTRACT = "./contracts/";

export const templateType = {
  SCRIPT,
  TRANSACTION,
  CONTRACT,
};

export const getPath = async (name, type = TRANSACTION) => {
  const configBase = await config().get("BASE_PATH");
  return path.resolve(configBase, `${type}/${name}.cdc`);
};

/**
 * Returns Cadence template for specified file. Replaces imports using provided address map
 * @param file - name of the file to look for.
 * @param {{string:string}} [addressMap={}] - name/address map to use as lookup table for addresses in import statements.
 * @param {boolean} [byAddress=false] - flag to indicate if address map is address to address type.
 * @returns {string}
 */
export const getTemplate = (file, addressMap = {}, byAddress = false) => {
  const rawCode = readFile(file);

  const defaults = byAddress ? defaultsByAddress : defaultsByName;

  return addressMap
    ? replaceImportAddresses(rawCode, {
        ...defaults,
        ...addressMap,
      })
    : rawCode;
};

/**
 * Returns contract template using name of the file in "contracts" folder containing the code.
 * @param name - name of the contract template in "contract" folder.
 * @param {{string:string}} [addressMap={}] - name/address map to use as lookup table for addresses in import statements.
 * @returns {Promise<string>}
 */
export const getContractCode = async ({ name, addressMap }) => {
  const path = await getPath(name, templateType.CONTRACT);
  return getTemplate(path, addressMap);
};

/**
 * Returns transaction template using name of the file in "transactions" folder containing the code.
 * @param name - name of the transaction template in "transactions" folder.
 * @param {{string:string}} [addressMap={}] - name/address map to use as lookup table for addresses in import statements.
 * @returns {Promise<string>}
 */
export const getTransactionCode = async ({ name, addressMap }) => {
  const path = await getPath(name, templateType.TRANSACTION);
  return getTemplate(path, addressMap);
};

/**
 * Returns script template using name of the file in "scripts" folder containing the code.
 * @param name - name of the script template in "scripts" folder.
 * @param {{string:string}} [addressMap={}] - name/address map to use as lookup table for addresses in import statements.
 * @returns {Promise<string>}
 */
export const getScriptCode = async ({ name, addressMap }) => {
  const path = await getPath(name, templateType.SCRIPT);
  return getTemplate(path, addressMap);
};
