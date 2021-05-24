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
 