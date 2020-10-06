import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { invariant } from "./invariant";
import { authorization, pubFlowKey } from "./crypto";
import { withPrefix } from "./address";
import { executeScript, sendTransaction } from "./interaction";
import { getScriptCode, getTemplate, getTransactionCode } from "./file";
import { getPath, templateType } from "../manager";
import { get } from "./config";
import { config } from "@onflow/config";

export const createAccountRPC = async () => {
  const response = await fcl.send([
    fcl.transaction`
      transaction(pubKey: String) {
        prepare(acct: AuthAccount) {
          let account = AuthAccount(payer: acct)
          account.addPublicKey(pubKey.decodeHex())
        }
      }
    `,
    fcl.limit(999),
    fcl.proposer(authorization()),
    fcl.payer(authorization()),
    fcl.authorizations([authorization()]),
    fcl.args([fcl.arg(await pubFlowKey(), t.String)]),
  ]);

  const { events } = await fcl.tx(response).onceExecuted();
  const creationEvent = events.find((d) => d.type === "flow.AccountCreated");
  invariant(creationEvent, "No flow.AccountCreated event emitted", events);
  return withPrefix(creationEvent.data.address);
};

export const getAccount = async (name) => {
  console.log("get account with name:", name);
  const managerAccount = await config().get("MANAGER_ADDRESS");

  const addressMap = {
    FlowManager: managerAccount,
  };

  let accountAddress;
  try {
    const code = getScriptCode("get-account-address", addressMap);
    const args = [
      [name, t.String],
      [managerAccount, t.Address],
    ];
    accountAddress = await executeScript({
      code,
      args,
    });
    console.log({ accountAddress });
  } catch (e) {
    console.log(e);
  }

  if (accountAddress === null) {
    try {
      const code = getTransactionCode();
    }
  }

  /*
  const getContractCode = getTemplate(
    getPath("get-contract-address", SCRIPT),
    addressMap
  );
  const getAccountCode = getTemplate(
    getPath("get-account-address", SCRIPT),
    addressMap
  );
  const createAccountCode = getTemplate(
    getPath("create-account", TRANSACTION),
    addressMap
  );

  console.log({
    getContractCode,
    getAccountCode,
    createAccountCode,
  });
  // const txResponse = await sendTransaction({});

   */
};
