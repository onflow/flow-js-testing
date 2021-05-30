import FlowManager from 0x01

transaction(name:String, code: String, manager: Address ##ARGS-WITH-TYPES##) {
    prepare(acct: AuthAccount){
        let decoded = code.decodeHex()

        if acct.contracts.get(name: name) == nil {
          acct.contracts.add(name: name, code: decoded)
        } else {
          acct.contracts.update__experimental(name: name, code: decoded)
        }

        let linkPath = FlowManager.contractManagerPath
        let contractManager = getAccount(manager)
                    .getCapability(linkPath)!
                    .borrow<&FlowManager.Mapper>()!

        let address = acct.address
        contractManager.setAddress(name, address: address)
    }
}
