import path from "path";

const SCRIPT = "./scripts/";
const TRANSACTION = "./transactions/";
const CONTRACT = "./contracts/";

export const templateType = {
  SCRIPT,
  TRANSACTION,
  CONTRACT,
};

export const getPath = (name, type = TRANSACTION) =>
  path.resolve(__dirname, `${type}/${name}.cdc`);
