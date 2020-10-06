transaction ( pubKey: String, code: String ) {
    prepare( admin: AuthAccount) {
        let newAccount = AuthAccount(payer:admin)
        newAccount.addPublicKey(pubKey.decodeHex())
        
        newAccount.setCode(code.decodeHex())

        // destroy stored
        admin.load<[Address]>(from: /storage/flowManagerAddress)

        admin.save([newAccount.address], to: /storage/flowManagerAddress)
        admin.link<&[Address]>(/public/flowManagerAddress, target: /storage/flowManagerAddress)

        log("Manager address:".concat(newAccount.address.toString()))
    }
}
