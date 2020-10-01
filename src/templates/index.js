import { getTemplate } from "..";

const lowerFirst = (name) => {
  return name[0].toLowerCase() + name.slice(1);
};

export const makeMintTransaction = (name) => {
  const code = getTemplate(`../templates/transactions/mint_tokens.cdc`);
  const pattern = /(ExampleToken)/gi;

  return code.replace(pattern, (match) => {
    return match === "ExampleToken" ? name : lowerFirst(name);
  });
};

export const makeGetBalance = (name) => {
  const code = getTemplate(`../templates/scripts/get_balance.cdc`);
  const pattern = /(ExampleToken)/gi;

  return code.replace(pattern, (match) => {
    return match === "ExampleToken" ? name : lowerFirst(name);
  });
};
