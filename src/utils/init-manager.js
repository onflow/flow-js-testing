import * as t from "@onflow/types";
import { getPath, templateType } from "../manager";
import {
  getContractCode,
  getScriptCode,
  getTemplate,
  getTransactionCode,
} from "./file";
import { pubFlowKey } from "./crypto";
import { executeScript, sendTransaction } from "./interaction";
import { config } from "@onflow/config";
import { withPrefix } from "./address";
import { invariant } from "./invariant";

export const initManager = async () => {
  const code = getTransactionCode("init-manager");
  const contractCode = getContractCode("FlowManager");

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
  const serviceAddress = withPrefix(await config().get("SERVICE_ADDRESS"));
  const code = getScriptCode("get-manager-address");
  console.log({ code, serviceAddress });
  return executeScript({
    code,
    args: [[serviceAddress, t.Address]],
  });
};
