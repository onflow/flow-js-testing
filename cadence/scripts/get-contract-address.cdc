import FlowManager from 0x01

access(all) fun main(name: String, managerAccount: Address):Address? {
    let manager = getAccount(managerAccount)
    let linkPath = FlowManager.contractManagerPath
    let contractManager = manager.capabilities.borrow<&FlowManager.Mapper>(linkPath)!

    return contractManager.getAddress(name)

}
