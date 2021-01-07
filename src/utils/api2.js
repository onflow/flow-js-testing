import {
  getAccountAddress,
  getTransactionCode,
  sendTransaction,
  deployContract,
  createFTVaultResourceForAcct,
  createNFTCollectionResourceForAcct,
  getFlowBalance,
} from "./index";

import { getContractCode } from "./file";

class TxFromFile {
  constructor(fileName) {
    this.fileName = fileName;
    this.importsMap = {};
    this.signingAccounts = [];
    this.code = "";
  }

  signers(...addressList) {
    this.signingAccounts = addressList;
    return this;
  }

  importing(addrMap) {
    this.importsMap = addrMap;
    return this;
  }
}
class FlowAcct {
  constructor(alias) {
    this.alias = alias;
    this.address = "";
  }

  async balance() {
    if (!this.address) {
      throw "Account has not been initialized";
    }
    try {
      const result = await getFlowBalance(this.address);
      return result;
    } catch (e) {
      throw e;
    }
  }

  async build() {
    this.address = await getAccountAddress(this.alias);
  }
}

class ContractFromFile {
  constructor(fileName) {
    this.fileName = fileName;
    this.addrMap = {};
    this.replaceMap = {};
  }
  replaceImports(addrMap) {
    this.addrMap = addrMap;
  }
  replace(replaceMap) {
    this.replaceMap = replaceMap;
  }
}

class DeployedContract {
  constructor(name, address, code) {
    this.name = name;
    this.address = address;
    this.code = code;
  }
}

const txFile = (fileName) => {
  return new TxFromFile(fileName);
};

const contractFile = (fileName) => {
  return new ContractFromFile(fileName);
};

const createFlowAccount = async (acctAlias) => {
  const acct = new FlowAcct(acctAlias);
  await acct.build();
  return acct;
};

/**
 * Deploys a contract to a given account.
 * @warning This will silently overwrite contracts with the same name
 * if already deployed to an account.
 *
 * @param {acct} FlowAcct - The account to deploy the contract to
 * @param {contract} ContractFromFile - An instance of a contract file
 *
 * @returns {DeployedContract} DeployedContract Instance
 */
const addContract = async (acct, contract) => {
  try {
    const code = await getContractCode({
      name: contract.fileName,
      addressMap: contract.addrMap,
    });

    await deployContract({
      to: acct.address,
      contract: code,
      name: contract.fileName,
    });

    return new DeployedContract(contract.fileName, acct.address, code);
  } catch (e) {
    console.log(e);
    return new Error(
      `Deploying ${contract.fileName} to ${acct.address} failed...`
    );
  }
};

const sendTx = async (tx) => {
  let code = await getTransactionCode({
    name: tx.fileName,
    addressMap: tx.importsMap,
  });

  if (tx.replaceMap) {
    for (const string in replaceMap) {
      code = code.replace(string, replaceMap[string]);
    }
  }

  const result = await sendTransaction({
    code: code,
    signers: tx.signingAccounts,
  });

  return result;
};

const addEmptyFTVault = async (acct, contract, vaultName) => {
  try {
    const result = await createFTVaultResourceForAcct(
      acct,
      contract,
      vaultName
    );
    return result;
  } catch (e) {
    throw e;
  }
};

const addEmptyNFTCollection = async (acct, contract, collectionName) => {
  try {
    const result = await createNFTCollectionResourceForAcct(
      acct,
      contract,
      collectionName
    );
    return result;
  } catch (e) {
    throw e;
  }
};

export {
  addEmptyNFTCollection,
  addEmptyFTVault,
  sendTx,
  addContract,
  createFlowAccount,
  contractFile,
  txFile,
};
