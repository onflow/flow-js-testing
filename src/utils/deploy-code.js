import * as t from "@onflow/types";
import { sendTransaction } from "./interaction";
import { getManagerAddress } from "./init-manager";
import { getContractCode, getTransactionCode } from "./file";
import { getAccountAddress } from "./create-account";

export const hexContract = (contract) =>
  Buffer.from(contract, "utf8").toString("hex");

export const deployContractByName = async ({ to, name }) => {
  const resolvedAddress = to || (await getAccountAddress());
  const contract = await getContractCode({ name });
  return deployContract({ to: resolvedAddress, contract, name });
};

export const deployContract = async ({ to, contract, name }) => {
  // TODO: extract name from contract code
  const managerAddress = await getManagerAddress();
  const contractCode = hexContract(contract);
  const addressMap = {
    FlowManager: managerAddress,
  };

  const code = await getTransactionCode({
    name: "deploy-contract",
    service: true,
    addressMap,
  });

  const args = [
    [name, contractCode, t.String],
    [managerAddress, t.Address],
  ];

  const signers = [to];

  return sendTransaction({
    code,
    args,
    signers,
  });
};
