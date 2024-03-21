import FlowManager from 0x01

transaction(name:String, code: String, manager: Address ##ARGS-WITH-TYPES##) {
    prepare(acct: auth(AddContract) &Account) {
        let decoded = code.decodeHex()
        acct.contracts.add(
           name: name,
           code: decoded,
           ##ARGS-LIST##
        )

        let linkPath = FlowManager.contractManagerPath
        let contractManager = getAccount(manager).capabilities.borrow<&FlowManager.Mapper>(linkPath)!

        let address = acct.address
        contractManager.setAddress(name, address: address)
    }
}
