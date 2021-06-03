import { sendTransaction } from "../../";

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
} from "flow-cadut";

export const CODE = `
  transaction ( code: String ) {
    prepare( admin: AuthAccount) {
        admin.contracts.add(
           name: "FlowManager",
           code: code.decodeHex(),
        )
   }
}

`;

/**
 * Method to generate cadence code for initManager transaction
 * @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
 */
export const initManagerTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
    ...envMap,
    ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `initManager =>`);

  return replaceImportAddresses(CODE, fullMap);
};

/**
 * Sends initManager transaction to the network
 * @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
 * @param Array<*> args - list of arguments
 * @param Array<string> - list of signers
 */
export const initManager = async ({ addressMap = {}, args = [], signers = [] }) => {
  const code = await initManagerTemplate(addressMap);

  reportMissing("arguments", args.length, 1, initManager);
  reportMissing("signers", signers.length, 1, initManager);

  return sendTransaction({ code, args, signers });
};
