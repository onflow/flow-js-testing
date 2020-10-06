import FlowManager from 0x1cf0e2f2f715450
transaction(name: String, address: Address) {
    prepare(signer: AuthAccount){
        let linkPath = FlowManager.linkContractManager
        let contractManager = signer
                                .getCapability(linkPath)!
                                .borrow<&FlowManager.Mapper>()!
        contractManager.setAddress(name, address: address)
    }
}