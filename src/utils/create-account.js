import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { invariant } from "./invariant";
import { authorization, pubFlowKey } from "./crypto";
import { withPrefix } from "./address";
import { executeScript, sendTransaction } from "./interaction";
import { getScriptCode, getTemplate, getTransactionCode } from "./file";
import { getManagerAddress } from "./init-manager";

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

export const getAccountAddress = async (name) => {
  const managerAddress = await getManagerAddress();
  console.log({ managerAddress });

  const addressMap = {
    FlowManager: managerAddress,
  };

  let accountAddress;
  try {
    const code = await getScriptCode({
      name: "get-account-address",
      service: true,
      addressMap,
    });
    const args = [
      [name, t.String],
      [managerAddress, t.Address],
    ];
    accountAddress = await executeScript({
      code,
      args,
    });
    console.log({ accountAddress });
  } catch (e) {
    console.log("Error, when getting account address");
    console.log(e);
  }

  if (accountAddress === null) {
    try {
      const code = getTransactionCode({
        name: "create-account",
        service: true,
        addressMap,
      });
      const publicKey = await pubFlowKey();
      const args = [
        [name, publicKey, t.String],
        [managerAddress, t.Address],
      ];
      console.log({ code, args });
      const { events } = await sendTransaction({
        code,
        args,
      });
      console.log(events);
      const event = events.find((event) => event.type.includes("AccountAdded"));
      accountAddress = event.data.address;
    } catch (e) {
      console.log(e);
    }
  }

  return accountAddress;
};