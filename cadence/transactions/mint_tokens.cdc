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
