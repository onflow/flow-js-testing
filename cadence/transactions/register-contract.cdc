import FlowManager from 0x01

transaction(name: String, address: Address) {
    prepare(signer: auth(BorrowValue) &Account){
        let linkPath = FlowManager.contractManagerPath
        let contractManager = getAccount(manager).capabilities.borrow<&FlowManager.Mapper>(linkPath)!
        contractManager.setAddress(name, address: address)
    }
}
