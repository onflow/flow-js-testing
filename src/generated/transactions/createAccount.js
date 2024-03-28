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

transaction (_ name: String?, pubKey: [String], manager: Address) {
    prepare( admin: auth(BorrowValue) &Account) {
        let newAccount = Account(payer:admin)
        for key in pubKey {
            let keyData = RLP.decodeList(key.decodeHex())
            let rawSign = RLP.decodeString(keyData[1])[0]
            let rawHash = RLP.decodeString(keyData[2])[0]
            newAccount.keys.add(
                publicKey:  PublicKey(
                  publicKey: RLP.decodeString(keyData[0]),
                  signatureAlgorithm: SignatureAlgorithm(rawValue: rawSign)!
                ),
              hashAlgorithm: HashAlgorithm(rawValue: rawHash)!,
              weight: UFix64(Int32.fromBigEndianBytes(RLP.decodeString(keyData[3]))!)!
            )
        }

        if name != nil {
            let linkPath = FlowManager.accountManagerPath
            let accountManager = getAccount(manager).capabilities.borrow<&FlowManager.Mapper>(linkPath)!

            // Create a record in account database
            let address = newAccount.address
            accountManager.setAddress(name!, address: address)
        }
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
  reportMissingImports(CODE, fullMap, `createAccount =>`)

  return replaceImportAddresses(CODE, fullMap);
};


/**
* Sends createAccount transaction to the network
* @param {Object.<string, string>} props.addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> props.args - list of arguments
* @param Array<*> props.signers - list of signers
*/
export const createAccount = async (props = {}) => {
  const { addressMap, args = [], signers = [] } = props;
  const code = await createAccountTemplate(addressMap);

  reportMissing("arguments", args.length, 3, `createAccount =>`);
  reportMissing("signers", signers.length, 1, `createAccount =>`);

  return sendTransaction({code, processed: true, ...props})
}
