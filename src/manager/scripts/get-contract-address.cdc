import FlowManager from 0xe03daebed8ca0615

pub fun main(name: String, managerAccount: Address):Address? {
    let manager = getAccount(managerAccount)
    let linkPath = FlowManager.linkContractManager
    let contractManager = manager
                        .getCapability(linkPath)!
                        .borrow<&FlowManager.Mapper>()!

    return contractManager.getAddress(name)

}