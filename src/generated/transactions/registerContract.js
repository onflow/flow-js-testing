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

transaction(name: String, address: Address) {
    prepare(signer: AuthAccount){
        let linkPath = FlowManager.contractManagerPath
        let contractManager = signer
                                .getCapability(linkPath)!
                                .borrow<&FlowManager.Mapper>()!
        contractManager.setAddress(name, address: address)
    }
}

`;

/**
* Method to generate cadence code for registerContract transaction
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const registerContractTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `registerContract =>`)

  return replaceImportAddresses(CODE, fullMap);
};


/**
* Sends registerContract transaction to the network
* @param {Object.<string, string>} props.addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> props.args - list of arguments
* @param Array<*> props.signers - list of signers
*/
export const registerContract = async (props = {}) => {
  const { addressMap, args = [], signers = [] } = props;
  const code = await registerContractTemplate(addressMap);

  reportMissing("arguments", args.length, 2, `registerContract =>`);
  reportMissing("signers", signers.length, 1, `registerContract =>`);

  return sendTransaction({code, processed: true, ...props})
}