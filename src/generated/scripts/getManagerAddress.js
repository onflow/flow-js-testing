import { executeScript } from "../../";

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
} from "flow-cadut";

export const CODE = `
  pub fun main(serviceAddress: Address): Address? {
    let account = getAccount(serviceAddress)
    let ref = account
            .getCapability(/public/flowManagerAddress)
            .borrow<&[Address]>()!

    return ref[0]
}
 
`;

/**
 * Method to generate cadence code for TestAsset
 * @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
 */
export const getManagerAddressTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
    ...envMap,
    ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `getManagerAddress =>`);

  return replaceImportAddresses(CODE, fullMap);
};

export const getManagerAddress = async ({ addressMap = {}, args = [] }) => {
  const code = await getManagerAddressTemplate(addressMap);

  reportMissing("arguments", args.length, 1, getManagerAddress);

  return executeScript({ code, args });
};
