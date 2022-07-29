import path from "path"
import {describe} from "yargs"
import {
  emulator,
  init,
  getAccountAddress,
  getContractAddress,
  deployContractByName,
  getScriptCode,
  executeScript,
  sendTransaction,
  mintFlow,
  getFlowBalance,
  shallRevert,
  shallResolve,
  shallPass,
  shallThrow,
  createAccount,
  HashAlgorithm,
  SignatureAlgorithm,
} from "../src"
import {playgroundImport} from "../src/transformers"
import * as fcl from "@onflow/fcl"
import {ec as EC} from "elliptic"
import {validateKeyPair} from "./util/validate-key-pair"

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(10000)

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")
  await init(basePath)
  return emulator.start()
})

afterEach(async () => {
  emulator.stop()
})

it("createAccount - should work with name and resolves to correct getAccountAddress", async () => {
  const addr1 = await createAccount({
    name: "Billy",
  })

  const addr2 = await getAccountAddress("Billy")

  expect(addr1).toBe(addr2)
})

it("createAccount - should work without name and returns address", async () => {
  const Billy = await createAccount({
    name: "Billy",
  })

  expect(Billy).toMatch(/^0x[0-9a-f]{16}$/)
})

it("createAccount - should work with custom keys", async () => {
  const privateKey = "1234"
  const Billy = await createAccount({
    name: "Billy",
    keys: [
      {
        privateKey,
        hashAlgorithm: HashAlgorithm.SHA2_256,
        signatureAlgorithm: SignatureAlgorithm.ECDSA_secp256k1,
      },
      {
        privateKey,
      },
    ],
  })

  expect(Billy).toMatch(/^0x[0-9a-f]{16}$/)

  const keys = await fcl.account(Billy).then(d => d.keys)

  expect(keys.length).toBe(2)
  expect(keys[0].hashAlgoString).toBe("SHA2_256")
  expect(keys[0].signAlgoString).toBe("ECDSA_secp256k1")
  expect(keys[0].weight).toBe(1000)
  expect(validateKeyPair(keys[0].publicKey, privateKey, "secp256k1")).toBe(true)

  expect(keys.length).toBe(2)
  expect(keys[1].hashAlgoString).toBe("SHA3_256")
  expect(keys[1].signAlgoString).toBe("ECDSA_P256")
  expect(keys[1].weight).toBe(1000)
  expect(validateKeyPair(keys[1].publicKey, privateKey)).toBe(true)
})

it("createAccount - sshould add universal private key to account by default", async () => {
  const Billy = await createAccount({
    name: "Billy",
  })

  expect(Billy).toMatch(/^0x[0-9a-f]{16}$/)
})

it("getAccountAddress - should return proper playground addresses", async () => {
  const accounts = ["Alice", "Bob", "Charlie", "Dave", "Eve"]
  for (const i in accounts) {
    await getAccountAddress(accounts[i])
  }

  const code = `
        pub fun main(address:Address):Address{
          return getAccount(address).address
        } 
      `

  const playgroundAddresses = ["0x01", "0x02", "0x03", "0x04", "0x05"]
  for (const i in playgroundAddresses) {
    const [result] = await executeScript({
      code,
      transformers: [playgroundImport(accounts)],
      args: [playgroundAddresses[i]],
    })
    const account = await getAccountAddress(accounts[i])
    expect(result).toBe(account)
  }
})

it("getAccountAddress - should create an account if does not exist", async () => {
  const Billy = await getAccountAddress("Billy")

  expect(Billy).toMatch(/^0x[0-9a-f]{16}$/)
})

it("getAccountAddress - should resolve an already created account", async () => {
  const Billy1 = await getAccountAddress("Billy")
  const Billy2 = await getAccountAddress("Billy")

  expect(Billy1).toMatch(/^0x[0-9a-f]{16}$/)
  expect(Billy1).toMatch(Billy2)
})
