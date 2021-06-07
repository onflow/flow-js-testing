import { executeScript } from "../../";

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
} from "flow-cadut";

export const CODE = `
  import FlowManager from 0x01

pub fun main(){
    // the body can be empty. The script will throw error if FlowManager is not
    // added to service address
}

`;

/**
 * Method to generate cadence code for TestAsset
 * @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
 */
export const checkManagerTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
    ...envMap,
    ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `checkManager =>`);

  return replaceImportAddresses(CODE, fullMap);
};

export const checkManager = async ({ addressMap = {}, args = [] }) => {
  const code = await checkManagerTemplate(addressMap);

  reportMissing("arguments", args.length, 1, checkManager);

  return executeScript({ code, args });
};
