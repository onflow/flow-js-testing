import FlowManager from 0x1cf0e2f2f715450

pub fun main(managerAccount: Address, contractName: String):Address? {
    let manager = getAccount(managerAccount)
    let linkPath = FlowManager.linkContractManager
    let contractManager = manager
                        .getCapability(linkPath)!
                        .borrow<&FlowManager.Mapper>()!

    return contractManager.getAddress(contractName)

}