/** pragma type script **/

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
} from '@onflow/flow-cadut'
import { executeScript } from '../../interaction'

export const CODE = `
// This script reads the balance field
// of an account's ExampleToken Balance

import FungibleToken from 0x1
import ExampleToken from 0x1
import FungibleTokenMetadataViews from 0x1

access(all) fun main(address: Address): UFix64 {
    let vaultData = ExampleToken.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
        ?? panic("Could not get vault data view for the contract")

    return getAccount(address).capabilities.borrow<&{FungibleToken.Balance}>(
            vaultData.metadataPath
        )?.balance
        ?? panic("Could not borrow Balance reference to the Vault")
}
`;

/**
* Method to generate cadence code for getBalance script
* @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
*/
export const getBalanceTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
  ...envMap,
  ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `getBalance =>`)

  return replaceImportAddresses(CODE, fullMap);
};

export const getBalance = async (props = {}) => {
  const { addressMap = {}, args = [] } = props
  const code = await getBalanceTemplate(addressMap);

  reportMissing("arguments", args.length, 1, `getBalance =>`);

  return executeScript({code, processed: true, ...props})
}
