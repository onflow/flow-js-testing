/** pragma type script **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
  executeScript
} from 'flow-cadut'

export const CODE = `
import FlowManager from 0x01

pub fun main():UFix64 {
    return FlowManager.timestampOffset
}

`;

/**
* Method to generate cadence code for getTimestampOffset script
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const getTimestampOffsetTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `getTimestampOffset =>`)

  return replaceImportAddresses(CODE, fullMap);
};

export const getTimestampOffset = async (props = {}) => {
  const { addressMap = {}, args = [] } = props
  const code = await getTimestampOffsetTemplate(addressMap);

  reportMissing("arguments", args.length, 0, `getTimestampOffset =>`);

  return executeScript({code, processed: true, ...props})
}