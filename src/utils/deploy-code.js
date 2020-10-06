import * as types from "@onflow/types";
import { sendTransaction } from "./interaction";

export const deployContract = async ({ to, contract, customDeployCode }) => {
  const code = Buffer.from(contract, "utf8").toString("hex");
  const deployCode =
    customDeployCode ||
    `
      transaction(code: String) {
        prepare(acct: AuthAccount) {
          acct.setCode(code.decodeHex())
        }
      }
    `;
  const args = [[code, types.String]];
  const signers = [to];
  return sendTransaction({ code: deployCode, args, signers });
};
