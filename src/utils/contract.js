import * as t from "@onflow/types";
import { getManagerAddress } from "./init-manager";
import { getScriptCode } from "./file";
import { executeScript } from "./interaction";

export const getContractAddress = async (name) => {
  // TODO: Maybe try to automatically deploy contract? 🤔
  const managerAddress = await getManagerAddress();

  const addressMap = {
    FlowManager: managerAddress,
  };

  let contractAddress;
  try {
    const code = await getScriptCode({
      name: "get-contract-address",
      service: true,
      addressMap,
    });
    const args = [
      [name, t.String],
      [managerAddress, t.Address],
    ];
    contractAddress = await executeScript({
      code,
      args,
    });
  } catch (e) {
    console.log("Error, when getting account address");
    console.log(e);
  }

  return contractAddress;
};
