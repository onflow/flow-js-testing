// my guess is that this template should be generated. Not sure how to generate
// the transaction file I want, so just creating it here

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
} from 'flow-cadut'

export const CODE = `
import FungibleToken from 0xFungibleToken
import ExampleToken from 0xTOKENADDRESS

transaction {
  prepare(acct: AuthAccount) {
      // Create a new empty Vault object
      let vaultA <- ExampleToken.createEmptyVault()
        
      // Store the vault in the account storage
      acct.save<@ExampleToken.Vault>(<-vaultA, to: /storage/exampleTokenVault)

      // Create a public Receiver capability to the Vault
      let ReceiverRef = acct.link<&ExampleToken.Vault{FungibleToken.Receiver}>(
          /public/exampleTokenReceiver, target: /storage/exampleTokenVault)
  }
}
`;

/**
* Method to generate cadence code for mintTokens transaction
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const setupVaultTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `setupVault =>`)

  return replaceImportAddresses(CODE, fullMap);
};
