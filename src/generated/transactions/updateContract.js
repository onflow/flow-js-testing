/** pragma type transaction **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
  sendTransaction
} from '@onflow/flow-cadut'

export const CODE = `
import FlowManager from 0x01

transaction(name:String, code: String, manager: Address ##ARGS-WITH-TYPES##) {
    prepare(acct: auth(AddContract, UpdateContract) &Account){
        let decoded = code.decodeHex()

        if acct.contracts.get(name: name) == nil {
            acct.contracts.add(
               name: name,
               code: decoded,
               ##ARGS-LIST##
            )
        } else {
          acct.contracts.update(name: name, code: decoded)
        }

        let linkPath = FlowManager.contractManagerPath
        let contractManager = getAccount(manager).capabilities.borrow<&FlowManager.Mapper>(linkPath)!

        let address = acct.address
        contractManager.setAddress(name, address: address)
    }
}

`;

/**
* Method to generate cadence code for updateContract transaction
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const updateContractTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `updateContract =>`)

  return replaceImportAddresses(CODE, fullMap);
};


/**
* Sends updateContract transaction to the network
* @param {Object.<string, string>} props.addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> props.args - list of arguments
* @param Array<*> props.signers - list of signers
*/
export const updateContract = async (props = {}) => {
  const { addressMap, args = [], signers = [] } = props;
  const code = await updateContractTemplate(addressMap);

  reportMissing("arguments", args.length, 3, `updateContract =>`);
  reportMissing("signers", signers.length, 1, `updateContract =>`);

  return sendTransaction({code, processed: true, ...props})
}
