import { defaultsByName } from "./file";
import { replaceImportAddresses } from "./imports";
import { executeScript, sendTransaction } from "./interaction";
import { makeGetBalance, makeMintTransaction, makeSetupVaultTransaction } from "./templates";

/**
 * Returns current FlowToken balance of account specified by address
 * @param {string} tokenName - name of the token to check
 * @param {string} address - address of account to check
 * @returns {Promise<*>}
 */
export const getTokenBalance = async (tokenName, address, addressMap = {}) => {
  const raw = await makeGetBalance(tokenName);
  const code = replaceImportAddresses(raw, {
    ...defaultsByName,
    ...addressMap
  });
  const args = [address];

  return executeScript({ code, args });
};

/**
 * Sends transaction to mint specified amount of FlowToken and send it to recipient.
 * Returns result of the transaction.
 * @param {string} tokenName - name of the token to mint
 * @param {string} recipient - address of recipient account
 * @param {string} amount - amount to mint and send
 * @returns {Promise<*>}
 */
export const mintToken = async (tokenName, recipient, amount, addressMap = {}) => {
  const raw = await makeMintTransaction(tokenName);
  const code = replaceImportAddresses(raw, {
    ...defaultsByName,
    ...addressMap
  });
  const args = [recipient, amount];
  return sendTransaction({ code, args });
};

/**
 * Creates a token vault and saves it to the account's storage with canonical naming
 * @param {string} tokenName - name of the token vault to set up (omit 'Vault')
 * @param {string} account address of the account
 * @param {object} addressMap additional contract address mappings
 * @returns {Promise<*>}
 */
export const setupVault = async (tokenName, account, addressMap = {}) => {
  const raw = await makeSetupVaultTransaction(tokenName);
  const code = replaceImportAddresses(raw, {
    ...defaultsByName,
    ...addressMap
  });
  const signers = [account];
  return sendTransaction({ code, signers });
}
