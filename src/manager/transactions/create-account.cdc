import FlowManager from 0x1cf0e2f2f715450

transaction (_ name: String, pubKey: String) {
    prepare( admin: AuthAccount) {
        let newAccount = AuthAccount(payer:admin)
        newAccount.addPublicKey(pubKey.decodeHex())

        let linkPath = FlowManager.linkAccountManager
        let accountManager = admin
                            .getCapability(linkPath)!
                            .borrow<&FlowManager.Mapper>()!
        
        // Create a record in account database
        accountManager.setAddress(name, address: newAccount.address)
    }
}
 