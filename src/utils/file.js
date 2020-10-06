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
  // TODO: collect contract names and try to resolve them automatically
  const rawCode = readFile(file);

  const defaults = byName ? defaultsByName : defaultsByAddress;

  return addressMap
    ? replaceImportAddresses(rawCode, {
        ...defaults,
        ...addressMap,
      })
    : rawCode;
};

export const getContractCode = (name, addressMap) => {
  const path = getPath(name, templateType.CONTRACT);
  return getTemplate(path, addressMap);
};

export const getTransactionCode = (name, addressMap) => {
  const path = getPath(name, templateType.TRANSACTION);
  return getTemplate(path, addressMap);
};

export const getScriptCode = (name, addressMap) => {
  const path = getPath(name, templateType.SCRIPT);
  return getTemplate(path, addressMap);
};
