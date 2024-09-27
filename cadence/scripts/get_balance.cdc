// This script reads the balance field
// of an account's ExampleToken Balance

import FungibleToken from 0x1
import ExampleToken from 0x1
import FungibleTokenMetadataViews from 0x1

access(all) fun main(address: Address): UFix64 {
    let vaultData = ExampleToken.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
        ?? panic("Could not get vault data view for the contract")

    return getAccount(address).capabilities.borrow<&{FungibleToken.Balance}>(
            vaultData.metadataPath
        )?.balance
        ?? panic("Could not borrow Balance reference to the Vault")
}
