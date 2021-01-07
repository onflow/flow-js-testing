import NonFungibleToken from 0x02

// This transaction configures a user's account
// to use the NFT contract by creating a new empty collection,
// storing it in their account storage, and publishing a capability
transaction {
    prepare(acct: AuthAccount) {
      // create a new TopShot Collection
      let collection <- NonFungibleToken.createEmptyCollection() as! @NonFungibleToken.Collection

      // Put the new Collection in storage
      acct.save(<-collection, to: /storage/{{collectionName}})

      // create a public capability for the collection
      acct.link<&{NonFungibleToken.CollectionPublic}>(/public/{{collectionName}}, target: /storage/{{collectionName}})
    }
}
