pub contract FlowManager {

    /// Account Manager
    pub event AccountAdded(address: Address)

    pub struct Mapper {
        pub let accounts: {String: Address}

        pub fun getAddress(_ name: String): Address? {
            return self.accounts[name]
        }

        pub fun setAddress(_ name: String, address: Address){
            self.accounts[name] = address
            emit FlowManager.AccountAdded(address: address)
        }

        init(){
            self.accounts = {}
        }
    }

    pub fun getAccountAddress(_ name: String): Address?{
        let accountManager = self.account
            .getCapability(self.accountManagerPath)
            .borrow<&FlowManager.Mapper>()!

        return accountManager.getAddress(name)
    }

    pub let defaultAccounts: {Address : String}

    pub fun resolveDefaultAccounts(_ address: Address): Address{
        let alias = self.defaultAccounts[address]!
        return self.getAccountAddress(alias)!
    }

    pub let accountManagerStorage: StoragePath
    pub let contractManagerStorage: StoragePath
    pub let accountManagerPath: PublicPath
    pub let contractManagerPath: PublicPath

    /// Environment Manager
    pub event BlockOffsetChanged(offset: UInt64)
    pub event TimestampOffsetChanged(offset: UFix64)

    pub struct MockBlock {
        pub let id: [UInt8; 32]
        pub let height: UInt64
        pub let view: UInt64
        pub let timestamp: UFix64

        init(_ id: [UInt8; 32], _ height: UInt64, _ view: UInt64, _ timestamp: UFix64){
            self.id = id
            self.height = height
            self.view = view
            self.timestamp = timestamp
        }
    }

    pub fun setBlockOffset(_ offset: UInt64){
        self.blockOffset = offset
        emit FlowManager.BlockOffsetChanged(offset: offset)
    }

    pub fun setTimestampOffset(_ offset: UFix64){
        self.timestampOffset = offset
        emit FlowManager.TimestampOffsetChanged(offset: offset)
    }

    pub fun getBlockHeight(): UInt64 {
        var block = getCurrentBlock()
        return block.height + self.blockOffset
    }

    pub fun getBlockTimestamp(): UFix64 {
        var block = getCurrentBlock()
        return block.timestamp + self.timestampOffset
    }

    pub fun getBlock(): MockBlock {
        var block =  getCurrentBlock()
        let mockBlock = MockBlock(block.id, block.height, block.view, block.timestamp);
        return mockBlock
    }

    pub var blockOffset: UInt64;
    pub var timestampOffset: UFix64;


    // Initialize contract
    init(){
        // Environment defaults
        self.blockOffset = 0;
        self.timestampOffset = 0.0;

        // Account Manager initialization
        let accountManager = Mapper()
        let contractManager = Mapper()

        self.defaultAccounts = {
          0x01: "Alice",
          0x02: "Bob",
          0x03: "Charlie",
          0x04: "Dave",
          0x05: "Eve"
        }

        self.accountManagerStorage = /storage/testSuitAccountManager
        self.contractManagerStorage = /storage/testSuitContractManager

        self.accountManagerPath = /public/testSuitAccountManager
        self.contractManagerPath = /public/testSuitContractManager
        
        // Destroy previously stored values
        self.account.load<Mapper>(from: self.accountManagerStorage)
        self.account.load<Mapper>(from: self.contractManagerStorage)

        self.account.save(accountManager, to: self.accountManagerStorage)
        self.account.save(contractManager, to: self.contractManagerStorage)

        self.account.link<&Mapper>(self.accountManagerPath, target: self.accountManagerStorage)
        self.account.link<&Mapper>(self.contractManagerPath, target: self.contractManagerStorage)
    }
}
 