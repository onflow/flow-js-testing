import FlowManager from 0x01

transaction(name:String, code: String, manager: Address ##ARGS-WITH-TYPES##) {
    prepare(acct: AuthAccount){
        let decoded = code.decodeHex()
        acct.contracts.add(
           name: name,
           code: decoded,
           ##ARGS-LIST##
        )

        let linkPath = FlowManager.contractManagerPath
        let contractManager = getAccount(manager)
                    .getCapability(linkPath)!
                    .borrow<&FlowManager.Mapper>()!

        let address = acct.address
        contractManager.setAddress(name, address: address)
    }
}