import FlowManager from 0x01

transaction (_ name: String?, pubKey: [String], manager: Address) {
    prepare( admin: auth(BorrowValue) &Account) {
        let newAccount = Account(payer:admin)
        for key in pubKey {
            let keyData = RLP.decodeList(key.decodeHex())
            let rawSign = RLP.decodeString(keyData[1])[0]
            let rawHash = RLP.decodeString(keyData[2])[0]
            newAccount.keys.add(
                publicKey:  PublicKey(
                  publicKey: RLP.decodeString(keyData[0]),
                  signatureAlgorithm: SignatureAlgorithm(rawValue: rawSign)!
                ),
              hashAlgorithm: HashAlgorithm(rawValue: rawHash)!,
              weight: UFix64(Int32.fromBigEndianBytes(RLP.decodeString(keyData[3]))!)!
            )
        }

        if name != nil {
            let linkPath = FlowManager.accountManagerPath
            let accountManager = getAccount(manager).capabilities.borrow<&FlowManager.Mapper>(linkPath)!

            // Create a record in account database
            let address = newAccount.address
            accountManager.setAddress(name!, address: address)
        }
    }
}
