import { sendTransaction } from "../../";

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
} from "flow-cadut";

export const CODE = `
  import FlowManager from 0x01

transaction(name:String, code: String, manager: Address ##ARGS-WITH-TYPES##) {
    prepare(acct: AuthAccount){
        let decoded = code.decodeHex()
        acct.contracts.add(
           name: name,
           code: decoded,
           ##ARGS-LIST##
        )

        let linkPath = FlowManager.contractManagerPath
        let contractManager = getAccount(manager)
                    .getCapability(linkPath)!
                    .borrow<&FlowManager.Mapper>()!

        let address = acct.address
        contractManager.setAddress(name, address: address)
    }
}
`;

/**
 * Method to generate cadence code for deployContract transaction
 * @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
 */
export const deployContractTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
    ...envMap,
    ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `deployContract =>`);

  return replaceImportAddresses(CODE, fullMap);
};

/**
 * Sends deployContract transaction to the network
 * @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
 * @param Array<*> args - list of arguments
 * @param Array<string> - list of signers
 */
export const deployContract = async ({ addressMap = {}, args = [], signers = [] }) => {
  const code = await deployContractTemplate(addressMap);

  reportMissing("arguments", args.length, 3, deployContract);
  reportMissing("signers", signers.length, 1, deployContract);

  return sendTransaction({ code, args, signers });
};
