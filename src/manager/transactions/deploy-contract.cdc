import FlowManager from 0xe03daebed8ca0615

transaction(name:String, code: String, manager: Address) {
    prepare(acct: AuthAccount){
        acct.setCode(code.decodeHex())

        let linkPath = FlowManager.linkContractManager
        let contractManager = getAccount(manager)
                    .getCapability(linkPath)!
                    .borrow<&FlowManager.Mapper>()!

        let address = acct.address
        contractManager.setAddress(name, address: address)
    }
}