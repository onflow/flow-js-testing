pub contract FlowManager {

    pub event NewAccount(_ address: Address)

    pub struct Mapper {
        pub let accounts: {String: Address}

        pub fun getAddress(_ name: String): Address? {
            return self.accounts[name]
        }

        pub fun setAddress(_ name: String, address: Address){
            self.accounts[name] = address
        }

        init(){
            self.accounts = {}
        }
    }

    pub let accountManagerStorage: Path
    pub let contractManagerStorage: Path
    pub let linkAccountManager: Path
    pub let linkContractManager: Path

    init(){
        let accountManager = Mapper()
        let contractManager = Mapper()

        self.accountManagerStorage = /storage/testSuitAccountManager
        self.contractManagerStorage = /storage/testSuitContractManager

        self.linkAccountManager = /public/testSuitAccountManager
        self.linkContractManager = /public/testSuitContractManager
        
        // Destroy previously stored values
        self.account.load<Mapper>(from: self.accountManagerStorage)
        self.account.load<Mapper>(from: self.contractManagerStorage)

        self.account.save(accountManager, to: self.accountManagerStorage)
        self.account.save(contractManager, to: self.contractManagerStorage)

        self.account.link<&Mapper>(self.linkAccountManager, target: self.accountManagerStorage)
        self.account.link<&Mapper>(self.linkContractManager, target: self.contractManagerStorage)
    }
}
