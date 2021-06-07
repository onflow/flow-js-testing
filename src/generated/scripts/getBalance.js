import { executeScript } from "../../";

import {
  getEnvironment,
  replaceImportAddresses,
  reportMissingImports,
  reportMissing,
} from "flow-cadut";

export const CODE = `
  // This script reads the balance field of an account's FlowToken Balance

import FungibleToken from 0xFUNGIBLETOKENADDRESS
import ExampleToken from 0xTOKENADDRESS

pub fun main(account: Address): UFix64 {
    let acct = getAccount(account)
    let vaultRef = acct.getCapability(/public/exampleTokenBalance)!.borrow<&ExampleToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance reference to the Vault")

    return vaultRef.balance
}
`;

/**
 * Method to generate cadence code for TestAsset
 * @param {Object.<string, string>} addressMap - contract name as a key and address where it's deployed as value
 */
export const getBalanceTemplate = async (addressMap = {}) => {
  const envMap = await getEnvironment();
  const fullMap = {
    ...envMap,
    ...addressMap,
  };

  // If there are any missing imports in fullMap it will be reported via console
  reportMissingImports(CODE, fullMap, `getBalance =>`);

  return replaceImportAddresses(CODE, fullMap);
};

export const getBalance = async ({ addressMap = {}, args = [] }) => {
  const code = await getBalanceTemplate(addressMap);

  reportMissing("arguments", args.length, 1, getBalance);

  return executeScript({ code, args });
};
