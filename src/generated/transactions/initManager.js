/** pragma type transaction **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
  sendTransaction
} from 'flow-cadut'

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
  reportMissingImports(CODE, fullMap, `initManager =>`)

  return replaceImportAddresses(CODE, fullMap);
};


/**
* Sends initManager transaction to the network
* @param {Object.<string, string>} props.addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> props.args - list of arguments
* @param Array<*> props.signers - list of signers
*/
export const initManager = async (props = {}) => {
  const { addressMap, args = [], signers = [] } = props;
  const code = await initManagerTemplate(addressMap);

  reportMissing("arguments", args.length, 1, `initManager =>`);
  reportMissing("signers", signers.length, 1, `initManager =>`);

  return sendTransaction({code, processed: true, ...props})
}