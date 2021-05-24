import FlowManager from 0x01

pub fun main(name: String, managerAccount: Address):Address? {
    let manager = getAccount(managerAccount)
    let linkPath = FlowManager.contractManagerPath
    let contractManager = manager
                        .getCapability(linkPath)
                        .borrow<&FlowManager.Mapper>()!

    return contractManager.getAddress(name)

}