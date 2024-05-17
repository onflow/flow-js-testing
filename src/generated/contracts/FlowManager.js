/** pragma type contract **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  // deployContract, // TODO broken, using our own version
  sendTransaction,
} from '@onflow/flow-cadut'

export const CODE = `
access(all) contract FlowManager {

    /// Account Manager
    access(all) event AccountAdded(address: Address)

    access(all) struct Mapper {
        access(all) let accounts: {String: Address}

        access(all) view fun getAddress(_ name: String): Address? {
            return self.accounts[name]
        }

        access(all) fun setAddress(_ name: String, address: Address){
            self.accounts[name] = address
            emit FlowManager.AccountAdded(address: address)
        }

        init(){
            self.accounts = {}
        }
    }

    access(all) view fun getAccountAddress(_ name: String): Address?{
        let accountManager = self.account
            .capabilities.borrow<&FlowManager.Mapper>(self.accountManagerPath)!

        return accountManager.getAddress(name)
    }

    access(all) let defaultAccounts: {Address : String}

    access(all) fun resolveDefaultAccounts(_ address: Address): Address{
        let alias = self.defaultAccounts[address]!
        return self.getAccountAddress(alias)!
    }

    access(all) let accountManagerStorage: StoragePath
    access(all) let contractManagerStorage: StoragePath
    access(all) let accountManagerPath: PublicPath
    access(all) let contractManagerPath: PublicPath

    /// Environment Manager
    access(all) event BlockOffsetChanged(offset: UInt64)
    access(all) event TimestampOffsetChanged(offset: UFix64)

    access(all) struct MockBlock {
        access(all) let id: [UInt8; 32]
        access(all) let height: UInt64
        access(all) let view: UInt64
        access(all) let timestamp: UFix64

        init(_ id: [UInt8; 32], _ height: UInt64, _ view: UInt64, _ timestamp: UFix64){
            self.id = id
            self.height = height
            self.view = view
            self.timestamp = timestamp
        }
    }

    access(all) fun setBlockOffset(_ offset: UInt64){
        self.blockOffset = offset
        emit FlowManager.BlockOffsetChanged(offset: offset)
    }

    access(all) fun setTimestampOffset(_ offset: UFix64){
        self.timestampOffset = offset
        emit FlowManager.TimestampOffsetChanged(offset: offset)
    }

    access(all) view fun getBlockHeight(): UInt64 {
        var block = getCurrentBlock()
        return block.height + self.blockOffset
    }

    access(all) view fun getBlockTimestamp(): UFix64 {
        var block = getCurrentBlock()
        return block.timestamp + self.timestampOffset
    }

    access(all) fun getBlock(): MockBlock {
        var block =  getCurrentBlock()
        let mockBlock = MockBlock(block.id, block.height, block.view, block.timestamp);
        return mockBlock
    }

    access(all) var blockOffset: UInt64;
    access(all) var timestampOffset: UFix64;


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

        self.accountManagerStorage = /storage/testSuiteAccountManager
        self.contractManagerStorage = /storage/testSuiteContractManager

        self.accountManagerPath = /public/testSuiteAccountManager
        self.contractManagerPath = /public/testSuiteContractManager

        // Destroy previously stored values
        self.account.storage.load<Mapper>(from: self.accountManagerStorage)
        self.account.storage.load<Mapper>(from: self.contractManagerStorage)

        self.account.storage.save(accountManager, to: self.accountManagerStorage)
        self.account.storage.save(contractManager, to: self.contractManagerStorage)


        self.account.capabilities.publish(
            self.account.capabilities.storage.issue<&Mapper>(
              self.accountManagerStorage
            ), at: self.accountManagerPath)

        self.account.capabilities.publish(
            self.account.capabilities.storage.issue<&Mapper>(
              self.contractManagerStorage
            ), at: self.contractManagerPath)
    }
}
 
`;

/**
* Method to generate cadence code for FlowManager contract
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const FlowManagerTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `FlowManager =>`)

  return replaceImportAddresses(CODE, fullMap);
};

// TODO copied from cadut and patched for Cadence 1.0
const deployContract = async props => {
  const {
    name,
    to,
    payer,
    proposer,
    code: contractCode,
    update = false,
    processed = false,
    addressMap = {},
  } = props

  // Update imprort statement with addresses from addressMap
  const ixContractCode = processed
    ? contractCode
    : replaceImportAddresses(contractCode, addressMap)

  // TODO: Implement arguments for "init" method
  const template = update ? `
    transaction(name: String, code: String) {
      prepare(acct: auth(AddContract) &Account) {
        let decoded = code.decodeHex()
        
        acct.contracts.add(
          name: name,
          code: decoded,
        )
      }
    }
  ` : `
  transaction(name: String, code: String){
    prepare(acct: auth(AddContract, UpdateContract) &Account) {
      let decoded = code.decodeHex()
      
      if acct.contracts.get(name: name) == nil {
        acct.contracts.add(name: name, code: decoded)
      } else {
        acct.contracts.update(name: name, code: decoded)
      }
    }
  }
`

  const hexedCode = Buffer.from(ixContractCode, "utf8").toString("hex")
  const args = [name, hexedCode]
  // Set roles
  let ixProposer = to
  let ixPayer = to
  let ixSigners = [to]

  if (payer) {
    ixPayer = payer
    ixProposer = proposer || payer
  }

  return await sendTransaction({
    payer: ixPayer,
    proposer: ixProposer,
    signers: ixSigners,
    code: template,
    args,
  });
}

/**
* Deploys FlowManager transaction to the network
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
* @param Array<*> args - list of arguments
* param Array<string> - list of signers
*/
export const  deployFlowManager = async (props) => {
  const { addressMap = {} } = props;
  const code = await FlowManagerTemplate(addressMap);
  const name = "FlowManager"

  return deployContract({ code, name, processed: true, ...props })
}
