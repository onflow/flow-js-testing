const getPairs = (line) => {
  return line
    .split(/\s/)
    .map((item) => item.replace(/\s/g, ""))
    .filter((item) => item.length > 0 && item !== "import" && item !== "from");
};

const collect = (acc, item) => {
  const [contract, address] = item;
  acc[contract] = address;
  return acc;
};

export const extractImports = (code) => {
  return code
    .split("\n")
    .filter((line) => line.includes("import"))
    .map(getPairs)
    .reduce(collect, {});
};

export const replaceImports = (code, addressMap) => {
  return code.replace(
    /(\s*import\s*)([\w\d]+)(\s+from\s*)([\w\d]+)/g,
    (match, imp, contract, from) => {
      const newAddress =
        addressMap instanceof Function
          ? addressMap(contract)
          : addressMap[contract];
      return `${imp}${contract}${from}${newAddress}`;
    }
  );
};

export const replaceImportAddresses = (code, addressMap, byName = true) => {
  return code.replace(
    /(\s*import\s*)([\w\d]+)(\s+from\s*)([\w\d]+)/g,
    (match, imp, contract, _, address) => {
      const key = byName ? contract : address
      const newAddress =
        addressMap instanceof Function
          ? addressMap(key)
          : addressMap[key];
      return `${imp}${contract} from ${newAddress}`;
    }
  );
};
