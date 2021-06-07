import { executeScript } from "../../";

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
} from "flow-cadut";

export const CODE = `
  import FlowManager from 0x01

pub fun main(name: String, managerAccount: Address):Address? {
    let manager = getAccount(managerAccount)
    let linkPath = FlowManager.accountManagerPath
    let accountManager = manager
                        .getCapability(linkPath)
                        .borrow<&FlowManager.Mapper>()!

    return accountManager.getAddress(name)

}
`;

/**
 * Method to generate cadence code for TestAsset
 * @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
 */
export const getAccountAddressTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
    ...envMap,
    ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `getAccountAddress =>`);

  return replaceImportAddresses(CODE, fullMap);
};

export const getAccountAddress = async ({ addressMap = {}, args = [] }) => {
  const code = await getAccountAddressTemplate(addressMap);

  reportMissing("arguments", args.length, 2, getAccountAddress);

  return executeScript({ code, args });
};
