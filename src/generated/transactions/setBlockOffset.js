/** pragma type transaction **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
  sendTransaction
} from 'flow-cadut'

export const CODE = `
import FlowManager from 0x01

transaction(offset: UInt64){
    prepare(signer:AuthAccount){
        FlowManager.setBlockOffset(offset)
    }
}

`;

/**
* Method to generate cadence code for setBlockOffset transaction
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const setBlockOffsetTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `setBlockOffset =>`)

  return replaceImportAddresses(CODE, fullMap);
};


/**
* Sends setBlockOffset transaction to the network
* @param {Object.<string, string>} props.addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> props.args - list of arguments
* @param Array<*> props.signers - list of signers
*/
export const setBlockOffset = async (props = {}) => {
  const { addressMap, args = [], signers = [] } = props;
  const code = await setBlockOffsetTemplate(addressMap);

  reportMissing("arguments", args.length, 1, `setBlockOffset =>`);
  reportMissing("signers", signers.length, 1, `setBlockOffset =>`);

  return sendTransaction({code, processed: true, ...props})
}