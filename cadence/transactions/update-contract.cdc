import FlowManager from 0x01

transaction(name:String, code: String, manager: Address ##ARGS-WITH-TYPES##) {
    prepare(acct: auth(AddContract, UpdateContract) &Account){
        let decoded = code.decodeHex()

        if acct.contracts.get(name: name) == nil {
            acct.contracts.add(
               name: name,
               code: decoded,
               ##ARGS-LIST##
            )
        } else {
          acct.contracts.update(name: name, code: decoded)
        }

        let linkPath = FlowManager.contractManagerPath
        let contractManager = getAccount(manager).capabilities.borrow<&FlowManager.Mapper>(linkPath)!

        let address = acct.address
        contractManager.setAddress(name, address: address)
    }
}
