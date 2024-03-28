/** pragma type transaction **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
  sendTransaction
} from '@onflow/flow-cadut'

export const CODE = `
import FungibleToken from 0x1
import ExampleToken from 0x1
import FungibleTokenMetadataViews from 0x1

transaction(recipient: Address, amount: UFix64) {
    let tokenAdmin: &FlowToken.Administrator
    let tokenReceiver: &{FungibleToken.Receiver}
    let supplyBefore: UFix64

    prepare(signer: auth(BorrowValue) &Account) {
        self.supplyBefore = ExampleToken.totalSupply

        // Borrow a reference to the admin object
        self.tokenAdmin = signer.storage.borrow<&ExampleToken.Administrator>(from: ExampleToken.AdminStoragePath)
            ?? panic("Signer is not the token admin")

        let vaultData = ExampleToken.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
            ?? panic("Could not get vault data view for the contract")

        self.tokenReceiver = getAccount(recipient).capabilities.borrow<&{FungibleToken.Receiver}>(vaultData.receiverPath)
            ?? panic("Could not borrow receiver reference to the Vault")
    }

    execute {
        let minter <- self.tokenAdmin.createNewMinter(allowedAmount: amount)
        let mintedVault <- minter.mintTokens(amount: amount)

        self.tokenReceiver.deposit(from: <-mintedVault)

        destroy minter
    }

    post {
        ExampleToken.totalSupply == self.supplyBefore + amount: "The total supply must be increased by the amount"
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
  reportMissingImports(CODE, fullMap, `mintTokens =>`)

  return replaceImportAddresses(CODE, fullMap);
};


/**
* Sends mintTokens transaction to the network
* @param {Object.<string, string>} props.addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> props.args - list of arguments
* @param Array<*> props.signers - list of signers
*/
export const mintTokens = async (props = {}) => {
  const { addressMap, args = [], signers = [] } = props;
  const code = await mintTokensTemplate(addressMap);

  reportMissing("arguments", args.length, 2, `mintTokens =>`);
  reportMissing("signers", signers.length, 1, `mintTokens =>`);

  return sendTransaction({code, processed: true, ...props})
}
