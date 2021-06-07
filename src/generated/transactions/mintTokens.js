import { sendTransaction } from "../../";

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
} from "flow-cadut";

export const CODE = `
  import FungibleToken from 0xFUNGIBLETOKENADDRESS
import ExampleToken from 0xTOKENADDRESS

transaction(recipient: Address, amount: UFix64) {
    let tokenAdmin: &ExampleToken.Administrator
    let tokenReceiver: &{FungibleToken.Receiver}

    prepare(signer: AuthAccount) {
        self.tokenAdmin = signer
        .borrow<&ExampleToken.Administrator>(from: /storage/exampleTokenAdmin)
        ?? panic("Signer is not the token admin")

        self.tokenReceiver = getAccount(recipient)
        .getCapability(/public/exampleTokenReceiver)!
        .borrow<&{FungibleToken.Receiver}>()
        ?? panic("Unable to borrow receiver reference")
    }

    execute {
        let minter <- self.tokenAdmin.createNewMinter(allowedAmount: amount)
        let mintedVault <- minter.mintTokens(amount: amount)

        self.tokenReceiver.deposit(from: <-mintedVault)

        destroy minter
    }
}

`;

/**
 * Method to generate cadence code for mintTokens transaction
 * @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
 */
export const mintTokensTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
    ...envMap,
    ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `mintTokens =>`);

  return replaceImportAddresses(CODE, fullMap);
};

/**
 * Sends mintTokens transaction to the network
 * @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
 * @param Array<*> args - list of arguments
 * @param Array<string> - list of signers
 */
export const mintTokens = async ({ addressMap = {}, args = [], signers = [] }) => {
  const code = await mintTokensTemplate(addressMap);

  reportMissing("arguments", args.length, 2, mintTokens);
  reportMissing("signers", signers.length, 1, mintTokens);

  return sendTransaction({ code, args, signers });
};
