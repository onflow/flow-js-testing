import { getTemplate } from "..";
import path from "path";

const lowerFirst = (name) => {
  return name[0].toLowerCase() + name.slice(1);
};

export const makeMintTransaction = (name) => {
  const filePath = path.resolve(__dirname, "./transactions/mint_tokens.cdc");
  const code = getTemplate(filePath);
  const pattern = /(ExampleToken)/gi;

  return code.replace(pattern, (match) => {
    return match === "ExampleToken" ? name : lowerFirst(name);
  });
};

export const makeGetBalance = (name) => {
  const filePath = path.resolve(__dirname, "./scripts/get_balance.cdc");
  const code = getTemplate(filePath);
  const pattern = /(ExampleToken)/gi;

  return code.replace(pattern, (match) => {
    return match === "ExampleToken" ? name : lowerFirst(name);
  });
};
