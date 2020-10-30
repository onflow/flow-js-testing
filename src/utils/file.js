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

import { replaceImportAddresses } from "./imports";
import { getPath, templateType } from "../manager";

export const readFile = (path) => {
  return fs.readFileSync(path, "utf8");
};

export const defaultsByName = {
  FlowToken: "0x0ae53cb6e3f42a79", // Emulator Default: FlowToken
  FungibleToken: "0xee82856bf20e2aa6", // Emulator Default: FungibleToken
};

export const defaultsByAddress = {
  "0x0ae53cb6e3f42a79": "0x0ae53cb6e3f42a79", // Emulator Default: FlowToken
  "0xee82856bf20e2aa6": "0xee82856bf20e2aa6", // Emulator Default: FungibleToken
};

export const getTemplate = (file, addressMap = {}, byName = true) => {
  const rawCode = readFile(file);

  const defaults = byName ? defaultsByName : defaultsByAddress;

  return addressMap
    ? replaceImportAddresses(rawCode, {
        ...defaults,
        ...addressMap,
      })
    : rawCode;
};

export const getContractCode = async ({
  name,
  addressMap,
  service = false,
}) => {
  const path = await getPath(name, templateType.CONTRACT, service);
  return getTemplate(path, addressMap);
};

export const getTransactionCode = async ({
  name,
  addressMap,
  service = false,
}) => {
  const path = await getPath(name, templateType.TRANSACTION, service);
  return getTemplate(path, addressMap);
};

export const getScriptCode = async ({ name, addressMap, service = false }) => {
  const path = await getPath(name, templateType.SCRIPT, service);
  return getTemplate(path, addressMap);
};
