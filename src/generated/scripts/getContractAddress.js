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
    let linkPath = FlowManager.contractManagerPath
    let contractManager = manager.capabilities.borrow<&FlowManager.Mapper>(linkPath)!

    return contractManager.getAddress(name)

}
`;

/**
* Method to generate cadence code for getContractAddress script
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const getContractAddressTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `getContractAddress =>`)

  return replaceImportAddresses(CODE, fullMap);
};

export const getContractAddress = async (props = {}) => {
  const { addressMap = {}, args = [] } = props
  const code = await getContractAddressTemplate(addressMap);

  reportMissing("arguments", args.length, 2, `getContractAddress =>`);

  return executeScript({code, processed: true, ...props})
}
