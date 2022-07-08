/** pragma type script **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
  executeScript
} from '@onflow/flow-cadut'

export const CODE = `
import FlowManager from 0x01

pub fun main():UInt64 {
    return FlowManager.blockOffset
}

`;

/**
* Method to generate cadence code for getBlockOffset script
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const getBlockOffsetTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `getBlockOffset =>`)

  return replaceImportAddresses(CODE, fullMap);
};

export const getBlockOffset = async (props = {}) => {
  const { addressMap = {}, args = [] } = props
  const code = await getBlockOffsetTemplate(addressMap);

  reportMissing("arguments", args.length, 0, `getBlockOffset =>`);

  return executeScript({code, processed: true, ...props})
}