/**
 * Address map with access by name for contracts deployed to emulator by default.
 * @type {{FlowFees: string, FlowToken: string, FungibleToken: string}}
 */
export const defaultsByName = {
  FlowToken: "0x0ae53cb6e3f42a79",
  FungibleToken: "0xee82856bf20e2aa6",
  FlowFees: "0xe5a8b7f23e8b548f",
  FlowStorageFees: "0xf8d6e0586b0a20c7",
}

/**
 * Address map with access by address for contracts deployed to emulator by default.
 * @type {{"0xe5a8b7f23e8b548f": string, "0xf8d6e0586b0a20c7": string, "0xee82856bf20e2aa6": string, "0x0ae53cb6e3f42a79": string}}
 */
export const defaultsByAddress = {
  "0xe5a8b7f23e8b548f": "0xe5a8b7f23e8b548f", // FlowFees
  "0xf8d6e0586b0a20c7": "0xf8d6e0586b0a20c7", // FlowStorageFees
  "0x0ae53cb6e3f42a79": "0x0ae53cb6e3f42a79", // FlowToken
  "0xee82856bf20e2aa6": "0xee82856bf20e2aa6", // FungibleToken
}
