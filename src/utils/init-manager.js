import * as t from "@onflow/types";
import { getContractCode, getScriptCode, getTransactionCode } from "./file";
import { pubFlowKey } from "./crypto";
import { executeScript, sendTransaction } from "./interaction";
import { config } from "@onflow/config";
import { withPrefix } from "./address";
import { invariant } from "./invariant";
import { set } from "./config";

export const initManager = async () => {
  const code = await getTransactionCode({
    name: "init-manager",
    service: true,
  });
  const contractCode = await getContractCode({
    name: "FlowManager",
    service: true,
  });

  const hexedContract = Buffer.from(contractCode, "utf8").toString("hex");
  const pubKey = await pubFlowKey();
  const args = [[pubKey, hexedContract, t.String]];

  const { events } = await sendTransaction({
    code,
    args,
  });

  const creationEvent = events.find((d) => d.type === "flow.AccountCreated");
  invariant(creationEvent, "No flow.AccountCreated event emitted", events);
  return withPrefix(creationEvent.data.address);
};

export const getManagerAddress = async () => {
  let managerAddress = await config().get("MANAGER_ADDRESS");

  if (!managerAddress) {
    const serviceAddress = withPrefix(await config().get("SERVICE_ADDRESS"));
    const code = await getScriptCode({
      name: "get-manager-address",
      service: true,
    });

    try {
      managerAddress = await executeScript({
        code,
        args: [[serviceAddress, t.Address]],
      });
      return managerAddress;
    } catch (e) {
      managerAddress = await initManager();

      set(
        "MANAGER_ADDRESS",
        process.env.MANAGER_ADDRESS,
        "accounts/manager/address",
        managerAddress
      );
      return managerAddress;
    }
  }
  return managerAddress;
};
