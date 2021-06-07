import { deployContract } from "../../";

import { getEnvironment, replaceImportAddresses, reportMissingImports } from "flow-cadut";

export const CODE = `
  pub contract FlowManager {

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

    pub let accountManagerStorage: StoragePath
    pub let contractManagerStorage: StoragePath
    pub let accountManagerPath: PublicPath
    pub let contractManagerPath: PublicPath

    init(){
        let accountManager = Mapper()
        let contractManager = Mapper()

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
 
`;

/**
 * Method to generate Cadence code for FlowManager transaction
 * @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
 */
export const FlowManagerTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
    ...envMap,
    ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `FlowManager =>`);

  return replaceImportAddresses(CODE, fullMap);
};

/**
 * Deploys FlowManager transaction to the network
 * @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
 * @param Array<*> args - list of arguments
 * param Array<string> - list of signers
 */
export const FlowManager = async ({ addressMap = {}, args = [], to, update = false }) => {
  const code = await FlowManagerTemplate(addressMap);
  const name = "FlowManager";

  return deployContract({ code, args, to, update, name });
};
