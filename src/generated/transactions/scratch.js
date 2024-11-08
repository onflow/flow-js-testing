/** pragma type transaction **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
  sendTransaction
} from '@onflow/flow-cadut'

export const CODE = `
transaction{
    prepare(acct: &Account){
        log(acct.address)
    }
}
`;

/**
* Method to generate cadence code for scratch transaction
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const scratchTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `scratch =>`)

  return replaceImportAddresses(CODE, fullMap);
};


/**
* Sends scratch transaction to the network
* @param {Object.<string, string>} props.addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> props.args - list of arguments
* @param Array<*> props.signers - list of signers
*/
export const scratch = async (props = {}) => {
  const { addressMap, args = [], signers = [] } = props;
  const code = await scratchTemplate(addressMap);

  reportMissing("arguments", args.length, 0, `scratch =>`);
  reportMissing("signers", signers.length, 1, `scratch =>`);

  return sendTransaction({code, processed: true, ...props})
}
