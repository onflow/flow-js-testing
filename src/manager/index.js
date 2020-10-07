import path from "path";
import { config } from "@onflow/config";

const SCRIPT = "./scripts/";
const TRANSACTION = "./transactions/";
const CONTRACT = "./contracts/";

export const templateType = {
  SCRIPT,
  TRANSACTION,
  CONTRACT,
};

export const getPath = async (name, type = TRANSACTION, serviceCode) => {
  const configBase = await config().get("BASE_PATH");
  const basePath = serviceCode ? __dirname : configBase;
  return path.resolve(basePath || __dirname, `${type}/${name}.cdc`);
};
