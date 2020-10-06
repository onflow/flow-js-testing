import FlowManager from 0x1cf0e2f2f715450

pub fun main(contractName: String, managerAccount: Address):Address? {
    let manager = getAccount(managerAccount)
    let linkPath = FlowManager.linkAccountManager
    let accountManager = manager
                        .getCapability(linkPath)!
                        .borrow<&FlowManager.Mapper>()!

    return accountManager.getAddress(contractName)

}