import FungibleToken from 0x02

// This transaction configures an account to store and receive tokens defined by
// the FungibleToken contract.
transaction {
	prepare(acct: AuthAccount) {
		// Create a new empty Vault object
		let vaultA <- FungibleToken.createEmptyVault()

		// Store the vault in the account storage
		acct.save<@FungibleToken.Vault>(<-vaultA, to: /storage/{{vaultName}})

    log("Empty Vault stored")

    // // Create a public Receiver capability to the Vault
    let ReceiverRef = acct.link<&FungibleToken.Vault{FungibleToken.Receiver, FungibleToken.Balance}>(/public/{{vaultName}}, target: /storage/{{vaultName}})

    log("References created")
	}
}
