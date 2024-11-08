/** pragma type script **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
} from '@onflow/flow-cadut'
import { executeScript } from '../../interaction'

export const CODE = `
import FlowManager from 0x01

access(all) fun main(name: String, managerAccount: Address):Address? {
    let manager = getAccount(managerAccount)
    let linkPath = FlowManager.accountManagerPath
    let accountManager = manager.capabilities.borrow<&FlowManager.Mapper>(linkPath)!

    return accountManager.getAddress(name)

}
`;

/**
* Method to generate cadence code for getAccountAddress script
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const getAccountAddressTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `getAccountAddress =>`)

  return replaceImportAddresses(CODE, fullMap);
};

export const getAccountAddress = async (props = {}) => {
  const { addressMap = {}, args = [] } = props
  const code = await getAccountAddressTemplate(addressMap);

  reportMissing("arguments", args.length, 2, `getAccountAddress =>`);

  return executeScript({code, processed: true, ...props})
}
