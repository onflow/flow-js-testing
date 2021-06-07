import { sendTransaction } from "../../";

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
} from "flow-cadut";

export const CODE = `
  import FlowManager from 0x01

transaction (_ name: String, pubKey: String, manager: Address) {
    prepare( admin: AuthAccount) {
        let newAccount = AuthAccount(payer:admin)
        newAccount.addPublicKey(pubKey.decodeHex())

        let linkPath = FlowManager.accountManagerPath
        let accountManager = getAccount(manager)
                            .getCapability(linkPath)!
                            .borrow<&FlowManager.Mapper>()!
        
        // Create a record in account database
        let address = newAccount.address
        accountManager.setAddress(name, address: address)
    }
}
 
`;

/**
 * Method to generate cadence code for createAccount transaction
 * @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
 */
export const createAccountTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
    ...envMap,
    ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `createAccount =>`);

  return replaceImportAddresses(CODE, fullMap);
};

/**
 * Sends createAccount transaction to the network
 * @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
 * @param Array<*> args - list of arguments
 * @param Array<string> - list of signers
 */
export const createAccount = async ({ addressMap = {}, args = [], signers = [] }) => {
  const code = await createAccountTemplate(addressMap);

  reportMissing("arguments", args.length, 3, createAccount);
  reportMissing("signers", signers.length, 1, createAccount);

  return sendTransaction({ code, args, signers });
};
